import { InvoiceTypeCode } from "../../codes";
import { UBLDocumentSignatureExtension } from "./digitalSignature";
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
  UBLJsonSignatureExtensionContent,
  UBLJsonTaxExchangeRate,
  UBLJsonTaxTotal,
  UBLJsonText,
  UBLJsonTime,
  UBLJsonValue,
} from "./ubl_json";

// --- Main DebitNote v1.1 JSON Structure (Content of the "Invoice" array for a Debit Note) ---
/**
 * Represents the content structure for a UBL Debit Note Document, version 1.1, based on the provided documentation.
 */
export interface UBLJsonDebitNoteV1_1_Content {
  /** e-Invoice Code / Number. Document reference number used by Supplier for internal tracking purpose. Maps to UBL: /ubl:Invoice / cbc:ID */
  ID: UBLJsonIdentifier;
  /** Date of issuance of the e-Invoice. Note that the date must be the current date. Maps to UBL: /ubl:Invoice / cbc:IssueDate */
  IssueDate: UBLJsonDate;
  /** Time of issuance of the e-Invoice. Note that the time must be the current time. Maps to UBL: /ubl:Invoice / cbc:IssueTime */
  IssueTime: UBLJsonTime;
  /** Identifies the document type (e.g., invoice, credit note, debit note, refund note, etc.). Maps to UBL: /ubl:Invoice / cbc:InvoiceTypeCode. Also includes e-Invoice Version (listVersionID attribute) mapping to UBL: /ubl:Invoice / cbc:InvoiceTypeCode / @listVersionID. Should be "03" for Debit Note. */
  InvoiceTypeCode: Array<
    UBLJsonValue<InvoiceTypeCode> & { listVersionID: string }
  >;
  /** Specific currency that is used to represent the monetary value stated in the e-Invoice. Maps to UBL: /ubl:Invoice / cbc:DocumentCurrencyCode */
  DocumentCurrencyCode: Array<UBLJsonValue<string>>;
  /** Optional Tax Currency Code. Maps to UBL: /ubl:Invoice / cbc:TaxCurrencyCode */
  TaxCurrencyCode?: Array<UBLJsonValue<string>>;

  /** Optional. Billing period information, including frequency, start and end dates. Maps to UBL: /ubl:Invoice / cac:InvoicePeriod */
  InvoicePeriod?: Array<UBLJsonInvoicePeriod>;
  /** Billing reference information, typically referencing the original Invoice, including Original e-Invoice Reference Number and Bill Reference Number. Maps to UBL: /ubl:Invoice / cac:BillingReference. Mandatory where applicable according to doc. */
  BillingReference: Array<UBLJsonBillingReference>;
  /** Optional. Additional document references, including Customs Form references, Incoterms, and Free Trade Agreement information. Maps to UBL: /ubl:Invoice / cac:AdditionalDocumentReference. Mandatory where applicable according to doc. */
  AdditionalDocumentReference?: Array<UBLJsonDocumentReference>;

  /** Supplier (Seller) information. Maps to UBL: /ubl:Invoice / cac:AccountingSupplierParty */
  AccountingSupplierParty: Array<UBLJsonAccountingSupplierParty>; // Mandatory
  /** Buyer information. Maps to UBL: /ubl:Invoice / cac:AccountingCustomerParty */
  AccountingCustomerParty: Array<UBLJsonAccountingCustomerParty>; // Mandatory

  /** Optional. Delivery information, including shipping recipient details and other charges. Maps to UBL: /ubl:Invoice / cac:Delivery */
  Delivery?: Array<UBLJsonDelivery>;
  /** Optional. Payment means information, including payment mode and supplier's bank account. Maps to UBL: /ubl:Invoice / cac:PaymentMeans */
  PaymentMeans?: Array<UBLJsonPaymentMeans>;
  /** Optional. Payment terms and conditions. Maps to UBL: /ubl:Invoice / cac:PaymentTerms */
  PaymentTerms?: Array<UBLJsonPaymentTerms>;
  /** Optional. Prepaid payment information, including amount, date, time, and reference number. Maps to UBL: /ubl:Invoice / cac:PrepaidPayment */
  PrepaidPayment?: Array<UBLJsonPrepaidPayment>;
  /** Optional. Document level allowances or charges, including Invoice Additional Discount Amount and Invoice Additional Fee Amount. Maps to UBL: /ubl:Invoice / cac:AllowanceCharge */
  AllowanceCharge?: Array<UBLJsonFreightAllowanceCharge>;
  /** Optional. Currency exchange rate information. Mandatory where applicable. Maps to UBL: /ubl:Invoice / cac:TaxExchangeRate */
  TaxExchangeRate?: Array<UBLJsonTaxExchangeRate>;

  /** Tax total information for the debit note, including total tax amount, taxable amounts per tax type, tax amount per tax type, details of tax exemption, amount exempted from tax, and tax type. Maps to UBL: /ubl:Invoice / cac:TaxTotal. Mandatory. */
  TaxTotal: Array<UBLJsonTaxTotal>;
  /** Legal monetary total summary for the debit note, including total excluding tax, total including tax, total payable amount, total net amount, total discount value, total fee/charge amount, and rounding amount. Maps to UBL: /ubl:Invoice / cac:LegalMonetaryTotal. Mandatory. */
  LegalMonetaryTotal: Array<UBLJsonLegalMonetaryTotal>;
  /** Debit note line items, detailing the debit. Maps to UBL: /ubl:Invoice / cac:InvoiceLine. Mandatory. */
  InvoiceLine: Array<UBLJsonInvoiceLine>;

  /**
   * Digital signature information. Mandatory. Maps to UBL: /ubl:Invoice / cac:Signature.
   */
  Signature: Array<UBLJsonSignature>;

  /** UBL Extensions, typically for digital signatures or other extended information. Included for V1.1 as it is tied to the digital signature. Mandatory for V1.1 according to creditNote.ts example. */
  UBLExtensions: UBLJsonExtensions;
}

/**
 * Represents the content structure for a UBL Debit Note Document, version 1.0.
 * Excludes Signature and UBLExtensions.
 */
export type UBLJsonDebitNoteV1_0_Content = Omit<
  UBLJsonDebitNoteV1_1_Content,
  "Signature" | "UBLExtensions"
>;

/**
 * Represents the root structure for a UBL Debit Note Document, version 1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonDebitNoteDocumentV1_1 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2". */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2". */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2". */
  _B: string;
  /** Array containing the main debit note content for version 1.1. Even for a Debit Note, the sample uses "Invoice" as the main array key. */
  Invoice: Array<UBLJsonDebitNoteV1_1_Content>;
}

/**
 * Represents the root structure for a UBL Debit Note Document, version 1.0.
 * Excludes UBLExtensions and Signature from the Debit Note content compared to V1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonDebitNoteDocumentV1_0 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2". */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2". */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2". */
  _B: string;
  /** Array containing the main debit note content for version 1.0. */
  Invoice: Array<UBLJsonDebitNoteV1_0_Content>;
}
