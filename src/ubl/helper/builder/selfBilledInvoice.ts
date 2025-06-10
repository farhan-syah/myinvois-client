import {
  UBLJsonInvoiceDocumentV1_0,
  UBLJsonInvoiceDocumentV1_1,
  UBLJsonInvoiceV1_0_Content,
  UBLJsonInvoiceV1_1_Content,
} from "../../json/invoice";

import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonExtensions,
  UBLJsonInvoiceLine,
  UBLJsonItem,
  UBLJsonLegalMonetaryTotal,
  UBLJsonShipment,
  UBLJsonTaxTotal,
} from "../../json/ubl_json";
import { CreateInvoiceDocumentParams } from "../params/invoice"; // Import invoice-specific parameters
import {
  buildAllowanceCharges,
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
import { buildSignatureExtension } from "./signatureExtension";

/**
 * Asynchronously creates a UBL Self-Billed Invoice JSON document (supports v1.0 and v1.1) from user-friendly parameters.
 * The InvoiceTypeCode will be set to "389" (Self-billed invoice).
 * If `signatureExtension` parameters are provided for a v1.1 invoice, this function will internally call
 * an asynchronous signature generation process.
 * This function simplifies the construction of complex UBL JSON structures by:
 * - Using clear, high-level parameter objects (`CreateInvoiceDocumentParams`).
 * - Handling the repetitive array and object wrapping required by UBL JSON.
 * - Setting default values for common UBL attributes (e.g., `listID`, `schemeAgencyID`).
 * - Differentiating between Invoice v1.0 and v1.1 structures (e.g., presence of `UBLExtensions` and `Signature`).
 *
 * In a self-billed invoice context:
 * - The `customer` parameter (AccountingCustomerParty) represents the party ISSUING the invoice (typically the buyer).
 * - The `supplier` parameter (AccountingSupplierParty) represents the party RECEIVING the invoice (typically the seller whose goods/services are being billed by the customer).
 *
 * Developers can use this builder to easily generate compliant UBL JSON self-billed invoices without needing to
 * understand all the intricacies of the UBL JSON format directly. For more advanced scenarios or
 * customization beyond what the parameters offer, developers can still construct or modify the
 * `UBLJsonInvoiceDocumentV1_0` or `UBLJsonInvoiceDocumentV1_1` objects manually.
 *
 * @param params The {@link CreateInvoiceDocumentParams} object containing all necessary invoice data.
 *               Note: `params.invoiceTypeCode` will be overridden to "389".
 *               The `params` object is assumed to potentially have an `existingExtensions?: UBLJsonExtensions` field for advanced scenarios.
 * @param version Specifies the UBL e-Invoice version to generate ("1.0" or "1.1"). Defaults to "1.1".
 * @returns A Promise that resolves to the constructed UBL Self-Billed Invoice JSON document (`UBLJsonInvoiceDocumentV1_0` or `UBLJsonInvoiceDocumentV1_1`).
 * @example
 * ```typescript
 * import { createUblJsonSelfBilledInvoiceDocument } from "./ubl/helper/builder/selfBilledInvoice";
 * import { CreateInvoiceDocumentParams } from "./ubl/helper/params/invoice";
 *
 * const selfBilledParams: CreateInvoiceDocumentParams = {
 *   id: "SBINV2024-001",
 *   issueDate: "2024-07-30",
 *   issueTime: "10:00:00Z",
 *   // invoiceTypeCode is set to "389" by this builder, any value in params.invoiceTypeCode is ignored for Self-Billed.
 *   documentCurrencyCode: "MYR",
 *   supplier: { // The party RECEIVING the self-billed invoice (Seller)
 *      TIN: "TIN_SELLER_123", identificationNumber: "SELLER_REG_123", identificationScheme: "BRN",
 *      legalName: "Actual Seller Goods Sdn Bhd",
 *      address: { addressLines: ["Seller Street 1"], cityName: "Cyberjaya", countrySubentityCode: "10", countryCode: "MYS" },
 *   },
 *   customer: { // The party ISSUING the self-billed invoice (Buyer)
 *      TIN: "TIN_BUYER_456", identificationNumber: "BUYER_REG_456", identificationScheme: "BRN",
 *      legalName: "Self-Billing Buyer Berhad",
 *      address: { addressLines: ["Buyer Avenue A"], cityName: "Putrajaya", countrySubentityCode: "16", countryCode: "MYS" },
 *   },
 *   invoiceLines: [
 *      {
 *          id: "1", quantity: 5, subtotal: 500.00, unitPrice: 100.00,
 *          itemDescription: "Services Rendered (Self-Billed)",
 *          itemCommodityClassification: { code: "S001", listID: "SCLASS" },
 *          lineTaxTotal: {
 *              taxAmount: 30.00, taxSubtotals: [{ taxableAmount: 500.00, taxAmount: 30.00, taxCategoryCode: "S", percent: 6 }]
 *          }
 *      }
 *   ],
 *   taxTotal: {
 *      totalTaxAmount: 30.00, taxSubtotals: [{ taxableAmount: 500.00, taxAmount: 30.00, taxCategoryCode: "S", percent: 6 }]
 *   },
 *   legalMonetaryTotal: {
 *      lineExtensionAmount: 500.00, taxExclusiveAmount: 500.00, taxInclusiveAmount: 530.00, payableAmount: 530.00
 *   },
 *   // signature: { ... if signing is needed for v1.1 ... }
 * };
 *
 * async function generateSelfBilled() {
 *   const ublDocV1_1 = await createUblJsonSelfBilledInvoiceDocument(selfBilledParams, "1.1");
 *   console.log("Generated UBL Self-Billed Invoice v1.1:", ublDocV1_1);
 *
 *   const ublDocV1_0 = await createUblJsonSelfBilledInvoiceDocument(selfBilledParams, "1.0");
 *   console.log("Generated UBL Self-Billed Invoice v1.0:", ublDocV1_0);
 * }
 * ```
 */
export async function createUblJsonSelfBilledInvoiceDocument(
  params: CreateInvoiceDocumentParams & {
    existingExtensions?: UBLJsonExtensions;
  }, // Allow pre-existing extensions
  version: "1.1" | "1.0" = "1.1"
): Promise<UBLJsonInvoiceDocumentV1_0 | UBLJsonInvoiceDocumentV1_1> {
  const docCurrency = params.documentCurrencyCode;
  const taxCurrency = params.taxCurrencyCode ?? docCurrency;

  // In self-billing, AccountingSupplierParty is the seller, AccountingCustomerParty is the buyer (issuer of invoice)
  const supplierParty = buildSupplier(params.supplier); // Seller
  const customerParty = buildCustomerParty(params.customer); // Buyer

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

  const invoiceLines: UBLJsonInvoiceLine[] = params.invoiceLines.map(
    (lineParam) => {
      let lineTaxTotals: UBLJsonTaxTotal[] | undefined;
      if (lineParam.lineTaxTotal) {
        const subTotals = lineParam.lineTaxTotal.taxSubtotals.map((st) => ({
          TaxableAmount: toUblCurrencyAmount(st.taxableAmount, taxCurrency)!,
          TaxAmount: toUblCurrencyAmount(st.taxAmount, taxCurrency)!,
          TaxCategory: [
            {
              ID: [{ _: st.taxCategoryCode }],
              TaxScheme: [{ ID: [{ _: "UN/ECE 5153", schemeAgencyID: "6" }] }],
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

  let selfBilledInvoiceContent:
    | UBLJsonInvoiceV1_0_Content
    | UBLJsonInvoiceV1_1_Content = {
    ID: [{ _: params.id }],
    IssueDate: [{ _: params.issueDate }],
    IssueTime: [{ _: params.issueTime }],
    InvoiceTypeCode: [{ _: "11", listVersionID: version }], // Self-Billed Invoice
    DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
    TaxCurrencyCode: params.taxCurrencyCode
      ? [{ _: params.taxCurrencyCode }]
      : undefined,
    AccountingSupplierParty: [accountingSupplierParty], // Seller
    AccountingCustomerParty: [accountingCustomerParty], // Buyer (Issuer)
    InvoiceLine: invoiceLines,
    TaxTotal: taxTotal,
    LegalMonetaryTotal: legalMonetaryTotal,
    InvoicePeriod: params.invoicePeriod?.map((ip) => ({
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
      if (d.partyName ?? d.address) {
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
    const v1_1Content = selfBilledInvoiceContent as UBLJsonInvoiceV1_1_Content;
    let finalExtensionsArray: UBLJsonExtensions = [];

    // If there are existing extensions, use them as a base
    if (params.existingExtensions && params.existingExtensions.length > 0) {
      finalExtensionsArray = [...params.existingExtensions];
    }

    if (params.signature) {
      const tempInvoiceContentForSigning: Omit<
        UBLJsonInvoiceV1_1_Content,
        "Signature"
      > = {
        ID: v1_1Content.ID,
        IssueDate: v1_1Content.IssueDate,
        IssueTime: v1_1Content.IssueTime,
        InvoiceTypeCode: v1_1Content.InvoiceTypeCode,
        DocumentCurrencyCode: v1_1Content.DocumentCurrencyCode,
        TaxCurrencyCode: v1_1Content.TaxCurrencyCode,
        AccountingSupplierParty: v1_1Content.AccountingSupplierParty,
        AccountingCustomerParty: v1_1Content.AccountingCustomerParty,
        InvoiceLine: v1_1Content.InvoiceLine,
        TaxTotal: v1_1Content.TaxTotal,
        LegalMonetaryTotal: v1_1Content.LegalMonetaryTotal,
        InvoicePeriod: v1_1Content.InvoicePeriod,
        AdditionalDocumentReference: v1_1Content.AdditionalDocumentReference,
        Delivery: v1_1Content.Delivery,
        PaymentMeans: v1_1Content.PaymentMeans,
        PaymentTerms: v1_1Content.PaymentTerms,
        PrepaidPayment: v1_1Content.PrepaidPayment,
        AllowanceCharge: v1_1Content.AllowanceCharge,
        // UBLExtensions for signing should contain only pre-existing non-signature extensions.
        // If `finalExtensionsArray` currently holds these (from params.existingExtensions), use them.
        // Otherwise, it's empty as per original invoice builder's signing logic.
        UBLExtensions: [],
      };

      const documentToSign: UBLJsonInvoiceDocumentV1_1 = {
        _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
        _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
        Invoice: [tempInvoiceContentForSigning as UBLJsonInvoiceV1_1_Content],
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
    }

    if (finalExtensionsArray.length > 0) {
      v1_1Content.UBLExtensions = finalExtensionsArray;
    }
    selfBilledInvoiceContent = v1_1Content;
  }

  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [selfBilledInvoiceContent],
  };
}
