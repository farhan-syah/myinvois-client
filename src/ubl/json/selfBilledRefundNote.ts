// einvoice/src/ubl/json/selfBilledRefundNote.ts
import { InvoiceTypeCode } from "../../codes";
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonBillingReference,
  UBLJsonDate,
  UBLJsonDelivery,
  UBLJsonDocumentReference,
  UBLJsonExtensions,
  UBLJsonFreightAllowanceCharge,
  UBLJsonIdentifier,
  UBLJsonInvoiceLine,
  UBLJsonInvoicePeriod,
  UBLJsonLegalMonetaryTotal,
  UBLJsonPaymentMeans,
  UBLJsonPaymentTerms,
  UBLJsonPrepaidPayment,
  UBLJsonSignature,
  UBLJsonTaxExchangeRate,
  UBLJsonTaxTotal,
  UBLJsonText,
  UBLJsonTime,
  UBLJsonValue,
} from "./ubl_json";
// Import for UBLDocumentSignatureExtension is for context; JSON structure handled by UBLJsonSignatureExtensionContent
import { UBLDocumentSignatureExtension } from "./digitalSignature";

// --- Main SelfBilledRefundNote v1.1 JSON Structure (Content of the "Invoice" array for a Self-Billed Refund Note) ---
/**
 * Represents the content structure for a UBL Self-Billed Refund Note Document, version 1.1,
 * based on the provided documentation, intended for the "Invoice" array.
 */
export interface UBLJsonSelfBilledRefundNoteV1_1_Content {
  /**
   * Document reference number used by Supplier for internal tracking purpose.
   * Maps to UBL: /ubl:Invoice / cbc:ID
   * Cardinality: [1-1]
   */
  ID: UBLJsonIdentifier;
  /**
   * Date of issuance of the e-Invoice.
   * Note that the date must be the current date.
   * Maps to UBL: /ubl:Invoice / cbc:IssueDate
   * Cardinality: [1-1]
   */
  IssueDate: UBLJsonDate;
  /**
   * Time of issuance of the e-Invoice.
   * Note that the time must be the current time.
   * Maps to UBL: /ubl:Invoice / cbc:IssueTime
   * Cardinality: [1-1]
   */
  IssueTime: UBLJsonTime;
  /**
   * Identifies the document type (e.g., invoice, credit note, debit note, refund note, etc.).
   * Should be "14" for Self-Billed Refund Note.
   * Maps to UBL: /ubl:Invoice / cbc:InvoiceTypeCode.
   * Also includes e-Invoice Version (listVersionID attribute) mapping to UBL:
   * /ubl:Invoice / cbc:InvoiceTypeCode / @listVersionID.
   * Cardinality: [1-1]
   */
  InvoiceTypeCode: Array<
    UBLJsonValue<InvoiceTypeCode> & { listVersionID: string }
  >;
  /**
   * Specific currency that is used to represent the monetary value stated in the e-Invoice.
   * Maps to UBL: /ubl:Invoice / cbc:DocumentCurrencyCode
   * Cardinality: [1-1]
   */
  DocumentCurrencyCode: Array<UBLJsonValue<string>>;
  /**
   * Optional Tax Currency Code.
   * Maps to UBL: /ubl:Invoice / cbc:TaxCurrencyCode
   * Cardinality: [0-1]
   */
  TaxCurrencyCode?: Array<UBLJsonValue<string>>;

  /**
   * Structure representing the supplier information (Supplier on whose behalf Buyer issues).
   * Maps to UBL: /ubl:Invoice / cac:AccountingSupplierParty
   * Cardinality: [1-1]
   * Note: Includes Authorisation Number for Certified Exporter mapped to cbc:AdditionalAccountID[@schemeAgencyName='CertEx'] within UBLJsonAccountingSupplierParty.
   */
  AccountingSupplierParty: Array<UBLJsonAccountingSupplierParty>;
  /**
   * Structure representing the buyer information (Buyer issuing the note).
   * Maps to UBL: /ubl:Invoice / cac:AccountingCustomerParty
   * Cardinality: [1-1]
   */
  AccountingCustomerParty: Array<UBLJsonAccountingCustomerParty>;

  /**
   * Billing reference information, typically referencing the original Invoice, including Original e-Invoice Reference Number and Bill Reference Number.
   * Maps to UBL: /ubl:Invoice / cac:BillingReference.
   * Cardinality: [0-*] (Mandatory where applicable)
   * Note: Original e-Invoice Reference Number maps to cac:InvoiceDocumentReference/cbc:UUID and cbc:ID within UBLJsonBillingReference.
   * Note: Bill Reference Number maps to cac:AdditionalDocumentReference/cbc:ID within UBLJsonBillingReference.
   */
  BillingReference: Array<UBLJsonBillingReference>;

  /**
   * Optional. Additional document references, including Customs Form references, Incoterms, and Free Trade Agreement information.
   * Maps to UBL: /ubl:Invoice / cac:AdditionalDocumentReference.
   * Cardinality: [0-*] (Mandatory where applicable according to doc, but UBL cardinality is 0..*)
   * Note: Customs Form references map to cbc:ID with cbc:DocumentType="CustomsImportForm" or "K2" within UBLJsonDocumentReference.
   * Note: Incoterms map to cbc:DocumentType (or potentially cbc:ID depending on specific MyInvois interpretation) within a UBLJsonDocumentReference instance.
   * Note: Free Trade Agreement info maps to cbc:DocumentType="FreeTradeAgreement", cbc:ID="FTA", and cbc:DocumentDescription within UBLJsonDocumentReference.
   * The documentation's specific index references (e.g., [1], [2], [3], [4]) are unusual for UBL JSON and should not be interpreted as requiring a specific order or fixed array size for different document types within this array.
   */
  AdditionalDocumentReference?: Array<UBLJsonDocumentReference>;

  /**
   * Optional. Billing period information, including frequency, start and end dates.
   * Maps to UBL: /ubl:Invoice / cac:InvoicePeriod
   * Cardinality: [0-1]
   * Note: Frequency of Billing maps to cbc:Description within UBLJsonInvoicePeriod.
   */
  InvoicePeriod?: Array<UBLJsonInvoicePeriod>;

  /**
   * Optional. Delivery information, including shipping recipient details and other charges.
   * Maps to UBL: /ubl:Invoice / cac:Delivery
   * Cardinality: [0-1]
   * Note: Shipping Recipient details (Name, Address, TIN, Registration Number) map to cac:DeliveryParty nested elements within UBLJsonDelivery.
   * Note: Details of other charges map to cac:Shipment/cac:FreightAllowanceCharge within UBLJsonDelivery, linked by Shipment/cbc:ID matching the e-Invoice Code / Number.
   * Although the type structure allows for arrays for DeliveryParty and Shipment (from ubl_json.ts), the documentation implies a [0-1] cardinality for the overall Delivery element.
   */
  Delivery?: Array<UBLJsonDelivery>; // Note: Documentation implies [0-1] cardinality for the element itself

  /**
   * Optional. Payment means information, including payment mode and supplier's bank account.
   * Maps to UBL: /ubl:Invoice / cac:PaymentMeans
   * Cardinality: [0-1]
   * Note: Payment Mode maps to cbc:PaymentMeansCode within UBLJsonPaymentMeans.
   * Note: Supplier's Bank Account Number maps to cac:PayeeFinancialAccount/cbc:ID within UBLJsonPaymentMeans.
   */
  PaymentMeans?: Array<UBLJsonPaymentMeans>;
  /**
   * Optional. Payment terms and conditions.
   * Maps to UBL: /ubl:Invoice / cac:PaymentTerms
   * Cardinality: [0-1]
   * Note: Maps to cbc:Note within UBLJsonPaymentTerms.
   */
  PaymentTerms?: Array<UBLJsonPaymentTerms>;
  /**
   * Optional. Prepaid payment information, including amount, date, time, and reference number.
   * Maps to UBL: /ubl:Invoice / cac:PrepaidPayment
   * Cardinality: [0-1]
   * Note: PrePayment Amount maps to cbc:PaidAmount, PrePayment Date maps to cbc:PaidDate, PrePayment Time maps to cbc:PaidTime, and PrePayment Reference Number maps to cbc:ID, all within UBLJsonPrepaidPayment.
   */
  PrepaidPayment?: Array<UBLJsonPrepaidPayment>;
  /**
   * Optional. Document level allowances or charges, including Invoice Additional Discount Amount and Invoice Additional Fee Amount.
   * Maps to UBL: /ubl:Invoice / cac:AllowanceCharge
   * Cardinality: [0-*]
   * Note: Discount maps to cbc:ChargeIndicator = false. Fee/Charge maps to cbc:ChargeIndicator = true. The amount maps to cbc:Amount and reason to cbc:AllowanceChargeReason.
   * The documentation mentions MultiplierFactorNumeric for rates, which is not included in the UBLJsonFreightAllowanceCharge type definition and cannot be mapped with the current types.
   */
  AllowanceCharge?: Array<UBLJsonFreightAllowanceCharge>;

  /**
   * Optional. Currency exchange rate information. Mandatory where applicable (non-MYR document currency).
   * Maps to UBL: /ubl:Invoice / cac:TaxExchangeRate
   * Cardinality: [0-1]
   * Note: Currency Exchange Rate maps to cbc:CalculationRate, cbc:SourceCurrencyCode, and cbc:TargetCurrencyCode within UBLJsonTaxExchangeRate.
   */
  TaxExchangeRate?: Array<UBLJsonTaxExchangeRate>;

  /**
   * Tax total information for the refund note, including total tax amount and subtotals per tax type.
   * Maps to UBL: /ubl:Invoice / cac:TaxTotal.
   * Cardinality: [1-1]
   * Note: Includes Total Tax Amount (cbc:TaxAmount). Tax subtotals (cac:TaxSubtotal) include Total Taxable Amount Per Tax Type (cbc:TaxableAmount), Total Tax Amount Per Tax Type (cbc:TaxAmount),
   * Details of Tax Exemption (cac:TaxCategory/cbc:TaxExemptionReason and conditions like TaxAmount=0, TaxCategory/ID='E', TaxScheme/ID='OTH'),
   * and Amount Exempted from Tax (cbc:TaxableAmount under exemption conditions).
   */
  TaxTotal: Array<UBLJsonTaxTotal>;
  /**
   * Legal monetary total summary for the refund note, including various total amounts.
   * Maps to UBL: /ubl:Invoice / cac:LegalMonetaryTotal.
   * Cardinality: [1-1]
   * Note: Includes Total Net Amount (cbc:LineExtensionAmount), Total Excluding Tax (cbc:TaxExclusiveAmount),
   * Total Including Tax (cbc:TaxInclusiveAmount), Total Payable Amount (cbc:PayableAmount),
   * Total Discount Value (cbc:AllowanceTotalAmount), Total Fee / Charge Amount (cbc:ChargeTotalAmount),
   * PrePayment Amount (cbc:PrepaidAmount - summary reference), and Rounding Amount (cbc:PayableRoundingAmount).
   */
  LegalMonetaryTotal: Array<UBLJsonLegalMonetaryTotal>;

  /**
   * Refund note line items, detailing the refund.
   * Maps to UBL: /ubl:Invoice / cac:InvoiceLine.
   * Cardinality: [1-*]
   * Note: The UBLJsonInvoiceLine structure includes fields for line-specific Classification, Description, Unit Price, Quantity, Measurement, Tax Total (including Tax Amount, Tax Type, Tax Rate, Exemption details, Amount Exempted), Subtotal, Total Excluding Tax (Line Extension Amount), Discount/Fee/Charge Amount/Rate, Product Tariff Code, and Country of Origin.
   * Based on the documentation, the 'Description' and 'TaxTotal' fields within UBLJsonInvoiceLine should be mandatory, and the AllowanceCharge within InvoiceLine should support MultiplierFactorNumeric for rates, which may not be fully reflected in the current UBLJsonInvoiceLine definition from ubl_json.ts.
   */
  InvoiceLine: Array<UBLJsonInvoiceLine>;

  /**
   * Digital signature information. Mandatory for V1.1.
   * Maps to UBL: /ubl:Invoice / cac:Signature.
   * Cardinality: [1-1]
   * Note: Structure includes cbc:ID and cac:SignatureMethod/cbc:ID.
   */
  Signature: Array<UBLJsonSignature>;

  /**
   * UBL Extensions, typically for digital signatures or other extended information.
   * Included for V1.1 as it is tied to the digital signature. Mandatory for V1.1.
   * Maps to UBL: ubl:Invoice / ext:UBLExtensions
   * Cardinality: [1-1]
   */
  UBLExtensions: UBLJsonExtensions;
}

// --- Main SelfBilledRefundNote v1.0 JSON Structure (Content of the "Invoice" array for a Self-Billed Refund Note) ---
/**
 * Represents the content structure for a UBL Self-Billed Refund Note Document, version 1.0.
 * Excludes Signature and UBLExtensions compared to V1.1 as per documentation implying no signature for V1.0.
 */
export type UBLJsonSelfBilledRefundNoteV1_0_Content = Omit<
  UBLJsonSelfBilledRefundNoteV1_1_Content,
  "Signature" | "UBLExtensions"
>;

// --- Root SelfBilledRefundNote Document Structure v1.1 (following Invoice-like structure from sample) ---
/**
 * Represents the root structure for a UBL Self-Billed Refund Note Document, version 1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonSelfBilledRefundNoteDocumentV1_1 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2". */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2". */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2". */
  _B: string;
  /** Array containing the main self-billed refund note content for version 1.1. Even for a Self-Billed Refund Note, the sample uses "Invoice" as the main array key. */
  Invoice: Array<UBLJsonSelfBilledRefundNoteV1_1_Content>;
}

// --- Root SelfBilledRefundNote Document Structure v1.0 ---
/**
 * Represents the root structure for a UBL Self-Billed Refund Note Document, version 1.0.
 * Excludes Signature and UBLExtensions from the content compared to V1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonSelfBilledRefundNoteDocumentV1_0 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2". */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2". */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2". */
  _B: string;
  /** Array containing the main self-billed refund note content for version 1.0. */
  Invoice: Array<UBLJsonSelfBilledRefundNoteV1_0_Content>;
}
