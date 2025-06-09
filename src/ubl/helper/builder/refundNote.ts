import {
  UBLJsonRefundNoteDocumentV1_0,
  UBLJsonRefundNoteDocumentV1_1,
  UBLJsonRefundNoteV1_0_Content,
  UBLJsonRefundNoteV1_1_Content,
} from "../../json/refundNote"; // Updated import
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonExtensions,
  UBLJsonInvoiceLine, // InvoiceLine is generic enough for RefundNoteLine
  UBLJsonItem,
  UBLJsonLegalMonetaryTotal,
  UBLJsonShipment,
  UBLJsonTaxSubtotal,
  UBLJsonTaxTotal,
} from "../../json/ubl_json";

import { CreateRefundNoteDocumentParams } from "../params/refundNote"; // Updated import
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
} from "./common";
import { buildSignatureExtension } from "./signatureExtension";

/**
 * Asynchronously creates a UBL Refund Note JSON document (supports v1.0 and v1.1) from user-friendly parameters.
 * If `signature` parameters are provided for a v1.1 refund note, this function will internally call
 * an asynchronous signature generation process.
 * This function simplifies the construction of complex UBL JSON structures by:
 * - Using clear, high-level parameter objects (`CreateRefundNoteDocumentParams`).
 * - Handling the repetitive array and object wrapping required by UBL JSON.
 * - Setting default values for common UBL attributes (e.g., `listID`, `schemeAgencyID`).
 * - Setting the `InvoiceTypeCode` specifically to "383" for Refund Notes.
 * - Including `BillingReference` to link back to the original invoice(s) being refunded.
 * - Differentiating between Refund Note v1.0 and v1.1 structures (e.g., presence of `UBLExtensions` and `Signature`).
 *
 * Developers can use this builder to easily generate compliant UBL JSON refund notes without needing to
 * understand all the intricacies of the UBL JSON format directly. For more advanced scenarios or
 * customization beyond what the parameters offer, developers can still construct or modify the
 * `UBLJsonRefundNoteDocumentV1_0` or `UBLJsonRefundNoteDocumentV1_1` objects manually.
 *
 * @param params The {@link CreateRefundNoteDocumentParams} object containing all necessary refund note data.
 * @param version Specifies the UBL e-Invoice version to generate ("1.0" or "1.1"). Defaults to "1.1".
 * @returns A Promise that resolves to the constructed UBL Refund Note JSON document (`UBLJsonRefundNoteDocumentV1_0` or `UBLJsonRefundNoteDocumentV1_1`).
 * @example
 * ```typescript
 * import { createUblJsonRefundNoteDocument } from "./ubl/helper/builder/refundNote";
 * import { CreateRefundNoteDocumentParams } from "./ubl/helper/params/refundNote";
 *
 * const refundNoteParams: CreateRefundNoteDocumentParams = {
 *   id: "RN2024-001",
 *   issueDate: "2024-08-01",
 *   issueTime: "11:00:00Z",
 *   documentCurrencyCode: "MYR",
 *   supplier: { TIN: "S_TIN", identificationNumber: "S_ID", identificationScheme: "BRN", legalName: "Supplier Co", address: { addressLines: ["S Addr"], cityName: "KL", countryCode: "MYS", countrySubentityCode: "14" } },
 *   customer: { TIN: "C_TIN", identificationNumber: "C_ID", identificationScheme: "NRIC", legalName: "Customer Ltd", address: { addressLines: ["C Addr"], cityName: "PJ", countryCode: "MYS", countrySubentityCode: "10" } },
 *   billingReferences: [{ invoiceId: "INV2024-001", invoiceIssueDate: "2024-07-30" }],
 *   refundNoteLines: [{ id: "1", quantity: 1, subtotal: 50, itemDescription: "Refunded Item", itemCommodityClassification: { code: "001" }, unitPrice: 50 }],
 *   taxTotal: { totalTaxAmount: 0, taxSubtotals: [] },
 *   legalMonetaryTotal: { lineExtensionAmount: 50, taxExclusiveAmount: 50, taxInclusiveAmount: 50, payableAmount: 50 },
 *   // Optionally, include signature parameters for v1.1
 *   // signature: { certificatePem: "...", privateKeyPem: "...", documentToSign: {} }
 * };
 *
 * // Example of creating a refund note (assuming an async context to use await)
 * async function generateRefundNotes() {
 *   // Create a version 1.1 refund note
 *   const ublRefundNoteV1_1 = await createUblJsonRefundNoteDocument(refundNoteParams, "1.1");
 *   console.log("Generated UBL Refund Note v1.1:", ublRefundNoteV1_1);
 *
 *   // Create a version 1.0 refund note (signature is ignored)
 *   const ublRefundNoteV1_0 = await createUblJsonRefundNoteDocument(refundNoteParams, "1.0");
 *   console.log("Generated UBL Refund Note v1.0:", ublRefundNoteV1_0);
 * }
 * ```
 */
export async function createUblJsonRefundNoteDocument(
  params: CreateRefundNoteDocumentParams,
  version: "1.1" | "1.0" = "1.1"
): Promise<UBLJsonRefundNoteDocumentV1_0 | UBLJsonRefundNoteDocumentV1_1> {
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

  const refundNoteLines: UBLJsonInvoiceLine[] = params.refundNoteLines.map(
    // Updated param name
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
          // Note: UBL uses InvoicedQuantity even for credit/refund notes
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

  let refundNoteContent:
    | UBLJsonRefundNoteV1_0_Content
    | UBLJsonRefundNoteV1_1_Content = {
    ID: [{ _: params.id }],
    IssueDate: [{ _: params.issueDate }],
    IssueTime: [{ _: params.issueTime }],
    InvoiceTypeCode: [{ _: "04", listVersionID: version }],
    DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
    TaxCurrencyCode: params.taxCurrencyCode
      ? [{ _: params.taxCurrencyCode }]
      : undefined,
    AccountingSupplierParty: [accountingSupplierParty],
    AccountingCustomerParty: [accountingCustomerParty],
    BillingReference: billingReferences,
    InvoiceLine: refundNoteLines, // Updated variable name
    TaxTotal: taxTotal,
    LegalMonetaryTotal: legalMonetaryTotal,
    InvoicePeriod: params.refundNotePeriod?.map((ip) => ({
      // Updated param name
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
      // Create a temporary content object for signing, excluding Signature itself
      const tempRefundNoteContentForSigning: Omit<
        UBLJsonRefundNoteV1_1_Content,
        "Signature" // Ensure Signature is omitted if it was part of the base content type
      > = {
        // Explicitly list all properties from refundNoteContent, matching UBLJsonRefundNoteV1_1_Content (excluding Signature, UBLExtensions)
        ID: refundNoteContent.ID,
        IssueDate: refundNoteContent.IssueDate,
        IssueTime: refundNoteContent.IssueTime,
        InvoiceTypeCode: refundNoteContent.InvoiceTypeCode,
        DocumentCurrencyCode: refundNoteContent.DocumentCurrencyCode,
        TaxCurrencyCode: refundNoteContent.TaxCurrencyCode,
        AccountingSupplierParty: refundNoteContent.AccountingSupplierParty,
        AccountingCustomerParty: refundNoteContent.AccountingCustomerParty,
        BillingReference: (refundNoteContent as UBLJsonRefundNoteV1_1_Content)
          .BillingReference, // Cast if BillingReference is specific to V1_1 or different in V1_0
        InvoiceLine: refundNoteContent.InvoiceLine,
        TaxTotal: refundNoteContent.TaxTotal,
        LegalMonetaryTotal: refundNoteContent.LegalMonetaryTotal,
        InvoicePeriod: refundNoteContent.InvoicePeriod,
        AdditionalDocumentReference:
          refundNoteContent.AdditionalDocumentReference,
        Delivery: refundNoteContent.Delivery,
        PaymentMeans: refundNoteContent.PaymentMeans,
        PaymentTerms: refundNoteContent.PaymentTerms,
        PrepaidPayment: refundNoteContent.PrepaidPayment,
        AllowanceCharge: refundNoteContent.AllowanceCharge,
        UBLExtensions: [], // For signing, UBLExtensions should be empty or contain only pre-existing non-signature ones.
      };

      // The documentToSign structure mimics the final output structure for Refund Notes,
      // which uses an "Invoice" root element and schema as per MyInvois specifications.
      const documentToSign: UBLJsonRefundNoteDocumentV1_1 = {
        _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // MyInvois specific for RN (uses Invoice schema)
        _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
        Invoice: [
          tempRefundNoteContentForSigning as UBLJsonRefundNoteV1_1_Content, // Cast to the specific V1_1 content type
        ],
      };

      const signatureExtensionInstance = await buildSignatureExtension({
        ...params.signature,
        documentToSign: documentToSign,
      });
      finalExtensionsArray.push({
        UBLExtension: [signatureExtensionInstance],
      });

      (refundNoteContent as UBLJsonRefundNoteV1_1_Content).Signature = [
        {
          ID: [
            {
              _:
                params.signature.signatureId ??
                "urn:oasis:names:specification:ubl:signature:Invoice",
            },
          ],
          SignatureMethod: params.signature.extensionUri
            ? [{ _: params.signature.extensionUri }]
            : [{ _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades" }],
        },
      ];
    }
    (refundNoteContent as UBLJsonRefundNoteV1_1_Content).UBLExtensions =
      finalExtensionsArray;
  }

  // Root UBL JSON structure for Refund Note (using "Invoice" as root element based on MyInvois requirements)
  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // Per MyInvois, even for Refund Notes
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [refundNoteContent], // Note: The root element is 'Invoice'
  };
}
