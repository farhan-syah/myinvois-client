import {
  UBLJsonCreditNoteDocumentV1_0,
  UBLJsonCreditNoteDocumentV1_1,
  UBLJsonCreditNoteV1_0_Content,
  UBLJsonCreditNoteV1_1_Content,
} from "../../json/creditNote";
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
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

/**
 * Creates a UBL Credit Note JSON document (supports v1.0 and v1.1) from user-friendly parameters.
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
 * @returns The constructed UBL Credit Note JSON document (`UBLJsonCreditNoteDocumentV1_0` or `UBLJsonCreditNoteDocumentV1_1`).
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
 *   supplier: { ... }, // Populate SupplierPartyParam
 *   customer: { ... }, // Populate CustomerPartyParam
 *   billingReferences: [{ invoiceId: "INV2024-001", invoiceIssueDate: "2024-07-30" }], // Link to original invoice
 *   creditNoteLines: [ ... ], // Populate CreditNoteLineParam array
 *   taxTotal: { ... }, // Populate CreditNoteTaxTotalParam
 *   legalMonetaryTotal: { ... }, // Populate LegalMonetaryTotalParam
 * };
 *
 * // Create a version 1.1 credit note
 * const ublCreditNoteV1_1 = createUblJsonCreditNoteDocument(creditNoteParams, "1.1");
 *
 * // Create a version 1.0 credit note
 * const ublCreditNoteV1_0 = createUblJsonCreditNoteDocument(creditNoteParams, "1.0");
 * ```
 */
export function createUblJsonCreditNoteDocument(
  params: CreateCreditNoteDocumentParams,
  version: "1.1" | "1.0" = "1.1"
): UBLJsonCreditNoteDocumentV1_0 | UBLJsonCreditNoteDocumentV1_1 {
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

  // Billing References are mandatory for Credit Notes
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
                ], // Defaulting TaxScheme
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
          // Using ItemPriceExtension for line subtotal in Credit Notes as per MyInvois
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
            // Defaulting TaxScheme as it's usually standard
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
    // Using LegalMonetaryTotalParam structure
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
    // Credit Note Type Code is fixed to "02"
    InvoiceTypeCode: [{ _: "02", listVersionID: version }],
    DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
    TaxCurrencyCode: params.taxCurrencyCode
      ? [{ _: params.taxCurrencyCode }]
      : undefined,
    AccountingSupplierParty: [accountingSupplierParty],
    AccountingCustomerParty: [accountingCustomerParty],
    BillingReference: billingReferences,
    InvoiceLine: creditNoteLines, // Renamed from InvoiceLine to clarify it's for Credit Note
    TaxTotal: taxTotal,
    LegalMonetaryTotal: legalMonetaryTotal,
    InvoicePeriod: params.creditNotePeriod?.map((ip) => ({
      // Using CreditNotePeriodParam
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
      // Using PaymentMeansParam
      PaymentMeansCode: [{ _: pm.paymentMeansCode }],
      PayeeFinancialAccount: pm.payeeFinancialAccountId
        ? [{ ID: [{ _: pm.payeeFinancialAccountId }] }]
        : undefined,
    })),
    PaymentTerms: params.paymentTerms?.map((pt) => ({
      // Using PaymentTermsParam
      Note: [{ _: pt.note }],
    })),
    PrepaidPayment: params.prepaidPayments?.map((pp) => ({
      ID: toUblIdentifier(pp.id), // Using PrepaidPaymentParam
      PaidAmount: toUblCurrencyAmount(pp.paidAmount, docCurrency)!,
      PaidDate: toUblDate(pp.paidDate),
      PaidTime: toUblTime(pp.paidTime),
    })),
    AllowanceCharge: buildAllowanceCharges(
      params.allowanceCharges,
      docCurrency
    ), // Using common buildAllowanceCharges
  };

  if (version === "1.1") {
    // These fields are only present in v1.1
    (creditNoteContent as UBLJsonCreditNoteV1_1_Content).UBLExtensions =
      params.ublExtensions ?? [];
    (creditNoteContent as UBLJsonCreditNoteV1_1_Content).Signature = [
      {
        ID: [
          {
            _:
              params.signatureId ??
              "urn:oasis:names:specification:ubl:signature:Invoice",
          },
        ],
        SignatureMethod: params.signatureMethod
          ? [{ _: params.signatureMethod }]
          : [{ _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades" }],
      },
    ];
  }

  // Root UBL JSON structure for Credit Note
  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [creditNoteContent], // Note: The root element is still 'Invoice' in the JSON schema
  };
}
