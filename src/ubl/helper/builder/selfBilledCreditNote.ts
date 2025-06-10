import {
  UBLJsonCreditNoteDocumentV1_0,
  UBLJsonCreditNoteDocumentV1_1,
  UBLJsonCreditNoteV1_0_Content,
  UBLJsonCreditNoteV1_1_Content,
} from "../../json/creditNote";
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonExtensions,
  UBLJsonInvoiceLine,
  UBLJsonItem,
  UBLJsonLegalMonetaryTotal,
  UBLJsonShipment,
  UBLJsonTaxSubtotal,
  UBLJsonTaxTotal,
} from "../../json/ubl_json";

import { CreateCreditNoteDocumentParams } from "../params/creditNote";
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
 * Asynchronously creates a UBL Self-Billed Credit Note JSON document (supports v1.0 and v1.1) from user-friendly parameters.
 * This function is similar to the credit note builder but sets the InvoiceTypeCode to "06" for Self-Billed Credit Notes.
 * If `signature` parameters are provided for a v1.1 document, this function will internally call
 * an asynchronous signature generation process.
 * This function simplifies the construction of complex UBL JSON structures by:
 * - Using clear, high-level parameter objects (`CreateCreditNoteDocumentParams`).
 * - Handling the repetitive array and object wrapping required by UBL JSON.
 * - Setting default values for common UBL attributes (e.g., `listID`, `schemeAgencyID`).
 * - Setting the `InvoiceTypeCode` specifically to "06" for Self-Billed Credit Notes.
 * - Including `BillingReference` to link back to the original invoice(s).
 * - Differentiating between v1.0 and v1.1 structures (e.g., presence of `UBLExtensions` and `Signature`).
 *
 * Developers can use this builder to easily generate compliant UBL JSON self-billed credit notes without needing to
 * understand all the intricacies of the UBL JSON format directly. For more advanced scenarios or
 * customization beyond what the parameters offer, developers can still construct or modify the
 * `UBLJsonCreditNoteDocumentV1_0` or `UBLJsonCreditNoteDocumentV1_1` objects manually (assuming these are the correct underlying types).
 *
 * @param params The {@link CreateCreditNoteDocumentParams} object containing all necessary data.
 * @param version Specifies the UBL e-Invoice version to generate ("1.0" or "1.1"). Defaults to "1.1".
 * @returns A Promise that resolves to the constructed UBL Self-Billed Credit Note JSON document (`UBLJsonCreditNoteDocumentV1_0` or `UBLJsonCreditNoteDocumentV1_1`).
 * @example
 * ```typescript
 * import { createUblJsonSelfBilledCreditNoteDocument } from "./ubl/helper/builder/selfBilledCreditNote";
 * import { CreateCreditNoteDocumentParams } from "./ubl/helper/params/creditNote"; // Assuming same params
 *
 * const selfBilledCreditNoteParams: CreateCreditNoteDocumentParams = {
 *   id: "SBCN2024-001",
 *   issueDate: "2024-08-15",
 *   issueTime: "10:00:00Z",
 *   documentCurrencyCode: "MYR",
 *   // For self-billed, the 'supplier' is the one issuing the document (customer in original transaction)
 *   // and 'customer' is the one receiving the document (supplier in original transaction).
 *   // Ensure roles are correctly assigned based on self-billing context.
 *   supplier: { TIN: "BUYER_TIN", identificationNumber: "BUYER_ID", identificationScheme: "BRN", legalName: "Buyer Company (Self-Billing)", address: { addressLines: ["Buyer Addr"], cityName: "KL", countryCode: "MYS", countrySubentityCode: "14" } },
 *   customer: { TIN: "SELLER_TIN", identificationNumber: "SELLER_ID", identificationScheme: "NRIC", legalName: "Seller Company (Receiving Self-Bill)", address: { addressLines: ["Seller Addr"], cityName: "PJ", countryCode: "MYS", countrySubentityCode: "10" } },
 *   billingReferences: [{ invoiceId: "INV2024-005", invoiceIssueDate: "2024-08-01" }],
 *   invoiceLines: [{ id: "1", quantity: 1, subtotal: 75, itemDescription: "Self-Billed Credit Item", itemCommodityClassification: { code: "002" }, unitPrice: 75 }],
 *   taxTotal: { totalTaxAmount: 0, taxSubtotals: [] },
 *   legalMonetaryTotal: { lineExtensionAmount: 75, taxExclusiveAmount: 75, taxInclusiveAmount: 75, payableAmount: 75 },
 *   // Optionally, include signature parameters for v1.1
 *   // signature: { ... }
 * };
 *
 * // Example of creating a self-billed credit note (assuming an async context to use await)
 * async function generateSelfBilledCreditNotes() {
 *   // Create a version 1.1 self-billed credit note
 *   const ublSBCNv1_1 = await createUblJsonSelfBilledCreditNoteDocument(selfBilledCreditNoteParams, "1.1");
 *   console.log("Generated UBL Self-Billed Credit Note v1.1:", ublSBCNv1_1);
 *
 *   // Create a version 1.0 self-billed credit note (signature is ignored)
 *   const ublSBCNv1_0 = await createUblJsonSelfBilledCreditNoteDocument(selfBilledCreditNoteParams, "1.0");
 *   console.log("Generated UBL Self-Billed Credit Note v1.0:", ublSBCNv1_0);
 * }
 * ```
 */
export async function createUblJsonSelfBilledCreditNoteDocument(
  params: CreateCreditNoteDocumentParams, // Consider if a specific param type is needed
  version: "1.1" | "1.0" = "1.1"
): Promise<UBLJsonCreditNoteDocumentV1_0 | UBLJsonCreditNoteDocumentV1_1> {
  const docCurrency = params.documentCurrencyCode;
  const taxCurrency = params.taxCurrencyCode ?? docCurrency;

  // In self-billing, the party roles might be perceived differently.
  // 'supplier' in params is the entity issuing the self-billed document (the buyer).
  // 'customer' in params is the entity receiving it (the original seller).
  const supplierParty = buildSupplier(params.supplier); // Buyer acting as supplier of the document
  const customerParty = buildCustomerParty(params.customer); // Original seller as customer of the document

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

  const creditNoteLines: UBLJsonInvoiceLine[] = params.invoiceLines.map(
    (lineItem) => {
      let lineTaxTotals: UBLJsonTaxTotal[] | undefined;
      if (lineItem.lineTaxTotal) {
        const subTotals: UBLJsonTaxSubtotal[] =
          lineItem.lineTaxTotal.taxSubtotals.map((st) => ({
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
              lineItem.lineTaxTotal.taxAmount,
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
                _: lineItem.itemCommodityClassification.code,
                listID: lineItem.itemCommodityClassification.listID ?? "CLASS",
              },
            ],
          },
        ],
        Description: toUblText(lineItem.itemDescription),
      };

      return {
        ID: [{ _: lineItem.id }],
        InvoicedQuantity: [
          { _: lineItem.quantity, unitCode: lineItem.unitCode },
        ],
        LineExtensionAmount: toUblCurrencyAmount(
          lineItem.subtotal,
          docCurrency
        )!,
        TaxTotal: lineTaxTotals,
        Item: [item],
        Price: [
          {
            PriceAmount: toUblCurrencyAmount(lineItem.unitPrice, docCurrency)!,
          },
        ],
        AllowanceCharge: buildAllowanceCharges(
          lineItem.allowanceCharges,
          docCurrency
        ),
        ItemPriceExtension: [
          {
            Amount: toUblCurrencyAmount(lineItem.subtotal, docCurrency)!,
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

  let selfBilledCreditNoteContent: // Renamed from creditNoteContent for clarity
  UBLJsonCreditNoteV1_0_Content | UBLJsonCreditNoteV1_1_Content = {
    ID: [{ _: params.id }],
    IssueDate: [{ _: params.issueDate }],
    IssueTime: [{ _: params.issueTime }],
    InvoiceTypeCode: [{ _: "12", listVersionID: version }], // Self-Billed Credit Note type code
    DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
    TaxCurrencyCode: params.taxCurrencyCode
      ? [{ _: params.taxCurrencyCode }]
      : undefined,
    AccountingSupplierParty: [accountingSupplierParty],
    AccountingCustomerParty: [accountingCustomerParty],
    BillingReference: billingReferences,
    InvoiceLine: creditNoteLines, // Field name is InvoiceLine in UBL standard
    TaxTotal: taxTotal,
    LegalMonetaryTotal: legalMonetaryTotal,
    InvoicePeriod: params.creditNotePeriod?.map((ip) => ({
      // Assuming 'creditNotePeriod' is applicable
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
    const v1_1Content =
      selfBilledCreditNoteContent as UBLJsonCreditNoteV1_1_Content;
    let finalExtensionsArray: UBLJsonExtensions = [];

    if (params.signature) {
      // Create a temporary content object for signing, excluding Signature itself
      const tempContentForSigning: Omit<
        UBLJsonCreditNoteV1_1_Content, // Assuming UBLJsonCreditNoteV1_1_Content is still the correct type
        "Signature"
      > = {
        ID: selfBilledCreditNoteContent.ID,
        IssueDate: selfBilledCreditNoteContent.IssueDate,
        IssueTime: selfBilledCreditNoteContent.IssueTime,
        InvoiceTypeCode: selfBilledCreditNoteContent.InvoiceTypeCode,
        DocumentCurrencyCode: selfBilledCreditNoteContent.DocumentCurrencyCode,
        TaxCurrencyCode: selfBilledCreditNoteContent.TaxCurrencyCode,
        AccountingSupplierParty:
          selfBilledCreditNoteContent.AccountingSupplierParty,
        AccountingCustomerParty:
          selfBilledCreditNoteContent.AccountingCustomerParty,
        BillingReference: (
          selfBilledCreditNoteContent as UBLJsonCreditNoteV1_1_Content
        ).BillingReference,
        InvoiceLine: selfBilledCreditNoteContent.InvoiceLine,
        TaxTotal: selfBilledCreditNoteContent.TaxTotal,
        LegalMonetaryTotal: selfBilledCreditNoteContent.LegalMonetaryTotal,
        InvoicePeriod: selfBilledCreditNoteContent.InvoicePeriod,
        AdditionalDocumentReference:
          selfBilledCreditNoteContent.AdditionalDocumentReference,
        Delivery: selfBilledCreditNoteContent.Delivery,
        PaymentMeans: selfBilledCreditNoteContent.PaymentMeans,
        PaymentTerms: selfBilledCreditNoteContent.PaymentTerms,
        PrepaidPayment: selfBilledCreditNoteContent.PrepaidPayment,
        AllowanceCharge: selfBilledCreditNoteContent.AllowanceCharge,
        UBLExtensions: [], // For signing, UBLExtensions should be empty or contain only pre-existing ones.
      };

      // The documentToSign structure mimics the final output structure,
      // which uses an "Invoice" root element and schema as per MyInvois specifications.
      const documentToSign: UBLJsonCreditNoteDocumentV1_1 = {
        // Assuming this root type is correct
        _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // MyInvois specific
        _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
        Invoice: [tempContentForSigning as UBLJsonCreditNoteV1_1_Content],
      };

      const signatureExtensionInstance = await buildSignatureExtension({
        ...params.signature,
        documentToSign: documentToSign,
      });
      finalExtensionsArray.push({
        UBLExtension: [signatureExtensionInstance],
      });

      v1_1Content.Signature = [
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
      if (finalExtensionsArray.length > 0) {
        v1_1Content.UBLExtensions = finalExtensionsArray;
      }
      selfBilledCreditNoteContent = v1_1Content;
    }
  }
  // Root UBL JSON structure for Self-Billed Credit Note
  // (using "Invoice" as root element based on observed MyInvois requirements for similar documents)
  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // Per MyInvois, even for Credit Notes/Self-Billed CNs
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [selfBilledCreditNoteContent], // Note: The root element is 'Invoice'
  };
}
