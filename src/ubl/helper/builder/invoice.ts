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
 * Asynchronously creates a UBL Invoice JSON document (supports v1.0 and v1.1) from user-friendly parameters.
 * If `signatureExtension` parameters are provided for a v1.1 invoice, this function will internally call
 * an asynchronous signature generation process.
 * This function simplifies the construction of complex UBL JSON structures by:
 * - Using clear, high-level parameter objects (`CreateInvoiceDocumentParams`).
 * - Handling the repetitive array and object wrapping required by UBL JSON.
 * - Setting default values for common UBL attributes (e.g., `listID`, `schemeAgencyID`).
 * - Differentiating between Invoice v1.0 and v1.1 structures (e.g., presence of `UBLExtensions` and `Signature`).
 *
 * Developers can use this builder to easily generate compliant UBL JSON invoices without needing to
 * understand all the intricacies of the UBL JSON format directly. For more advanced scenarios or
 * customization beyond what the parameters offer, developers can still construct or modify the
 * `UBLJsonInvoiceDocumentV1_0` or `UBLJsonInvoiceDocumentV1_1` objects manually.
 *
 * @param params The {@link CreateInvoiceDocumentParams} object containing all necessary invoice data.
 * @param version Specifies the UBL e-Invoice version to generate ("1.0" or "1.1"). Defaults to "1.1".
 * @returns A Promise that resolves to the constructed UBL Invoice JSON document (`UBLJsonInvoiceDocumentV1_0` or `UBLJsonInvoiceDocumentV1_1`).
 * @example
 * ```typescript
 * import { createUblJsonInvoiceDocument } from "./ubl/helper/builder/invoice";
 * import { CreateInvoiceDocumentParams } from "./ubl/helper/params/invoice";
 *
 * const invoiceParams: CreateInvoiceDocumentParams = {
 *   id: "INV2024-001",
 *   issueDate: "2024-07-30",
 *   issueTime: "10:00:00Z",
 *   invoiceTypeCode: "01", // Standard Invoice
 *   documentCurrencyCode: "MYR",
 *   supplier: { // Populate SupplierPartyParam
 *      TIN: "TIN123", identificationNumber: "ID123", identificationScheme: "BRN",
 *      telephone: "+60123456789", legalName: "Supplier Sdn Bhd",
 *      address: { addressLines: ["Line 1"], cityName: "KL", countrySubentityCode: "14", countryCode: "MYS" },
 *      industryClassificationCode: "0111", industryClassificationName: "Test"
 *   },
 *   customer: { // Populate CustomerPartyParam
 *      TIN: "TIN456", identificationNumber: "ID456", identificationScheme: "NRIC",
 *      telephone: "+60987654321", legalName: "Customer Berhad",
 *      address: { addressLines: ["Line A"], cityName: "PJ", countrySubentityCode: "10", countryCode: "MYS" },
 *   },
 *   invoiceLines: [ // Populate InvoiceLineParam array
 *      {
 *          id: "1", quantity: 1, subtotal: 100.00, unitPrice: 100.00,
 *          itemCommodityClassification: { code: "001" },
 *          lineTaxTotal: {
 *              taxAmount: 6.00, taxSubtotals: [{ taxableAmount: 100.00, taxAmount: 6.00, taxCategoryCode: "S", percent: 6 }]
 *          }
 *      }
 *   ],
 *   taxTotal: { // Populate InvoiceTaxTotalParam
 *      totalTaxAmount: 6.00, taxSubtotals: [{ taxableAmount: 100.00, taxAmount: 6.00, taxCategoryCode: "S", percent: 6 }]
 *   },
 *   legalMonetaryTotal: { // Populate LegalMonetaryTotalParam
 *      lineExtensionAmount: 100.00, taxExclusiveAmount: 100.00, taxInclusiveAmount: 106.00, payableAmount: 106.00
 *   },
 * };
 *
 * // Example of creating an invoice (assuming an async context to use await)
 * async function generateInvoices() {
 *   // Create a version 1.1 invoice
 *   const ublInvoiceV1_1 = await createUblJsonInvoiceDocument(invoiceParams, "1.1");
 *   console.log("Generated UBL Invoice v1.1:", ublInvoiceV1_1);
 *
 *   // Create a version 1.0 invoice
 *   const ublInvoiceV1_0 = await createUblJsonInvoiceDocument(invoiceParams, "1.0");
 *   console.log("Generated UBL Invoice v1.0:", ublInvoiceV1_0);
 * }
 * ```
 */
export async function createUblJsonInvoiceDocument(
  params: CreateInvoiceDocumentParams,
  version: "1.1" | "1.0" = "1.1"
): Promise<UBLJsonInvoiceDocumentV1_0 | UBLJsonInvoiceDocumentV1_1> {
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
              TaxScheme: [{ ID: [{ _: "UN/ECE 5153", schemeAgencyID: "6" }] }], // Defaulting TaxScheme
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

  let invoiceContent: UBLJsonInvoiceV1_0_Content | UBLJsonInvoiceV1_1_Content =
    {
      ID: [{ _: params.id }],
      IssueDate: [{ _: params.issueDate }],
      IssueTime: [{ _: params.issueTime }],
      InvoiceTypeCode: [{ _: "01", listVersionID: version }],
      DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
      TaxCurrencyCode: params.taxCurrencyCode
        ? [{ _: params.taxCurrencyCode }]
        : undefined,
      AccountingSupplierParty: [accountingSupplierParty],
      AccountingCustomerParty: [accountingCustomerParty],
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
    let finalExtensionsArray: UBLJsonExtensions = [];

    if (params.signature) {
      // Create a temporary invoice content object specifically for the signing process.
      // This object should represent the state of the Invoice's content *before*
      // the new signature (being generated now) is embedded.
      const tempInvoiceContentForSigning: Omit<
        UBLJsonInvoiceV1_1_Content,
        "Signature"
      > = {
        // Copy all common properties from the `invoiceContent` object built so far
        ID: invoiceContent.ID,
        IssueDate: invoiceContent.IssueDate,
        IssueTime: invoiceContent.IssueTime,
        InvoiceTypeCode: invoiceContent.InvoiceTypeCode,
        DocumentCurrencyCode: invoiceContent.DocumentCurrencyCode,
        TaxCurrencyCode: invoiceContent.TaxCurrencyCode,
        AccountingSupplierParty: invoiceContent.AccountingSupplierParty,
        AccountingCustomerParty: invoiceContent.AccountingCustomerParty,
        InvoiceLine: invoiceContent.InvoiceLine,
        TaxTotal: invoiceContent.TaxTotal,
        LegalMonetaryTotal: invoiceContent.LegalMonetaryTotal,
        InvoicePeriod: invoiceContent.InvoicePeriod,
        AdditionalDocumentReference: invoiceContent.AdditionalDocumentReference,
        Delivery: invoiceContent.Delivery,
        PaymentMeans: invoiceContent.PaymentMeans,
        PaymentTerms: invoiceContent.PaymentTerms,
        PrepaidPayment: invoiceContent.PrepaidPayment,
        AllowanceCharge: invoiceContent.AllowanceCharge,
        // UBLExtensions for signing should ONLY contain pre-existing extensions,
        // structured correctly.
        UBLExtensions: [],
        // The cac:Signature block itself is NOT included in the data to be signed.
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
      // Add the newly created signature extension to the array for the final document.
      finalExtensionsArray.push({
        UBLExtension: [signatureExtensionInstance],
      });

      // Add the main cac:Signature block to the `invoiceContent`.
      (invoiceContent as UBLJsonInvoiceV1_1_Content).Signature = [
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

    // Set the UBLExtensions on the main invoiceContent, ensuring correct structure.
    // If finalExtensionsArray is empty, UBLExtensions will be { UBLExtension: [] }.
    (invoiceContent as UBLJsonInvoiceV1_1_Content).UBLExtensions =
      finalExtensionsArray;
  }

  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [invoiceContent],
  };
}
