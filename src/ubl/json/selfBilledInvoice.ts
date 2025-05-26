import { InvoiceTypeCode } from "./../../codes";
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonAdditionalDocumentReference,
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
  UBLJsonText,
  UBLJsonTime,
  // UBLJsonExtensionsContainer, // Will define a more specific structure
  UBLJsonValue,
} from "./ubl_json";
// Import for UBLDocumentSignatureExtension is for context; JSON structure handled by UBLJsonSignatureExtensionContent

// --- Main SelfBilledInvoice v1.1 JSON Structure (Content of the "Invoice" array for a Self-Billed Invoice) ---
/**
 * Represents the core content of a UBL Self-Billed Invoice, version 1.1.
 * This structure is typically found within the 'Invoice' array of the root document.
 */
export interface UBLJsonSelfBilledInvoiceV1_1_Content {
  /** e-Invoice Code / Number. Document reference number used by Supplier for internal tracking. Maps to UBL: /Invoice/cbc:ID */
  ID: UBLJsonIdentifier;
  /** Date of issuance of the e-Invoice. Must be current date in UTC. Maps to UBL: /Invoice/cbc:IssueDate */
  IssueDate: UBLJsonDate;
  /** Time of issuance of the e-Invoice. Must be current time. Maps to UBL: /Invoice/cbc:IssueTime */
  IssueTime: UBLJsonTime;
  /**
   * e-Invoice Type Code and Version. Identifies document type and e-Invoice version.
   * TypeCode maps to UBL: /Invoice/cbc:InvoiceTypeCode
   * listVersionID attribute maps to UBL: /Invoice/cbc:InvoiceTypeCode/@listVersionID
   * Should be "11" for Self-Billed Invoice, listVersionID is the e-Invoice Version (e.g., "1.1").
   */
  InvoiceTypeCode: (UBLJsonValue<InvoiceTypeCode> & {
    listVersionID: string;
  })[];
  /** Optional Note. Maps to UBL: /Invoice/cbc:Note */
  Note?: UBLJsonText[];
  /** Invoice Currency Code. Specific currency for monetary values in the e-Invoice. Maps to UBL: /Invoice/cbc:DocumentCurrencyCode. Cardinality [1-1]. */
  DocumentCurrencyCode: UBLJsonValue<string>;
  /** Optional Tax Currency Code. Maps to UBL: /Invoice/cbc:TaxCurrencyCode. Cardinality [0-1]. */
  TaxCurrencyCode?: UBLJsonValue<string>;
  /** Optional. Billing period information. Maps to UBL: /Invoice/cac:InvoicePeriod. Cardinality [0-1]. */
  InvoicePeriod?: UBLJsonInvoicePeriod;
  /** Optional. Order Reference. Maps to UBL: /Invoice/cac:OrderReference. */
  OrderReference?: { ID: UBLJsonIdentifier }[];
  /** Optional. Billing reference information, typically containing additional document references. Maps to UBL: /ubl:Invoice / cac:BillingReference. Cardinality [0-1] for the overall BillingReference element containing [1-*] AdditionalDocumentReference. */
  BillingReference?: {
    AdditionalDocumentReference: UBLJsonAdditionalDocumentReference[];
  }[];
  /** Optional. Despatch Document Reference. Maps to UBL: /Invoice/cac:DespatchDocumentReference. */
  DespatchDocumentReference?: UBLJsonDocumentReference[];
  /** Optional. Receipt Document Reference. Maps to UBL: /Invoice/cac:ReceiptDocumentReference. */
  ReceiptDocumentReference?: UBLJsonDocumentReference[];
  /** Optional. Originator Document Reference. Maps to UBL: /Invoice/cac:OriginatorDocumentReference. */
  OriginatorDocumentReference?: UBLJsonDocumentReference[];
  /** Optional. Contract Document Reference. Maps to UBL: /Invoice/cac:ContractDocumentReference. */
  ContractDocumentReference?: UBLJsonDocumentReference[];
  /** Optional. Additional document references not covered by specific fields. Maps to UBL: /Invoice/cac:AdditionalDocumentReference. */
  AdditionalDocumentReference?: UBLJsonDocumentReference[];

  /** Supplier (Seller) information. Maps to UBL: /Invoice/cac:AccountingSupplierParty. Cardinality [1-1]. */
  AccountingSupplierParty: UBLJsonAccountingSupplierParty;
  /** Buyer information. Maps to UBL: /Invoice/cac:AccountingCustomerParty. Cardinality [1-1]. */
  AccountingCustomerParty: UBLJsonAccountingCustomerParty;
  /** Optional Payee Party. Maps to UBL: /Invoice/cac:PayeeParty. Cardinality [0-1]. */
  PayeeParty?: UBLJsonParty;
  /** Optional Tax Representative Party. Maps to UBL: /Invoice/cac:TaxRepresentativeParty. Cardinality [0-1]. */
  TaxRepresentativeParty?: UBLJsonParty;

  /** Optional. Delivery information. Maps to UBL: /Invoice/cac:Delivery. Cardinality [0-1]. */
  Delivery?: UBLJsonDelivery;
  /** Optional. Payment means information. Maps to UBL: /Invoice/cac:PaymentMeans. Cardinality [0-1]. */
  PaymentMeans?: UBLJsonPaymentMeans;
  /** Optional. Payment terms. Maps to UBL: /Invoice/cac:PaymentTerms. Cardinality [0-1]. */
  PaymentTerms?: UBLJsonPaymentTerms;
  /** Optional. Prepaid payment information. Maps to UBL: /Invoice/cac:PrepaidPayment. Cardinality [0-1]. */
  PrepaidPayment?: UBLJsonPrepaidPayment;
  /** Optional. Document level allowances or charges (excluding Shipment level). Maps to UBL: /Invoice/cac:AllowanceCharge. Cardinality [0-*]. */
  AllowanceCharge?: UBLJsonFreightAllowanceCharge[];
  /** Optional. Details of other charges (mapped to Delivery/Shipment/FreightAllowanceCharge in UBL). Maps to UBL: /ubl:Invoice / cac:Delivery / cac:Shipment / cac:FreightAllowanceCharge. Cardinality [0-1]. */
  FreightAllowanceCharge?: UBLJsonFreightAllowanceCharge[];
  /** Optional. Currency exchange rate information. Maps to UBL: /Invoice/cac:TaxExchangeRate. Mandatory where applicable [0-1]. */
  TaxExchangeRate?: UBLJsonTaxExchangeRate;
  /** Tax total information for the invoice. Maps to UBL: /Invoice/cac:TaxTotal. Cardinality [1-1]. */
  TaxTotal: UBLJsonTaxTotal;
  /** Legal monetary total summary for the invoice. Maps to UBL: /Invoice/cac:LegalMonetaryTotal. Cardinality [1-1]. */
  LegalMonetaryTotal: UBLJsonLegalMonetaryTotal;
  /** Invoice line items. Maps to UBL: /Invoice/cac:InvoiceLine. Cardinality [1-*]. */
  InvoiceLine: UBLJsonInvoiceLine[];

  /**
   * Digital signature information. Maps to UBL: /Invoice/cac:Signature.
   * This is specific to Invoice v1.1. Cardinality [1-1].
   */
  Signature: UBLJsonSignature[];

  /** UBL Extensions, typically for digital signatures or other extended information. Maps to UBL: /Invoice/ext:UBLExtensions. Cardinality [1-1]. */
  UBLExtensions: UBLJsonExtensions;
}

// Define V1.0 by omitting signature and extensions
/**
 * Represents the core content of a UBL Self-Billed Invoice, version 1.0.
 * Excludes Signature and UBLExtensions compared to V1.1.
 * This structure is typically found within the 'Invoice' array of the root document.
 */
export type UBLJsonSelfBilledInvoiceV1_0_Content = Omit<
  UBLJsonSelfBilledInvoiceV1_1_Content,
  "Signature" | "UBLExtensions"
>;

// --- Root SelfBilledInvoice Document Structure (following Invoice-like structure from sample) ---
/**
 * Represents the root structure for a UBL Self-Billed Invoice Document, version 1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonSelfBilledInvoiceDocumentV1_1 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" */
  _B: string;
  /** Array containing the main self-billed invoice content for version 1.1. */
  Invoice: UBLJsonSelfBilledInvoiceV1_1_Content[];
}

/**
 * Represents the root structure for a UBL Self-Billed Invoice Document, version 1.0.
 * Excludes UBLExtensions and Signature from the Invoice content compared to V1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonSelfBilledInvoiceDocumentV1_0 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" */
  _B: string;
  /** Array containing the main self-billed invoice content for version 1.0. */
  Invoice: UBLJsonSelfBilledInvoiceV1_0_Content[];
}
