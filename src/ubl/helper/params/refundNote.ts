// --- User-Friendly Parameter Interfaces - Refund Note Specific ---

import {
  AdditionalDocRefParam,
  AllowanceChargeParam,
  BillingReferenceParam,
  CustomerPartyParam,
  DeliveryParam, // May be used for return of goods
  ItemCommodityClassificationParam,
  LegalMonetaryTotalParam,
  PaymentMeansParam, // Important for specifying refund method
  PaymentTermsParam,
  PrepaidPaymentParam, // Could represent the original payment being refunded
  SupplierPartyParam,
  TaxSubtotalParam,
} from "../params/common";
import { SignatureParams } from "./signature";

/**
 * User-friendly parameters for defining a refund note line item.
 * Adapted from InvoiceLineParam/CreditNoteLineParam.
 */
export interface RefundNoteLineParam {
  /** Unique identifier for the refund note line (e.g., item number "1", "2", etc.). */
  id: string;
  /** Number of units of the product or service being refunded. E.g., 1.00. */
  quantity: number;
  /**
   * Standard unit or system used to measure the product or service (UN/ECE Recommendation 20).
   * E.g., "KGM" for kilograms, "UNT" for unit. Optional.
   */
  unitCode?: string;
  /**
   * Subtotal for the line item being refunded: Amount of each individual item/service, excluding taxes, charges, or discounts.
   * This maps to `ItemPriceExtension/Amount` in UBL, which is used for line item subtotal in MyInvois.
   * E.g., 100.00.
   */
  subtotal: number;
  /** Description of the product or service being refunded. E.g., "Returned goods". Mandatory. */
  itemDescription?: string;
  /** Commodity classification details for the item being refunded. */
  itemCommodityClassification: ItemCommodityClassificationParam;
  /** Price assigned to a single unit of the product or service being refunded. E.g., 17.00. */
  unitPrice: number;
  /**
   * Tax details for this specific line item. Optional.
   * If provided, `taxAmount` and at least one `taxSubtotal` are expected.
   */
  lineTaxTotal?: {
    /** Total tax amount for this line item. E.g., 8.76. */
    taxAmount: number;
    /** Breakdown of taxes for this line item by category/rate. */
    taxSubtotals: TaxSubtotalParam[];
  };
  /** Optional list of allowances or charges specific to this line item. */
  allowanceCharges?: AllowanceChargeParam[];
}

/**
 * User-friendly parameters for defining the overall tax total for the refund note.
 * Adapted from InvoiceTaxTotalParam.
 */
export interface RefundNoteTaxTotalParam {
  /** Total tax amount for the entire refund note. E.g., 87.63. */
  totalTaxAmount: number;
  /** Breakdown of taxes by category/rate for the entire refund note. */
  taxSubtotals: TaxSubtotalParam[];
  /** Optional. Rounding amount applied to the total tax. E.g., 0.03 (for positive rounding). */
  roundingAmount?: number;
}

/**
 * User-friendly parameters for defining a billing period associated with the refund note (e.g., for a refunded service period).
 */
export interface RefundNotePeriodParam {
  /** Start date of the period (YYYY-MM-DD). Optional. E.g., "2017-11-26". */
  startDate?: string;
  /** End date of the period (YYYY-MM-DD). Optional. E.g., "2017-11-30". */
  endDate?: string;
  /** Description of the frequency (e.g., "Full refund for March subscription"). Optional. */
  description?: string;
}

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
  refundNoteLines: RefundNoteLineParam[];
  /** Overall tax total for the refund note. Mandatory. */
  taxTotal: RefundNoteTaxTotalParam;
  /** Legal monetary total summary for the refund note. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /**
   * Billing reference information, crucial for linking the refund note to the original transaction(s)
   * (e.g., original invoice, payment document, or credit note being refunded).
   * An array as a refund note can reference multiple original documents. Mandatory.
   */
  billingReferences: BillingReferenceParam[];

  /** Optional. Billing period information related to the refund. */
  refundNotePeriod?: RefundNotePeriodParam[];
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
