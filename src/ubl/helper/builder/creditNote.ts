import {
  UBLJsonCreditNoteDocumentV1_0,
  UBLJsonCreditNoteDocumentV1_1,
  UBLJsonCreditNoteV1_0_Content,
  UBLJsonCreditNoteV1_1_Content,
} from "../../json/creditNote";
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonExtensions, // Added
  UBLJsonInvoiceLine,
  UBLJsonItem,
  UBLJsonLegalMonetaryTotal,
  UBLJsonShipment,
  UBLJsonTaxSubtotal,
  UBLJsonTaxTotal,
} from "../../json/ubl_json";

import { CreateCreditNoteDocumentParams } from "../params/creditNote"; // Import credit note specific parameters
import {
  buildAllowanceCharges,
  buildBillingReferences,
  buildCustomerParty,
  buildPostalAddressFromAddressParam,
  buildSupplier,
  toUblCurrencyAmount,
  toUblDate,
  toUblIdentifier,
  toUblNumeric,
  toUblText,
  toUblTime,
} from "./common"; // Import common builder helpers
import { buildSignatureExtension } from "./signatureExtension"; // Added

/**
 * Asynchronously creates a UBL Credit Note JSON document (supports v1.0 and v1.1) from user-friendly parameters.
 * If `signature` parameters are provided for a v1.1 credit note, this function will internally call
 * an asynchronous signature generation process.
 * This function simplifies the construction of complex UBL JSON structures by:
 * - Using clear, high-level parameter objects (`CreateCreditNoteDocumentParams`).
 * - Handling the repetitive array and object wrapping required by UBL JSON.
 * - Setting default values for common UBL attributes (e.g., `listID`, `schemeAgencyID`).
 * - Setting the `InvoiceTypeCode` specifically to "02" for Credit Notes.
 * - Including `BillingReference` to link back to the original invoice(s).
 * - Differentiating between Credit Note v1.0 and v1.1 structures (e.g., presence of `UBLExtensions` and `Signature`).
 *
 * Developers can use this builder to easily generate compliant UBL JSON credit notes without needing to
 * understand all the intricacies of the UBL JSON format directly. For more advanced scenarios or
 * customization beyond what the parameters offer, developers can still construct or modify the
 * `UBLJsonCreditNoteDocumentV1_0` or `UBLJsonCreditNoteDocumentV1_1` objects manually.
 *
 * @param params The {@link CreateCreditNoteDocumentParams} object containing all necessary credit note data.
 * @param version Specifies the UBL e-Invoice version to generate ("1.0" or "1.1"). Defaults to "1.1".
 * @returns A Promise that resolves to the constructed UBL Credit Note JSON document (`UBLJsonCreditNoteDocumentV1_0` or `UBLJsonCreditNoteDocumentV1_1`).
 * @example
 * ```typescript
 * import { createUblJsonCreditNoteDocument } from "./ubl/helper/builder/creditNote";
 * import { CreateCreditNoteDocumentParams } from "./ubl/helper/params/creditNote";
 *
 * const creditNoteParams: CreateCreditNoteDocumentParams = {
 *   id: "CN2024-001",
 *   issueDate: "2024-08-01",
 *   issueTime: "11:00:00Z",
 *   documentCurrencyCode: "MYR",
 *   supplier: { TIN: "S_TIN", identificationNumber: "S_ID", identificationScheme: "BRN", legalName: "Supplier", address: { addressLines: ["S Addr"], cityName: "KL", countryCode: "MYS", countrySubentityCode: "14" } },
 *   customer: { TIN: "C_TIN", identificationNumber: "C_ID", identificationScheme: "NRIC", legalName: "Customer", address: { addressLines: ["C Addr"], cityName: "PJ", countryCode: "MYS", countrySubentityCode: "10" } },
 *   billingReferences: [{ invoiceId: "INV2024-001", invoiceIssueDate: "2024-07-30" }],
 *   creditNoteLines: [{ id: "1", quantity: 1, subtotal: 50, itemDescription: "Credit Item", itemCommodityClassification: { code: "001" }, unitPrice: 50 }],
 *   taxTotal: { totalTaxAmount: 0, taxSubtotals: [] },
 *   legalMonetaryTotal: { lineExtensionAmount: 50, taxExclusiveAmount: 50, taxInclusiveAmount: 50, payableAmount: 50 },
 *   // Optionally, include signature parameters for v1.1
 *   // signature: { ... }
 * };
 *
 * // Example of creating a credit note (assuming an async context to use await)
 * async function generateCreditNotes() {
 *   // Create a version 1.1 credit note
 *   const ublCreditNoteV1_1 = await createUblJsonCreditNoteDocument(creditNoteParams, "1.1");
 *   console.log("Generated UBL Credit Note v1.1:", ublCreditNoteV1_1);
 *
 *   // Create a version 1.0 credit note (signature is ignored)
 *   const ublCreditNoteV1_0 = await createUblJsonCreditNoteDocument(creditNoteParams, "1.0");
 *   console.log("Generated UBL Credit Note v1.0:", ublCreditNoteV1_0);
 * }
 * ```
 */
export async function createUblJsonCreditNoteDocument(
  params: CreateCreditNoteDocumentParams,
  version: "1.1" | "1.0" = "1.1"
): Promise<UBLJsonCreditNoteDocumentV1_0 | UBLJsonCreditNoteDocumentV1_1> {
  const docCurrency = params.documentCurrencyCode;
  const taxCurrency = params.taxCurrencyCode ?? docCurrency;

  const supplierParty = buildSupplier(params.supplier);
  const customerParty = buildCustomerParty(params.customer);

  const accountingSupplierParty: UBLJsonAccountingSupplierParty = {
    Party: [supplierParty],
  };
  if (params.supplier.additionalAccountId) {
    accountingSupplierParty.AdditionalAccountId = [
      { _: params.supplier.additionalAccountId },
    ];
  }

  const accountingCustomerParty: UBLJsonAccountingCustomerParty = {
    Party: [customerParty],
  };

  const billingReferences = buildBillingReferences(params.billingReferences);

  const creditNoteLines: UBLJsonInvoiceLine[] = params.creditNoteLines.map(
    (lineParam) => {
      let lineTaxTotals: UBLJsonTaxTotal[] | undefined;
      if (lineParam.lineTaxTotal) {
        const subTotals: UBLJsonTaxSubtotal[] =
          lineParam.lineTaxTotal.taxSubtotals.map((st) => ({
            TaxableAmount: toUblCurrencyAmount(st.taxableAmount, taxCurrency)!,
            TaxAmount: toUblCurrencyAmount(st.taxAmount, taxCurrency)!,
            TaxCategory: [
              {
                ID: [{ _: st.taxCategoryCode }],
                TaxScheme: [
                  { ID: [{ _: "UN/ECE 5153", schemeAgencyID: "6" }] },
                ],
              },
            ],
            Percent: toUblNumeric(st.percent),
          }));
        lineTaxTotals = [
          {
            TaxAmount: toUblCurrencyAmount(
              lineParam.lineTaxTotal.taxAmount,
              taxCurrency
            )!,
            TaxSubtotal: subTotals,
          },
        ];
      }

      const item: UBLJsonItem = {
        CommodityClassification: [
          {
            ItemClassificationCode: [
              {
                _: lineParam.itemCommodityClassification.code,
                listID: lineParam.itemCommodityClassification.listID ?? "CLASS",
              },
            ],
          },
        ],
        Description: toUblText(lineParam.itemDescription),
      };

      return {
        ID: [{ _: lineParam.id }],
        InvoicedQuantity: [
          { _: lineParam.quantity, unitCode: lineParam.unitCode },
        ],
        LineExtensionAmount: toUblCurrencyAmount(
          lineParam.subtotal,
          docCurrency
        )!,
        TaxTotal: lineTaxTotals,
        Item: [item],
        Price: [
          {
            PriceAmount: toUblCurrencyAmount(lineParam.unitPrice, docCurrency)!,
          },
        ],
        AllowanceCharge: buildAllowanceCharges(
          lineParam.allowanceCharges,
          docCurrency
        ),
        ItemPriceExtension: [
          {
            Amount: toUblCurrencyAmount(lineParam.subtotal, docCurrency)!,
          },
        ],
      };
    }
  );

  const taxTotal: UBLJsonTaxTotal[] = [
    {
      TaxAmount: toUblCurrencyAmount(
        params.taxTotal.totalTaxAmount,
        taxCurrency
      )!,
      TaxSubtotal: params.taxTotal.taxSubtotals.map((st) => ({
        TaxableAmount: toUblCurrencyAmount(st.taxableAmount, taxCurrency)!,
        TaxAmount: toUblCurrencyAmount(st.taxAmount, taxCurrency)!,
        TaxCategory: [
          {
            ID: [{ _: st.taxCategoryCode }],
            TaxScheme: [{ ID: [{ _: "UN/ECE 5153", schemeAgencyID: "6" }] }],
          },
        ],
        Percent: toUblNumeric(st.percent),
      })),
      RoundingAmount: toUblCurrencyAmount(
        params.taxTotal.roundingAmount,
        taxCurrency
      ),
    },
  ];

  const legalMonetaryTotal: UBLJsonLegalMonetaryTotal[] = [
    {
      LineExtensionAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.lineExtensionAmount,
        docCurrency
      )!,
      TaxExclusiveAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.taxExclusiveAmount,
        docCurrency
      )!,
      TaxInclusiveAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.taxInclusiveAmount,
        docCurrency
      )!,
      AllowanceTotalAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.allowanceTotalAmount,
        docCurrency
      ),
      ChargeTotalAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.chargeTotalAmount,
        docCurrency
      ),
      PrepaidAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.prepaidAmount,
        docCurrency
      ),
      PayableRoundingAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.payableRoundingAmount,
        docCurrency
      ),
      PayableAmount: toUblCurrencyAmount(
        params.legalMonetaryTotal.payableAmount,
        docCurrency
      )!,
    },
  ];

  let creditNoteContent:
    | UBLJsonCreditNoteV1_0_Content
    | UBLJsonCreditNoteV1_1_Content = {
    ID: [{ _: params.id }],
    IssueDate: [{ _: params.issueDate }],
    IssueTime: [{ _: params.issueTime }],
    InvoiceTypeCode: [{ _: "02", listVersionID: version }], // Credit Note type code
    DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
    TaxCurrencyCode: params.taxCurrencyCode
      ? [{ _: params.taxCurrencyCode }]
      : undefined,
    AccountingSupplierParty: [accountingSupplierParty],
    AccountingCustomerParty: [accountingCustomerParty],
    BillingReference: billingReferences,
    InvoiceLine: creditNoteLines,
    TaxTotal: taxTotal,
    LegalMonetaryTotal: legalMonetaryTotal,
    InvoicePeriod: params.creditNotePeriod?.map((ip) => ({
      StartDate: toUblDate(ip.startDate),
      EndDate: toUblDate(ip.endDate),
      Description: toUblText(ip.description),
    })),
    AdditionalDocumentReference: params.additionalDocumentReferences?.map(
      (adr) => ({
        ID: [{ _: adr.id }],
        DocumentType: toUblText(adr.documentType),
        DocumentDescription: toUblText(adr.documentDescription),
      })
    ),
    Delivery: params.delivery?.map((d) => {
      const deliveryParty = [];
      if (d.partyName || d.address) {
        const partyLegalEntities = [];
        if (d.partyName) {
          partyLegalEntities.push({
            RegistrationName: toUblText(d.partyName),
          });
        }
        const deliveryPostalAddressArray = d.address
          ? [buildPostalAddressFromAddressParam(d.address)]
          : undefined;

        deliveryParty.push({
          PartyLegalEntity:
            partyLegalEntities.length > 0 ? partyLegalEntities : undefined,
          PostalAddress: deliveryPostalAddressArray,
        });
      }
      const shipment: UBLJsonShipment[] = [];
      if (d.shipmentId) {
        shipment.push({ ID: toUblIdentifier(d.shipmentId)! });
      }

      return {
        DeliveryParty: deliveryParty.length > 0 ? deliveryParty : undefined,
        Shipment: shipment.length > 0 ? shipment : undefined,
      };
    }),
    PaymentMeans: params.paymentMeans?.map((pm) => ({
      PaymentMeansCode: [{ _: pm.paymentMeansCode }],
      PayeeFinancialAccount: pm.payeeFinancialAccountId
        ? [{ ID: [{ _: pm.payeeFinancialAccountId }] }]
        : undefined,
    })),
    PaymentTerms: params.paymentTerms?.map((pt) => ({
      Note: [{ _: pt.note }],
    })),
    PrepaidPayment: params.prepaidPayments?.map((pp) => ({
      ID: toUblIdentifier(pp.id),
      PaidAmount: toUblCurrencyAmount(pp.paidAmount, docCurrency)!,
      PaidDate: toUblDate(pp.paidDate),
      PaidTime: toUblTime(pp.paidTime),
    })),
    AllowanceCharge: buildAllowanceCharges(
      params.allowanceCharges,
      docCurrency
    ),
  };

  if (version === "1.1") {
    let finalExtensionsArray: UBLJsonExtensions = [];

    if (params.signature) {
      const tempCreditNoteContentForSigning: Omit<
        UBLJsonCreditNoteV1_1_Content,
        "Signature"
      > = {
        ID: creditNoteContent.ID,
        IssueDate: creditNoteContent.IssueDate,
        IssueTime: creditNoteContent.IssueTime,
        InvoiceTypeCode: creditNoteContent.InvoiceTypeCode,
        DocumentCurrencyCode: creditNoteContent.DocumentCurrencyCode,
        TaxCurrencyCode: creditNoteContent.TaxCurrencyCode,
        AccountingSupplierParty: creditNoteContent.AccountingSupplierParty,
        AccountingCustomerParty: creditNoteContent.AccountingCustomerParty,
        BillingReference: (creditNoteContent as UBLJsonCreditNoteV1_1_Content)
          .BillingReference,
        InvoiceLine: creditNoteContent.InvoiceLine,
        TaxTotal: creditNoteContent.TaxTotal,
        LegalMonetaryTotal: creditNoteContent.LegalMonetaryTotal,
        InvoicePeriod: creditNoteContent.InvoicePeriod,
        AdditionalDocumentReference:
          creditNoteContent.AdditionalDocumentReference,
        Delivery: creditNoteContent.Delivery,
        PaymentMeans: creditNoteContent.PaymentMeans,
        PaymentTerms: creditNoteContent.PaymentTerms,
        PrepaidPayment: creditNoteContent.PrepaidPayment,
        AllowanceCharge: creditNoteContent.AllowanceCharge,
        UBLExtensions: [], // For signing, UBLExtensions should be empty or contain only pre-existing ones.
      };

      // The documentToSign structure mimics the final output structure for Credit Notes,
      // which uses an "Invoice" root element and schema as per MyInvois specifications.
      const documentToSign: UBLJsonCreditNoteDocumentV1_1 = {
        _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // MyInvois specific for CN
        _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
        // UBLJsonCreditNoteDocumentV1_1 should have 'Invoice' as its main content key
        // if it's to match this structure.
        Invoice: [
          tempCreditNoteContentForSigning as UBLJsonCreditNoteV1_1_Content,
        ],
      };

      const signatureExtensionInstance = await buildSignatureExtension({
        ...params.signature,
        documentToSign: documentToSign,
      });
      finalExtensionsArray.push({
        UBLExtension: [signatureExtensionInstance],
      });

      (creditNoteContent as UBLJsonCreditNoteV1_1_Content).Signature = [
        {
          ID: [
            {
              _:
                params.signature.signatureId ??
                "urn:oasis:names:specification:ubl:signature:CreditNote", // Default for CreditNote
            },
          ],
          SignatureMethod: params.signature.extensionUri
            ? [{ _: params.signature.extensionUri }]
            : [{ _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades" }],
        },
      ];
    }
    (creditNoteContent as UBLJsonCreditNoteV1_1_Content).UBLExtensions =
      finalExtensionsArray;
  }

  // Root UBL JSON structure for Credit Note (using "Invoice" as root element based on observed MyInvois requirements)
  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // Per MyInvois, even for Credit Notes
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [creditNoteContent], // Note: The root element is 'Invoice'
  };
}
