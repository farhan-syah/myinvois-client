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
  UBLJsonParty,
  UBLJsonPaymentMeans,
  UBLJsonPaymentTerms,
  UBLJsonPrepaidPayment,
  UBLJsonSignature,
  UBLJsonSignatureExtensionContent,
  UBLJsonTaxExchangeRate,
  UBLJsonTaxTotal,
  UBLJsonText,
  UBLJsonTime,
  // UBLJsonExtensionsContainer, // Will define a more specific structure
  UBLJsonValue,
} from "./ubl_json";

export interface UBLJsonCreditNoteV1_1_Content {
  /** Credit Note Code / Number. Document reference number used by Supplier for internal tracking purpose. Maps to UBL: /ubl:Invoice / cbc:ID */
  ID: UBLJsonIdentifier;
  /** Date of issuance of the e-Invoice. Maps to UBL: /ubl:Invoice / cbc:IssueDate */
  IssueDate: UBLJsonDate;
  /** Time of issuance of the e-Invoice. Maps to UBL: /ubl:Invoice / cbc:IssueTime */
  IssueTime: UBLJsonTime;
  /** Identifies the document type (e.g., invoice, credit note, debit note, refund note, etc.). Maps to UBL: /ubl:Invoice / cbc:InvoiceTypeCode. listVersionID attribute maps to UBL: /ubl:Invoice / cbc:InvoiceTypeCode / @listVersionID. Should be "02" for Credit Note. */
  InvoiceTypeCode: Array<
    UBLJsonValue<InvoiceTypeCode> & { listVersionID: string }
  >;
  /** Specific currency that is used to represent the monetary value stated in the e-Invoice. Maps to UBL: /ubl:Invoice / cbc:DocumentCurrencyCode */
  DocumentCurrencyCode: Array<UBLJsonValue<string>>;
  /** Optional Tax Currency Code. Maps to UBL: /ubl:Invoice / cbc:TaxCurrencyCode */
  TaxCurrencyCode?: Array<UBLJsonValue<string>>;
  /** Optional. Billing period information. Maps to UBL: /ubl:Invoice / cac:InvoicePeriod */
  InvoicePeriod?: Array<UBLJsonInvoicePeriod>;
  /** Optional. Order reference information. Maps to UBL: /ubl:Invoice / cac:OrderReference */
  OrderReference?: Array<{ ID: UBLJsonIdentifier }>;
  /** Optional. Billing reference information, typically referencing the original Invoice. Maps to UBL: /ubl:Invoice / cac:BillingReference */
  BillingReference?: Array<UBLJsonBillingReference>;
  /** Optional. Despatch document reference. Maps to UBL: /ubl:Invoice / cac:DespatchDocumentReference */
  DespatchDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Optional. Receipt document reference. Maps to UBL: /ubl:Invoice / cac:ReceiptDocumentReference */
  ReceiptDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Optional. Originator document reference. Maps to UBL: /ubl:Invoice / cac:OriginatorDocumentReference */
  OriginatorDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Optional. Contract document reference. Maps to UBL: /ubl:Invoice / cac:ContractDocumentReference */
  ContractDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Optional. Additional document references. Maps to UBL: /ubl:Invoice / cac:AdditionalDocumentReference */
  AdditionalDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Supplier (Seller) information. Maps to UBL: /ubl:Invoice / cac:AccountingSupplierParty */
  AccountingSupplierParty: Array<UBLJsonAccountingSupplierParty>;
  /** Buyer information. Maps to UBL: /ubl:Invoice / cac:AccountingCustomerParty */
  AccountingCustomerParty: Array<UBLJsonAccountingCustomerParty>;
  /** Optional. Payee party information. Maps to UBL: /ubl:Invoice / cac:PayeeParty */
  PayeeParty?: Array<UBLJsonParty>;
  /** Optional. Tax representative party information. Maps to UBL: /ubl:Invoice / cac:TaxRepresentativeParty */
  TaxRepresentativeParty?: Array<UBLJsonParty>;
  /** Optional. Delivery information, including shipping recipient details and other charges. Maps to UBL: /ubl:Invoice / cac:Delivery */
  Delivery?: Array<UBLJsonDelivery>;
  /** Optional. Payment means information, including payment mode and supplier's bank account. Maps to UBL: /ubl:Invoice / cac:PaymentMeans */
  PaymentMeans?: Array<UBLJsonPaymentMeans>;
  /** Optional. Payment terms and conditions. Maps to UBL: /ubl:Invoice / cac:PaymentTerms */
  PaymentTerms?: Array<UBLJsonPaymentTerms>;
  /** Optional. Prepaid payment information, including amount, date, time, and reference number. Maps to UBL: /ubl:Invoice / cac:PrepaidPayment */
  PrepaidPayment?: Array<UBLJsonPrepaidPayment>;
  /** Optional. Document level allowances or charges. Maps to UBL: /ubl:Invoice / cac:AllowanceCharge */
  AllowanceCharge?: Array<UBLJsonFreightAllowanceCharge>;
  /** Optional. Currency exchange rate information. Maps to UBL: /ubl:Invoice / cac:TaxExchangeRate */
  TaxExchangeRate?: Array<UBLJsonTaxExchangeRate>;
  /** Tax total information for the credit note, including tax amounts, taxable amounts, tax exemptions, and tax types. Maps to UBL: /ubl:Invoice / cac:TaxTotal */
  TaxTotal: Array<UBLJsonTaxTotal>;
  /** Legal monetary total summary for the credit note, including various total amounts and rounding amount. Maps to UBL: /ubl:Invoice / cac:LegalMonetaryTotal */
  LegalMonetaryTotal: Array<UBLJsonLegalMonetaryTotal>;
  /** Credit note line items, detailing the credit. Maps to UBL: /ubl:Invoice / cac:InvoiceLine */
  InvoiceLine: Array<UBLJsonInvoiceLine>;

  /**
   * Digital signature information. Maps to UBL: /ubl:Invoice / cac:Signature.
   */
  Signature: Array<UBLJsonSignature>;

  /** UBL Extensions, typically for digital signatures or other extended information. */
  UBLExtensions: UBLJsonExtensions;
}

export type UBLJsonCreditNoteV1_0_Content = Omit<
  UBLJsonCreditNoteV1_1_Content,
  "Signature" | "UBLExtensions"
>;

/**
 * Represents the root structure for a UBL Credit Note Document, version 1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonCreditNoteDocumentV1_1 {
  _D: string;
  _A: string; // "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  _B: string; // "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  Invoice: Array<UBLJsonCreditNoteV1_1_Content>;
}

/**
 * Represents the root structure for a UBL Credit Note Document, version 1.0.
 * Excludes UBLExtensions and Signature from the Credit Note content compared to V1.1.
 * Includes MyInvois specific namespace-like prefixes (_D, _A, _B).
 */
export interface UBLJsonCreditNoteDocumentV1_0 {
  /** Default namespace for UBL Invoice. Value: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" */
  _D: string;
  /** Common Aggregate Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" */
  _A: string;
  /** Common Basic Components namespace. Value: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" */
  _B: string;
  /** Array containing the main credit note content for version 1.0. */
  Invoice: Array<UBLJsonCreditNoteV1_0_Content>;
}
