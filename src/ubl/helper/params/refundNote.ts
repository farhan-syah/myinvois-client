// --- User-Friendly Parameter Interfaces - Refund Note Specific ---

import {
  AdditionalDocRefParam,
  AllowanceChargeParam,
  BillingReferenceParam,
  CustomerPartyParam,
  DeliveryParam,
  InvoiceLineItem,
  LegalMonetaryTotalParam,
  PaymentMeansParam, // Important for specifying refund method
  PaymentTermsParam,
  PeriodParam,
  PrepaidPaymentParam, // Could represent the original payment being refunded
  SupplierPartyParam,
  TaxTotalParam,
} from "../params/common";
import { SignatureParams } from "./signature";

/**
 * Comprehensive user-friendly parameters for creating a full UBL Refund Note document (supports v1.0 and v1.1).
 * This interface is designed to abstract many of the complexities of direct UBL JSON construction.
 */
export interface CreateRefundNoteDocumentParams {
  /**
   * Refund Note Code / Number: Document reference number used by Supplier for internal tracking.
   * E.g., "RN12345". Mandatory.
   */
  id: string;
  /**
   * Refund Note Date: Date of issuance of the Refund Note (YYYY-MM-DD).
   * Note: MyInvois expects this to be the current date in UTC timezone.
   * E.g., "2024-07-30". Mandatory.
   */
  issueDate: string;
  /**
   * Refund Note Time: Time of issuance of the Refund Note (HH:MM:SSZ or HH:MM:SS+HH:MM).
   * Note: MyInvois expects this to be the current time.
   * E.g., "10:00:00Z". Mandatory.
   */
  issueTime: string;
  /**
   * Refund Note Currency Code: Specific currency for monetary values in the Refund Note.
   * E.g., "MYR". Mandatory.
   */
  documentCurrencyCode: string;
  /**
   * Tax Currency Code. Optional. If not provided, defaults to `documentCurrencyCode`.
   * E.g., "MYR".
   */
  taxCurrencyCode?: string;

  /** Supplier (party issuing the refund) details. Mandatory. */
  supplier: SupplierPartyParam;
  /** Customer (party receiving the refund) details. Mandatory. */
  customer: CustomerPartyParam;

  /**
   * Array of refund note line items. At least one line item is typically mandatory
   * unless it's a document-level refund.
   */
  invoiceLines: InvoiceLineItem[];
  /** Overall tax total for the refund note. Mandatory. */
  taxTotal: TaxTotalParam;
  /** Legal monetary total summary for the refund note. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /**
   * Billing reference information, crucial for linking the refund note to the original transaction(s)
   * (e.g., original invoice, payment document, or credit note being refunded).
   * An array as a refund note can reference multiple original documents. Mandatory.
   */
  billingReferences: BillingReferenceParam[];

  /** Optional. Billing period information related to the refund. */
  refundNotePeriod?: PeriodParam[];
  /** Optional. List of additional document references. */
  additionalDocumentReferences?: AdditionalDocRefParam[];
  /** Optional. Delivery information, e.g., for returned goods. Can be an array if multiple deliveries are involved. */
  delivery?: DeliveryParam[];
  /** Optional. Payment means information, specifying how the refund is issued. */
  paymentMeans?: PaymentMeansParam[];
  /** Optional. Payment terms description for the refund. */
  paymentTerms?: PaymentTermsParam[];
  /** Optional. List of prepaid payments associated with the original transaction that are being refunded. */
  prepaidPayments?: PrepaidPaymentParam[];
  /** Optional. Document-level allowances or charges applied to the refund note. */
  allowanceCharges?: AllowanceChargeParam[];
  /**
   * Optional. Parameters for creating a UBL digital signature extension.
   * This is typically used for v1.1 documents that require a digital signature.
   * If provided, the builder will attempt to create and embed a signature extension
   * into the `UBLExtensions` of the document.
   */
  signature?: SignatureParams;
}
