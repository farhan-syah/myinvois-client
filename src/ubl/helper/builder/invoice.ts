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
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonAllowanceCharge,
  UBLJsonDelivery,
  UBLJsonExtensions,
  UBLJsonInvoiceLine,
  UBLJsonItem,
  UBLJsonLegalMonetaryTotal,
  UBLJsonPaymentMeans,
  UBLJsonPrepaidPayment,
  UBLJsonShipment,
  UBLJsonSignature,
  UBLJsonTaxTotal,
} from "../../json/ubl_json";
import { CreateInvoiceDocumentParams, InvoiceLineParam } from "../params/invoice"; // Import invoice-specific parameters
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
 * - Setting default values for common UBL attributes.
 * - Differentiating between Invoice v1.0 and v1.1 structures.
 *
 * **UBL Versioning:**
 * - **Version "1.1"**: Includes `UBLExtensions` and `cac:Signature` elements if `params.signature` is provided.
 *   An empty `UBLExtensions` array is added if no signature is provided, as per some schema interpretations.
 * - **Version "1.0"**: Omits `UBLExtensions` and `cac:Signature` elements entirely.
 * The `InvoiceTypeCode`'s `listVersionID` attribute is set to the specified `version`.
 *
 * **Key Default Values Applied by the Builder (if not specified in params):**
 * - For Tax Categories (in `InvoiceLine` and main `TaxTotal`):
 *   - `TaxScheme.ID`: "UN/ECE 5153"
 *   - `TaxScheme.schemeAgencyID`: "6"
 * - For `ItemCommodityClassification` in `InvoiceLine`:
 *   - `ItemClassificationCode.listID`: "CLASS"
 * - For `Signature` (v1.1 only, if `params.signature` is provided but specific fields are omitted):
 *   - `Signature.ID`: "urn:oasis:names:specification:ubl:signature:Invoice"
 *   - `Signature.SignatureMethod`: "urn:oasis:names:specification:ubl:dsig:enveloped:xades"
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

  const accountingSupplierParty = _buildAccountingSupplierParty(params);
  const accountingCustomerParty = _buildAccountingCustomerParty(params);
  const invoiceLines = _buildUblInvoiceLines(params.invoiceLines, docCurrency, taxCurrency);
  const taxTotals = _buildUblTaxTotals(params.taxTotal, taxCurrency);
  const legalMonetaryTotal = _buildUblLegalMonetaryTotal(params.legalMonetaryTotal, docCurrency);

  const delivery = _buildDelivery(params.delivery);
  const paymentMeans = _buildPaymentMeans(params.paymentMeans);
  const prepaidPayments = _buildPrepaidPayments(params.prepaidPayments, docCurrency);
  const allowanceCharges = buildAllowanceCharges(params.allowanceCharges, docCurrency); // Using common helper

  let invoiceContent: UBLJsonInvoiceV1_0_Content | UBLJsonInvoiceV1_1_Content =
    {
      ID: [{ _: params.id }],
      IssueDate: [{ _: params.issueDate }],
      IssueTime: [{ _: params.issueTime }],
      InvoiceTypeCode: [{ _: params.invoiceTypeCode, listVersionID: version }], // Using invoiceTypeCode from params
      DocumentCurrencyCode: [{ _: params.documentCurrencyCode }],
      TaxCurrencyCode: params.taxCurrencyCode
        ? [{ _: params.taxCurrencyCode }]
        : undefined,
      AccountingSupplierParty: [accountingSupplierParty],
      AccountingCustomerParty: [accountingCustomerParty],
      InvoiceLine: invoiceLines,
      TaxTotal: taxTotals,
      LegalMonetaryTotal: legalMonetaryTotal,
      Delivery: delivery,
      PaymentMeans: paymentMeans,
      PrepaidPayment: prepaidPayments,
      AllowanceCharge: allowanceCharges,
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
      PaymentTerms: params.paymentTerms?.map((pt) => ({
        Note: [{ _: pt.note }],
      })),
    };

  if (version === "1.1" && params.signature) {
    // Prepare a base version of invoice content for signing, without the signature itself
    // This is a shallow copy, ensure complex objects are handled if they were to be modified before signing
     const tempInvoiceContentForSigning: Omit<UBLJsonInvoiceV1_1_Content, "Signature" | "UBLExtensions"> = {
        ...invoiceContent, // Spread existing content
        // Explicitly exclude or ensure UBLExtensions and Signature are not part of what's signed,
        // or are handled as per signing requirements (e.g., UBLExtensions might need to be empty or specific for signing)
        UBLExtensions: undefined, // Or an empty array if the schema requires it: []
        Signature: undefined,
     };

    const signatureElements = await _buildSignatureElements(params.signature, tempInvoiceContentForSigning);
    (invoiceContent as UBLJsonInvoiceV1_1_Content).UBLExtensions = signatureElements.ublExtensions;
    (invoiceContent as UBLJsonInvoiceV1_1_Content).Signature = signatureElements.signature;
  } else if (version === "1.1") {
    // Ensure UBLExtensions is present for V1.1 even if no signature, as per some schemas
    (invoiceContent as UBLJsonInvoiceV1_1_Content).UBLExtensions = [];
  }


  return {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    Invoice: [invoiceContent],
  };
}

// --- Private Helper Functions ---

/**
 * @internal
 * Builds the AccountingSupplierParty structure.
 */
function _buildAccountingSupplierParty(params: CreateInvoiceDocumentParams): UBLJsonAccountingSupplierParty {
  const supplierParty = buildSupplier(params.supplier); // From common.ts
  const accSupplierParty: UBLJsonAccountingSupplierParty = {
    Party: [supplierParty],
  };
  if (params.supplier.additionalAccountId) {
    accSupplierParty.AdditionalAccountId = [{ _: params.supplier.additionalAccountId }];
  }
  return accSupplierParty;
}

/**
 * @internal
 * Builds the AccountingCustomerParty structure.
 */
function _buildAccountingCustomerParty(params: CreateInvoiceDocumentParams): UBLJsonAccountingCustomerParty {
  const customerParty = buildCustomerParty(params.customer); // From common.ts
  return {
    Party: [customerParty],
  };
}

/**
 * @internal
 * Builds an array of UBLJsonInvoiceLine from InvoiceLineParam.
 */
function _buildUblInvoiceLines(
  lineParams: CreateInvoiceDocumentParams['invoiceLines'],
  docCurrency: string,
  taxCurrency: string
): UBLJsonInvoiceLine[] {
  return lineParams.map((lineParam) => {
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
          TaxAmount: toUblCurrencyAmount(lineParam.lineTaxTotal.taxAmount, taxCurrency)!,
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
      InvoicedQuantity: [{ _: lineParam.quantity, unitCode: lineParam.unitCode }],
      LineExtensionAmount: toUblCurrencyAmount(lineParam.subtotal, docCurrency)!,
      TaxTotal: lineTaxTotals,
      Item: [item],
      Price: [{ PriceAmount: toUblCurrencyAmount(lineParam.unitPrice, docCurrency)! }],
      AllowanceCharge: buildAllowanceCharges(lineParam.allowanceCharges, docCurrency), // from common.ts
      ItemPriceExtension: [{ Amount: toUblCurrencyAmount(lineParam.subtotal, docCurrency)! }],
    };
  });
}

/**
 * @internal
 * Builds the main TaxTotal array for the document.
 */
function _buildUblTaxTotals(
  taxTotalParams: CreateInvoiceDocumentParams['taxTotal'],
  taxCurrency: string
): UBLJsonTaxTotal[] {
  return [
    {
      TaxAmount: toUblCurrencyAmount(taxTotalParams.totalTaxAmount, taxCurrency)!,
      TaxSubtotal: taxTotalParams.taxSubtotals.map((st) => ({
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
      RoundingAmount: toUblCurrencyAmount(taxTotalParams.roundingAmount, taxCurrency),
    },
  ];
}

/**
 * @internal
 * Builds the LegalMonetaryTotal array for the document.
 */
function _buildUblLegalMonetaryTotal(
  totalParams: CreateInvoiceDocumentParams['legalMonetaryTotal'],
  docCurrency: string
): UBLJsonLegalMonetaryTotal[] {
  return [
    {
      LineExtensionAmount: toUblCurrencyAmount(totalParams.lineExtensionAmount, docCurrency)!,
      TaxExclusiveAmount: toUblCurrencyAmount(totalParams.taxExclusiveAmount, docCurrency)!,
      TaxInclusiveAmount: toUblCurrencyAmount(totalParams.taxInclusiveAmount, docCurrency)!,
      AllowanceTotalAmount: toUblCurrencyAmount(totalParams.allowanceTotalAmount, docCurrency),
      ChargeTotalAmount: toUblCurrencyAmount(totalParams.chargeTotalAmount, docCurrency),
      PrepaidAmount: toUblCurrencyAmount(totalParams.prepaidAmount, docCurrency),
      PayableRoundingAmount: toUblCurrencyAmount(totalParams.payableRoundingAmount, docCurrency),
      PayableAmount: toUblCurrencyAmount(totalParams.payableAmount, docCurrency)!,
    },
  ];
}

/**
 * @internal
 * Builds Delivery information.
 */
function _buildDelivery(
  deliveryParams: CreateInvoiceDocumentParams['delivery']
): UBLJsonDelivery[] | undefined {
  if (!deliveryParams || deliveryParams.length === 0) return undefined;
  return deliveryParams.map((d) => {
    const deliveryParty = [];
    if (d.partyName ?? d.address) {
      const partyLegalEntities = [];
      if (d.partyName) {
        partyLegalEntities.push({ RegistrationName: toUblText(d.partyName) });
      }
      const deliveryPostalAddressArray = d.address
        ? [buildPostalAddressFromAddressParam(d.address)] // from common.ts
        : undefined;

      deliveryParty.push({
        PartyLegalEntity: partyLegalEntities.length > 0 ? partyLegalEntities : undefined,
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
  });
}

/**
 * @internal
 * Builds PaymentMeans information.
 */
function _buildPaymentMeans(
  paymentMeansParams: CreateInvoiceDocumentParams['paymentMeans']
): UBLJsonPaymentMeans[] | undefined {
  if (!paymentMeansParams || paymentMeansParams.length === 0) return undefined;
  return paymentMeansParams.map((pm) => ({
    PaymentMeansCode: [{ _: pm.paymentMeansCode }],
    PayeeFinancialAccount: pm.payeeFinancialAccountId
      ? [{ ID: [{ _: pm.payeeFinancialAccountId }] }]
      : undefined,
  }));
}

/**
 * @internal
 * Builds PrepaidPayment information.
 */
function _buildPrepaidPayments(
  prepaidPaymentParams: CreateInvoiceDocumentParams['prepaidPayments'],
  docCurrency: string
): UBLJsonPrepaidPayment[] | undefined {
  if (!prepaidPaymentParams || prepaidPaymentParams.length === 0) return undefined;
  return prepaidPaymentParams.map((pp) => ({
    ID: toUblIdentifier(pp.id),
    PaidAmount: toUblCurrencyAmount(pp.paidAmount, docCurrency)!,
    PaidDate: toUblDate(pp.paidDate),
    PaidTime: toUblTime(pp.paidTime),
  }));
}

/**
 * @internal
 * Builds signature elements for UBL Invoice v1.1.
 */
async function _buildSignatureElements(
  signatureParams: NonNullable<CreateInvoiceDocumentParams['signature']>,
  invoiceContentToSign: Omit<UBLJsonInvoiceV1_1_Content, "Signature" | "UBLExtensions">
): Promise<{ ublExtensions: UBLJsonExtensions; signature: UBLJsonSignature[] }> {

  const documentToSign: UBLJsonInvoiceDocumentV1_1 = {
    _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    // Ensure invoiceContentToSign is correctly cast or structured if it doesn't perfectly match UBLJsonInvoiceV1_1_Content
    Invoice: [invoiceContentToSign as UBLJsonInvoiceV1_1_Content],
  };

  const signatureExtensionInstance = await buildSignatureExtension({
    ...signatureParams,
    documentToSign: documentToSign,
  });

  const ublExtensions: UBLJsonExtensions = [{ UBLExtension: [signatureExtensionInstance] }];

  const signature: UBLJsonSignature[] = [
    {
      ID: [
        {
          _: signatureParams.signatureId ?? "urn:oasis:names:specification:ubl:signature:Invoice",
        },
      ],
      SignatureMethod: signatureParams.extensionUri
        ? [{ _: signatureParams.extensionUri }]
        : [{ _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades" }],
    },
  ];
  return { ublExtensions, signature };
}
