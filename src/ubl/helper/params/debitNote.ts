// --- User-Friendly Parameter Interfaces - Debit Note Specific ---

import {
  AdditionalDocRefParam,
  AllowanceChargeParam,
  BillingReferenceParam,
  CustomerPartyParam,
  DeliveryParam,
  InvoiceLineItem,
  LegalMonetaryTotalParam,
  PaymentMeansParam,
  PaymentTermsParam,
  PeriodParam,
  PrepaidPaymentParam,
  SupplierPartyParam,
  TaxTotalParam,
} from "./common";
import { SignatureParams } from "./signature";

/**
 * Comprehensive user-friendly parameters for creating a full UBL Debit Note document (supports v1.0 and v1.1).
 * This interface is designed to abstract many of the complexities of direct UBL JSON construction.
 */
export interface CreateDebitNoteDocumentParams {
  /**
   * Debit Note Code / Number: Document reference number used by Supplier for internal tracking.
   * E.g., "DN12345". Mandatory.
   */
  id: string;
  /**
   * Debit Note Date: Date of issuance of the Debit Note (YYYY-MM-DD).
   * Note: MyInvois expects this to be the current date in UTC timezone.
   * E.g., "2024-07-30". Mandatory.
   */
  issueDate: string;
  /**
   * Debit Note Time: Time of issuance of the Debit Note (HH:MM:SSZ or HH:MM:SS+HH:MM).
   * Note: MyInvois expects this to be the current time.
   * E.g., "10:00:00Z". Mandatory.
   */
  issueTime: string;
  /**
   * Debit Note Currency Code: Specific currency for monetary values in the Debit Note.
   * E.g., "MYR". Mandatory.
   */
  documentCurrencyCode: string;
  /**
   * Tax Currency Code. Optional. If not provided, defaults to `documentCurrencyCode`.
   * E.g., "MYR".
   */
  taxCurrencyCode?: string;

  /** Supplier (seller) details. Mandatory. */
  supplier: SupplierPartyParam;
  /** Customer (buyer) details. Mandatory. */
  customer: CustomerPartyParam;

  /**
   * Array of debit note line items. At least one line item is typically mandatory
   * unless it's a document-level debit/charge.
   */
  invoiceLines: InvoiceLineItem[];
  /** Overall tax total for the debit note. Mandatory. */
  taxTotal: TaxTotalParam;
  /** Legal monetary total summary for the debit note. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /**
   * Billing reference information, crucial for linking the debit note to the original invoice(s).
   * An array as a debit note can reference multiple invoices. Mandatory.
   */
  billingReferences: BillingReferenceParam[];

  /** Optional. Billing period information. */
  debitNotePeriod?: PeriodParam[];
  /** Optional. List of additional document references. */
  additionalDocumentReferences?: AdditionalDocRefParam[];
  /** Optional. Delivery information. Can be an array if multiple deliveries are involved, though typically one. */
  delivery?: DeliveryParam[];
  /** Optional. Payment means information. */
  paymentMeans?: PaymentMeansParam[];
  /** Optional. Payment terms description for the debit. */
  paymentTerms?: PaymentTermsParam[];
  /** Optional. List of prepaid payments associated with the original invoice that are being reversed/debited. */
  prepaidPayments?: PrepaidPaymentParam[];
  /** Optional. Document-level allowances or charges applied to the debit note. */
  allowanceCharges?: AllowanceChargeParam[];
  /**
   * Optional. Parameters for creating a UBL digital signature extension.
   * This is typically used for v1.1 invoices that require a digital signature.
   * If provided, the builder will attempt to create and embed a signature extension
   * into the `UBLExtensions` of the invoice.
   */
  signature?: SignatureParams;
}
