import { InvoiceTypeCode } from "../../codes";
import {
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
  UBLJsonParty,
  UBLJsonPaymentMeans,
  UBLJsonPaymentTerms,
  UBLJsonPrepaidPayment,
  UBLJsonSignature,
  UBLJsonTaxExchangeRate,
  UBLJsonTaxTotal,
  UBLJsonTime,
  // UBLJsonExtensionsContainer, // Will define a more specific structure
  UBLJsonValue,
} from "./ubl_json";
// Import for UBLDocumentSignatureExtension is for context; JSON structure handled by UBLJsonSignatureExtensionContent

// --- Main RefundNote v1.1 JSON Structure (Content of the "Invoice" array for a Refund Note) ---
/**
 * Represents the core content of a UBL Refund Note, version 1.1.
 * This structure is typically found within the 'Invoice' array of the root document
 * as per MyInvois samples, despite being a Refund Note.
 */
export interface UBLJsonRefundNoteV1_1_Content {
  /**
   * Refund Note Code / Number.
   * Document reference number used by Supplier for internal tracking purpose.
   * Maps to UBL: /ubl:Invoice/cbc:ID
   */
  ID: UBLJsonIdentifier;
  /**
   * Date of issuance of the e-Invoice.
   * Note that the date must be the current date.
   * Maps to UBL: /ubl:Invoice/cbc:IssueDate
   */
  IssueDate: UBLJsonDate;
  /**
   * Time of issuance of the e-Invoice.
   * Note that the time must be the current time.
   * Maps to UBL: /ubl:Invoice/cbc:IssueTime
   */
  IssueTime: UBLJsonTime;
  /**
   * e-Invoice Type Code and Version.
   * Identifies the document type (e.g., invoice, credit note, debit note, refund note, etc.)
   * and e-Invoice version (e.g., 1.0, 2.0, etc.).
   * TypeCode maps to UBL: /ubl:Invoice/cbc:InvoiceTypeCode (Value should be "04" for Refund Note).
   * listVersionID attribute maps to UBL: /ubl:Invoice/cbc:InvoiceTypeCode/@listVersionID.
   */
  InvoiceTypeCode: (UBLJsonValue<InvoiceTypeCode> & {
    listVersionID: string;
  })[];
  /**
   * Invoice Currency Code.
   * Specific currency that is used to represent the monetary value stated in the e-Invoice.
   * Maps to UBL: /ubl:Invoice/cbc:DocumentCurrencyCode
   */
  DocumentCurrencyCode: UBLJsonValue<string>[];
  /**
   * Optional Tax Currency Code.
   * Maps to UBL: /ubl:Invoice/cbc:TaxCurrencyCode
   */
  TaxCurrencyCode?: UBLJsonValue<string>[];
  /**
   * Optional. Billing period information.
   * Contains Frequency of Billing, Billing Period Start Date, and Billing Period End Date.
   * Maps to UBL: /ubl:Invoice/cac:InvoicePeriod
   */
  InvoicePeriod?: UBLJsonInvoicePeriod[];
  /**
   * Billing reference information.
   * Crucial for Refund Note, typically containing Additional Document References.
   * Contains Original e-Invoice Reference Number (mapping to /ubl:Invoice/cac:BillingReference/cac:InvoiceDocumentReference/cbc:UUID and cbc:ID).
   * Contains Bill Reference Number (mapping to /ubl:Invoice/cac:BillingReference/cac:AdditionalDocumentReference/cbc:ID).
   * Maps to UBL: /ubl:Invoice/cac:BillingReference
   */
  BillingReference?: UBLJsonBillingReference[];
  /**
   * Optional. Additional document references.
   * Used for Reference Number of Customs Form No.1, 9, etc., Incoterms, Free Trade Agreement (FTA) Information, and Reference Number of Customs Form No.2.
   * Maps to UBL: /ubl:Invoice/cac:AdditionalDocumentReference
   */
  AdditionalDocumentReference?: UBLJsonDocumentReference[];
  /**
   * Supplier (Seller) information.
   * Contains Authorisation Number for Certified Exporter (mapping to /ubl:Invoice/cac:AccountingSupplierParty/cbc:AdditionalAccountID [@schemeAgencyName=’CertEx’]).
   * Maps to UBL: /ubl:Invoice/cac:AccountingSupplierParty
   */
  AccountingSupplierParty: UBLJsonParty[];
  /**
   * Buyer information.
   * Maps to UBL: /ubl:Invoice/cac:AccountingCustomerParty
   */
  AccountingCustomerParty: UBLJsonParty[];
  /**
   * Optional. Delivery information.
   * Contains Shipping Recipient’s Name, Shipping Recipient’s Address, Shipping Recipient’s TIN, Shipping Recipient’s Registration Number.\n   * Also contains Details of other charges (mapping to /ubl:Invoice/cac:Delivery/cac:Shipment/...).\n
   * Maps to UBL: /ubl:Invoice/cac:Delivery
   */
  Delivery?: UBLJsonDelivery[];
  /**
   * Optional. Payment means information.
   * Contains Payment Mode (mapping to /ubl:Invoice/cac:PaymentMeans/cbc:PaymentMeansCode) and Supplier’s Bank Account Number (mapping to /ubl:Invoice/cac:PaymentMeans/cac:PayeeFinancialAccount/cbc:ID).
   * Maps to UBL: /ubl:Invoice/cac:PaymentMeans
   */
  PaymentMeans?: UBLJsonPaymentMeans[];
  /**
   * Optional. Payment terms.
   * Contains Payment Terms note (mapping to /ubl:Invoice/cac:PaymentTerms/cbc:Note).
   * Maps to UBL: /ubl:Invoice/cac:PaymentTerms
   */
  PaymentTerms?: UBLJsonPaymentTerms[];
  /**
   * Optional. Prepaid payment information.
   * Contains PrePayment Amount, PrePayment Date, PrePayment Time, and PrePayment Reference Number.
   * Maps to UBL: /ubl:Invoice/cac:PrepaidPayment
   */
  PrepaidPayment?: UBLJsonPrepaidPayment[];
  /**
   * Optional. Document level allowances or charges.
   * Contains Invoice Additional Discount Amount and Invoice Additional Fee Amount.
   * Maps to UBL: /ubl:Invoice/cac:AllowanceCharge
   */
  AllowanceCharge?: UBLJsonFreightAllowanceCharge[];
  /**
   * Optional. Currency exchange rate information.
   * Maps to UBL: /ubl:Invoice/cac:TaxExchangeRate
   */
  TaxExchangeRate?: UBLJsonTaxExchangeRate[];
  /**
   * Tax total information for the refund note.
   * Contains Total Tax Amount, Total Taxable Amount Per Tax Type, Total Tax Amount Per Tax Type, Details of Tax Exemption, Amount Exempted from Tax, and Tax Type.
   * Maps to UBL: /ubl:Invoice/cac:TaxTotal
   */
  TaxTotal: UBLJsonTaxTotal[];
  /**
   * Legal monetary total summary for the refund note.
   * Contains Total Excluding Tax, Total Including Tax, Total Payable Amount, Total Net Amount, Total Discount Value, Total Fee / Charge Amount, and Rounding Amount.
   * Maps to UBL: /ubl:Invoice/cac:LegalMonetaryTotal
   */
  LegalMonetaryTotal: UBLJsonLegalMonetaryTotal[];
  /**
   * Refund note line items.
   * Maps to UBL: /ubl:Invoice/cac:InvoiceLine
   */
  InvoiceLine: UBLJsonInvoiceLine[]; // Line items detailing the refund
  /**
   * Digital signature information.
   * An electronic signature to authenticate the e-Invoice.
   * Maps to UBL: /ubl:Invoice/cac:Signature
   */
  Signature: UBLJsonSignature[];
  /**
   * UBL Extensions, typically for digital signatures or other extended information.
   * Maps to UBL: /ubl:Invoice/ubl:UBLExtensions
   */
  UBLExtensions: UBLJsonExtensions;
}

// --- Main RefundNote v1.0 JSON Structure (Content of the "Invoice" array for a Refund Note) ---
/**
 * Represents the core content of a UBL Refund Note, version 1.0.
 * Excludes UBLExtensions and Signature compared to V1.1.
 * This structure is typically found within the 'Invoice' array of the root document
 * as per MyInvois samples, despite being a Refund Note.
 */
export type UBLJsonRefundNoteV1_0_Content = Omit<
  UBLJsonRefundNoteV1_1_Content,
  "Signature" | "UBLExtensions"
>;

// --- Root RefundNote Document Structure v1.1 (following Invoice-like structure from sample) ---
/**
 * Represents the root structure for a UBL Refund Note Document, version 1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonRefundNoteDocumentV1_1 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2". Maps to UBL: /ubl:Invoice/@xmlns */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2". Maps to UBL: /ubl:Invoice/@xmlns:cac */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2". Maps to UBL: /ubl:Invoice/@xmlns:cbc */
  _B: string;
  /** Array containing the main refund note content. The key is "Invoice" as per MyInvois samples. */
  Invoice: UBLJsonRefundNoteV1_1_Content[];
}

// --- Root RefundNote Document Structure v1.0 (following Invoice-like structure from sample) ---
/**
 * Represents the root structure for a UBL Refund Note Document, version 1.0.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonRefundNoteDocumentV1_0 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2". Maps to UBL: /ubl:Invoice/@xmlns */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2". Maps to UBL: /ubl:Invoice/@xmlns:cac */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2". Maps to UBL: /ubl:Invoice/@xmlns:cbc */
  _B: string;
  /** Array containing the main refund note content for version 1.0. The key is "Invoice" as per MyInvois samples. */
  Invoice: UBLJsonRefundNoteV1_0_Content[];
}
