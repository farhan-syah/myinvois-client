import { InvoiceTypeCode } from "../../codes";
import {
  UBLJsonAccountingCustomerParty,
  UBLJsonAccountingSupplierParty,
  UBLJsonAdditionalDocumentReference,
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
  UBLJsonText,
  UBLJsonTime,
  UBLJsonValue,
} from "./ubl_json";

// --- Main Invoice v1.1 JSON Structure (within the "Invoice" array) ---
/**
 * Represents the core content of a UBL Invoice, version 1.1.
 * This structure is typically found within the 'Invoice' array of the root document.
 */
export interface UBLJsonInvoiceV1_1_Content {
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
   */
  InvoiceTypeCode: (UBLJsonValue<InvoiceTypeCode> & {
    listVersionID: string;
  })[];
  /** Invoice Currency Code. Specific currency for monetary values in the e-Invoice. Maps to UBL: /Invoice/cbc:DocumentCurrencyCode */
  DocumentCurrencyCode: UBLJsonText;
  /** Optional Tax Currency Code. Maps to UBL: /Invoice/cbc:TaxCurrencyCode */
  TaxCurrencyCode?: UBLJsonText;
  /** Optional. Billing period information. Maps to UBL: /Invoice/cac:InvoicePeriod */
  InvoicePeriod?: UBLJsonInvoicePeriod[];
  /** Optional. Billing reference information, typically containing additional document references. */
  BillingReference?: {
    AdditionalDocumentReference: UBLJsonAdditionalDocumentReference[];
  }[];
  /** Optional. Additional document references. Maps to UBL: /Invoice/cac:AdditionalDocumentReference */
  AdditionalDocumentReference?: UBLJsonAdditionalDocumentReference[];
  /** Supplier (Seller) information. Maps to UBL: /Invoice/cac:AccountingSupplierParty */
  AccountingSupplierParty: UBLJsonAccountingSupplierParty[];
  /** Buyer information. Maps to UBL: /Invoice/cac:AccountingCustomerParty */
  AccountingCustomerParty: UBLJsonAccountingCustomerParty[];
  /** Optional. Delivery information. Maps to UBL: /Invoice/cac:Delivery */
  Delivery?: UBLJsonDelivery[];
  /** Optional. Payment means information. Maps to UBL: /Invoice/cac:PaymentMeans */
  PaymentMeans?: UBLJsonPaymentMeans[];
  /** Optional. Payment terms. Maps to UBL: /Invoice/cac:PaymentTerms */
  PaymentTerms?: UBLJsonPaymentTerms[];
  /** Optional. Prepaid payment information. Maps to UBL: /Invoice/cac:PrepaidPayment */
  PrepaidPayment?: UBLJsonPrepaidPayment[];
  /** Optional. Document level allowances or charges. Maps to UBL: /Invoice/cac:AllowanceCharge */
  AllowanceCharge?: UBLJsonFreightAllowanceCharge[];
  /** Optional. Currency exchange rate information. Maps to UBL: /Invoice/cac:TaxExchangeRate */
  TaxExchangeRate?: UBLJsonTaxExchangeRate[];
  /** Tax total information for the invoice. Maps to UBL: /Invoice/cac:TaxTotal */
  TaxTotal: UBLJsonTaxTotal[];
  /** Legal monetary total summary for the invoice. Maps to UBL: /Invoice/cac:LegalMonetaryTotal */
  LegalMonetaryTotal: UBLJsonLegalMonetaryTotal[];
  /** Invoice line items. Maps to UBL: /Invoice/cac:InvoiceLine */
  InvoiceLine: UBLJsonInvoiceLine[];
  /** UBL Extensions, typically for digital signatures or other extended information. */
  UBLExtensions: UBLJsonExtensions;
  /**
   * Digital signature information. Maps to UBL: /Invoice/cac:Signature.
   * This is specific to Invoice v1.1 as per this model.
   */
  Signature: UBLJsonSignature[];
}

export type UBLJsonInvoiceV1_0_Content = Omit<
  UBLJsonInvoiceV1_1_Content,
  "Signature" | "UBLExtensions"
>;

// --- Root Invoice Document Structure (as per the example) ---
/**
 * Represents the root structure for a UBL Invoice Document, version 1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonInvoiceDocumentV1_1 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" */
  _B: string;
  /** Array containing the main invoice content. */
  Invoice: UBLJsonInvoiceV1_1_Content[];
}

// --- Root Invoice Document Structure (as per the example) ---
/**
 * Represents the root structure for a UBL Invoice Document, version 1.0.
 * Excludes UBLExtensions and Signature from the Invoice content compared to V1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonInvoiceDocumentV1_0 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" */
  _B: string;
  /** Array containing the main invoice content for version 1.0. */
  Invoice: UBLJsonInvoiceV1_0_Content[];
}
