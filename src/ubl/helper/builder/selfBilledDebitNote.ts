import {
  UBLJsonDebitNoteDocumentV1_0,
  UBLJsonDebitNoteDocumentV1_1,
  UBLJsonDebitNoteV1_0_Content,
  UBLJsonDebitNoteV1_1_Content,
} from "../../json/debitNote";
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

import { CreateDebitNoteDocumentParams } from "../params/debitNote";
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
 * Asynchronously creates a UBL Self-Billed Debit Note JSON document (supports v1.0 and v1.1) from user-friendly parameters.
 * This function is similar to the debit note builder but sets the InvoiceTypeCode to "06" for Self-Billed Debit Notes.
 * If `signature` parameters are provided for a v1.1 document, this function will internally call
 * an asynchronous signature generation process.
 * This function simplifies the construction of complex UBL JSON structures by:
 * - Using clear, high-level parameter objects (`CreateDebitNoteDocumentParams`).
 * - Handling the repetitive array and object wrapping required by UBL JSON.
 * - Setting default values for common UBL attributes (e.g., `listID`, `schemeAgencyID`).
 * - Setting the `InvoiceTypeCode` specifically to "06" for Self-Billed Debit Notes.
 * - Including `BillingReference` to link back to the original invoice(s).
 * - Differentiating between v1.0 and v1.1 structures (e.g., presence of `UBLExtensions` and `Signature`).
 *
 * Developers can use this builder to easily generate compliant UBL JSON self-billed debit notes without needing to
 * understand all the intricacies of the UBL JSON format directly. For more advanced scenarios or
 * customization beyond what the parameters offer, developers can still construct or modify the
 * `UBLJsonDebitNoteDocumentV1_0` or `UBLJsonDebitNoteDocumentV1_1` objects manually (assuming these are the correct underlying types).
 *
 * @param params The {@link CreateDebitNoteDocumentParams} object containing all necessary data.
 * @param version Specifies the UBL e-Invoice version to generate ("1.0" or "1.1"). Defaults to "1.1".
 * @returns A Promise that resolves to the constructed UBL Self-Billed Debit Note JSON document (`UBLJsonDebitNoteDocumentV1_0` or `UBLJsonDebitNoteDocumentV1_1`).
 * @example
 * ```typescript
 * import { createUblJsonSelfBilledDebitNoteDocument } from "./ubl/helper/builder/selfBilledDebitNote";
 * import { CreateDebitNoteDocumentParams } from "./ubl/helper/params/debitNote"; // Assuming same params
 *
 * const selfBilledDebitNoteParams: CreateDebitNoteDocumentParams = {
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
 *   invoiceLines: [{ id: "1", quantity: 1, subtotal: 75, itemDescription: "Self-Billed Debit Item", itemCommodityClassification: { code: "002" }, unitPrice: 75 }],
 *   taxTotal: { totalTaxAmount: 0, taxSubtotals: [] },
 *   legalMonetaryTotal: { lineExtensionAmount: 75, taxExclusiveAmount: 75, taxInclusiveAmount: 75, payableAmount: 75 },
 *   // Optionally, include signature parameters for v1.1
 *   // signature: { ... }
 * };
 *
 * // Example of creating a self-billed debit note (assuming an async context to use await)
 * async function generateSelfBilledDebitNotes() {
 *   // Create a version 1.1 self-billed debit note
 *   const ublSBCNv1_1 = await createUblJsonSelfBilledDebitNoteDocument(selfBilledDebitNoteParams, "1.1");
 *   console.log("Generated UBL Self-Billed Debit Note v1.1:", ublSBCNv1_1);
 *
 *   // Create a version 1.0 self-billed debit note (signature is ignored)
 *   const ublSBCNv1_0 = await createUblJsonSelfBilledDebitNoteDocument(selfBilledDebitNoteParams, "1.0");
 *   console.log("Generated UBL Self-Billed Debit Note v1.0:", ublSBCNv1_0);
 * }
 * ```
 */
export async function createUblJsonSelfBilledDebitNoteDocument(
  params: CreateDebitNoteDocumentParams, // Consider if a specific param type is needed
  version: "1.1" | "1.0" = "1.1"
): Promise<UBLJsonDebitNoteDocumentV1_0 | UBLJsonDebitNoteDocumentV1_1> {
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

  const debitNoteLines: UBLJsonInvoiceLine[] = params.invoiceLines.map(
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

  let selfBilledDebitNoteContent: // Renamed from debitNoteContent for clarity
  UBLJsonDebitNoteV1_0_Content | UBLJsonDebitNoteV1_1_Content = {
    ID: [{ _: params.id }],
    IssueDate: [{ _: params.issueDate }],
    IssueTime: [{ _: params.issueTime }],
    InvoiceTypeCode: [{ _: "13", listVersionID: version }], // Self-Billed Debit Note type code
    DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
    TaxCurrencyCode: params.taxCurrencyCode
      ? [{ _: params.taxCurrencyCode }]
      : undefined,
    AccountingSupplierParty: [accountingSupplierParty],
    AccountingCustomerParty: [accountingCustomerParty],
    BillingReference: billingReferences,
    InvoiceLine: debitNoteLines, // Field name is InvoiceLine in UBL standard
    TaxTotal: taxTotal,
    LegalMonetaryTotal: legalMonetaryTotal,
    InvoicePeriod: params.debitNotePeriod?.map((ip) => ({
      // Assuming 'debitNotePeriod' is applicable
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
      selfBilledDebitNoteContent as UBLJsonDebitNoteV1_1_Content;
    let finalExtensionsArray: UBLJsonExtensions = [];

    if (params.signature) {
      // Create a temporary content object for signing, excluding Signature itself
      const tempContentForSigning: Omit<
        UBLJsonDebitNoteV1_1_Content, // Assuming UBLJsonDebitNoteV1_1_Content is still the correct type
        "Signature"
      > = {
        ID: selfBilledDebitNoteContent.ID,
        IssueDate: selfBilledDebitNoteContent.IssueDate,
        IssueTime: selfBilledDebitNoteContent.IssueTime,
        InvoiceTypeCode: selfBilledDebitNoteContent.InvoiceTypeCode,
        DocumentCurrencyCode: selfBilledDebitNoteContent.DocumentCurrencyCode,
        TaxCurrencyCode: selfBilledDebitNoteContent.TaxCurrencyCode,
        AccountingSupplierParty:
          selfBilledDebitNoteContent.AccountingSupplierParty,
        AccountingCustomerParty:
          selfBilledDebitNoteContent.AccountingCustomerParty,
        BillingReference: (
          selfBilledDebitNoteContent as UBLJsonDebitNoteV1_1_Content
        ).BillingReference,
        InvoiceLine: selfBilledDebitNoteContent.InvoiceLine,
        TaxTotal: selfBilledDebitNoteContent.TaxTotal,
        LegalMonetaryTotal: selfBilledDebitNoteContent.LegalMonetaryTotal,
        InvoicePeriod: selfBilledDebitNoteContent.InvoicePeriod,
        AdditionalDocumentReference:
          selfBilledDebitNoteContent.AdditionalDocumentReference,
        Delivery: selfBilledDebitNoteContent.Delivery,
        PaymentMeans: selfBilledDebitNoteContent.PaymentMeans,
        PaymentTerms: selfBilledDebitNoteContent.PaymentTerms,
        PrepaidPayment: selfBilledDebitNoteContent.PrepaidPayment,
        AllowanceCharge: selfBilledDebitNoteContent.AllowanceCharge,
        UBLExtensions: [], // For signing, UBLExtensions should be empty or contain only pre-existing ones.
      };

      // The documentToSign structure mimics the final output structure,
      // which uses an "Invoice" root element and schema as per MyInvois specifications.
      const documentToSign: UBLJsonDebitNoteDocumentV1_1 = {
        // Assuming this root type is correct
        _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // MyInvois specific
        _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
        Invoice: [tempContentForSigning as UBLJsonDebitNoteV1_1_Content],
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
      selfBilledDebitNoteContent = v1_1Content;
    }
  }
  // Root UBL JSON structure for Self-Billed Debit Note
  // (using "Invoice" as root element based on observed MyInvois requirements for similar documents)
  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2", // Per MyInvois, even for Debit Notes/Self-Billed CNs
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [selfBilledDebitNoteContent], // Note: The root element is 'Invoice'
  };
}
