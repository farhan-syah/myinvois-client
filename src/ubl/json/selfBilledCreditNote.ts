import { InvoiceTypeCode } from "../../codes";
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonAdditionalDocumentReference,
  UBLJsonBillingReference,
  UBLJsonDate,
  UBLJsonDelivery,
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
  UBLJsonTime,
  UBLJsonValue,
} from "./ubl_json";
// Import for UBLDocumentSignatureExtension is for context; JSON structure handled by UBLJsonSignatureExtensionContent
import { UBLDocumentSignatureExtension } from "./digitalSignature";

// --- Main SelfBilledCreditNote v1.1 JSON Structure (Content of the "Invoice" array for a Self-Billed Credit Note) ---
/**
 * Represents the core content of a Self-Billed Credit Note document, version 1.1.
 * This structure is found within the 'Invoice' array of the root document.
 */
export interface UBLJsonSelfBilledCreditNoteV1_1_Content {
  /** Document reference number used by Supplier for internal tracking purpose. Maps to UBL: / ubl:Invoice / cbc:ID */
  ID: UBLJsonIdentifier; // Mandatory [1-1]
  /** Date of issuance of the e-Invoice. Must be current date. Maps to UBL: / ubl:Invoice / cbc:IssueDate */
  IssueDate: UBLJsonDate; // Mandatory [1-1]
  /** Time of issuance of the e-Invoice. Must be current time. Maps to UBL: / ubl:Invoice / cbc:IssueTime */
  IssueTime: UBLJsonTime; // Mandatory [1-1]
  /** Identifies the document type (Value: "12") and e-Invoice version (listVersionID). Maps to UBL: / ubl:Invoice / cbc:InvoiceTypeCode and @listVersionID */
  InvoiceTypeCode: Array<
    UBLJsonValue<InvoiceTypeCode> & { listVersionID: string }
  >; // Mandatory [1-1]
  /** Specific currency for monetary values in the e-Invoice. Maps to UBL: / ubl:Invoice / cbc:DocumentCurrencyCode */
  DocumentCurrencyCode: Array<UBLJsonValue<string>>; // Mandatory [1-1], Using Array as per UBLJsonValue structure pattern
  /** Optional Tax Currency Code. Maps to UBL: / ubl:Invoice / cbc:TaxCurrencyCode */
  TaxCurrencyCode?: Array<UBLJsonValue<string>>; // Optional [0-1]
  /** Structure representing the supplier information (Seller on whose behalf Buyer issues). Maps to UBL: / ubl:Invoice / cac:AccountingSupplierParty */
  AccountingSupplierParty: Array<UBLJsonAccountingSupplierParty>; // Mandatory [1-1], Array as per UBLJson structure pattern
  /** Structure representing the buyer information (Buyer issuing the note). Maps to UBL: / ubl:Invoice / cac:AccountingCustomerParty */
  AccountingCustomerParty: Array<UBLJsonAccountingCustomerParty>; // Mandatory [1-1], Array as per UBLJson structure pattern
  /** Optional Billing period information. Maps to UBL: / ubl:Invoice / cac:InvoicePeriod */
  InvoicePeriod?: Array<UBLJsonInvoicePeriod>; // Optional [0-1], Array as per UBLJson structure pattern
  /** Billing reference information, typically containing original e-invoice reference numbers. Maps to UBL: / ubl:Invoice / cac:BillingReference */
  BillingReference?: Array<UBLJsonBillingReference>; // Mandatory where applicable [0-*], Array as per UBLJson structure pattern
  /** Additional document references. Maps to UBL: / ubl:Invoice / cac:AdditionalDocumentReference. Includes Customs forms, FTA, Incoterms. */
  AdditionalDocumentReference?: Array<UBLJsonAdditionalDocumentReference>; // Optional [0-*], Array as per UBLJson structure pattern
  /** Optional Delivery information. Maps to UBL: / ubl:Invoice / cac:Delivery */
  Delivery?: Array<UBLJsonDelivery>; // Optional [0-1], Array as per UBLJson structure pattern
  /** Optional Payment means information. Maps to UBL: / ubl:Invoice / cac:PaymentMeans */
  PaymentMeans?: Array<UBLJsonPaymentMeans>; // Optional [0-1], Array as per UBLJson structure pattern
  /** Optional Payment terms. Maps to UBL: / ubl:Invoice / cac:PaymentTerms */
  PaymentTerms?: Array<UBLJsonPaymentTerms>; // Optional [0-1], Array as per UBLJson structure pattern
  /** Optional Prepaid payment information. Maps to UBL: / ubl:Invoice / cac:PrepaidPayment */
  PrepaidPayment?: Array<UBLJsonPrepaidPayment>; // Optional [0-1], Array as per UBLJson structure pattern
  /** Optional Document level allowances or charges (discounts/fees). Maps to UBL: / ubl:Invoice / cac:AllowanceCharge */
  AllowanceCharge?: Array<UBLJsonFreightAllowanceCharge>; // Optional [0-*], Array as per UBLJson structure pattern
  /** Optional Currency exchange rate information. Maps to UBL: / ubl:Invoice / cac:TaxExchangeRate */
  TaxExchangeRate?: Array<UBLJsonTaxExchangeRate>; // Mandatory where applicable [0-1], Array as per UBLJson structure pattern
  /** Total tax information for the invoice. Maps to UBL: / ubl:Invoice / cac:TaxTotal */
  TaxTotal: Array<UBLJsonTaxTotal>; // Mandatory [1-1], Array as per UBLJson structure pattern
  /** Legal monetary total summary for the invoice. Maps to UBL: / ubl:Invoice / cac:LegalMonetaryTotal */
  LegalMonetaryTotal: Array<UBLJsonLegalMonetaryTotal>; // Mandatory [1-1], Array as per UBLJson structure pattern
  /** Invoice line items. Maps to UBL: / ubl:Invoice / cac:InvoiceLine */
  InvoiceLine: Array<UBLJsonInvoiceLine>; // Mandatory [1-*], Array as per UBLJson structure pattern
  /** Digital signature information. Maps to UBL: / ubl:Invoice / cac:Signature. */
  // Note: MyInvois sample structure for Signature is Array<{ ID: UBLJsonIdentifier; SignatureMethod?: Array<UBLJsonValue<string>>; }>
  Signature: Array<UBLJsonSignature>; // Mandatory [1-1] for v1.1
  /** UBL Extensions, typically for digital signatures. Maps to UBL: ubl:UBLExtensions */
  UBLExtensions: UBLJsonExtensions; // Mandatory [1-1] for v1.1
}

// --- Main SelfBilledCreditNote v1.0 JSON Structure (Content of the "Invoice" array) ---
/**
 * Represents the core content of a Self-Billed Credit Note document, version 1.0.
 * This structure is found within the 'Invoice' array of the root document.
 * It excludes Signature and UBLExtensions compared to v1.1 based on the documentation.
 */
export type UBLJsonSelfBilledCreditNoteV1_0_Content = Omit<
  UBLJsonSelfBilledCreditNoteV1_1_Content,
  "Signature" | "UBLExtensions"
>;

// --- Root SelfBilledCreditNote Document Structure v1.1 ---
/**
 * Represents the root structure for a Self-Billed Credit Note Document, version 1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonSelfBilledCreditNoteDocumentV1_1 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" */
  _D: string; // Should be "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" */
  _A: string; // "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" */
  _B: string; // "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  /** Array containing the main self-billed credit note content. Maps to UBL: ubl:Invoice */
  Invoice: Array<UBLJsonSelfBilledCreditNoteV1_1_Content>; // [1-1] based on root document structure samples
}

// --- Root SelfBilledCreditNote Document Structure v1.0 ---
/**
 * Represents the root structure for a Self-Billed Credit Note Document, version 1.0.
 * Excludes UBLExtensions and Signature from the Invoice content compared to V1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonSelfBilledCreditNoteDocumentV1_0 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" */
  _D: string; // Should be "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" */
  _A: string; // "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" */
  _B: string; // "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  /** Array containing the main self-billed credit note content for version 1.0. Maps to UBL: ubl:Invoice */
  Invoice: Array<UBLJsonSelfBilledCreditNoteV1_0_Content>; // [1-1] based on root document structure samples
}
