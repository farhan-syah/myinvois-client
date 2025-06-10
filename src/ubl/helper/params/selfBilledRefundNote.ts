// --- User-Friendly Parameter Interfaces - Self-Billed Refund Note Specific ---

import {
  AdditionalDocRefParam,
  AllowanceChargeParam,
  BillingReferenceParam,
  CustomerPartyParam,
  DeliveryParam,
  ItemCommodityClassificationParam,
  LegalMonetaryTotalParam,
  PaymentMeansParam,
  PaymentTermsParam,
  PeriodParam,
  PrepaidPaymentParam,
  SupplierPartyParam,
  TaxSubtotalParam,
  TaxTotalParam,
} from "../params/common";
import { SignatureParams } from "./signature";

/**
 * User-friendly parameters for defining a self-billed refund note line item.
 * Adapted from CreditNoteLineParam.
 */
export interface SelfBilledRefundNoteLineParam {
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
  /** Description of the product or service being refunded. E.g., "Returned Goods". Mandatory. */
  itemDescription: string;
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
 * Comprehensive user-friendly parameters for creating a full UBL Self-Billed Refund Note document.
 * This interface is designed to abstract many of the complexities of direct UBL JSON construction
 * for self-billing refund note scenarios.
 */
export interface CreateSelfBilledRefundNoteDocumentParams {
  /**
   * Self-Billed Refund Note Code / Number: Document reference number used by the party issuing
   * the self-billed refund note (typically the customer) for internal tracking.
   * E.g., "SBRN-001". Mandatory.
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
   * Optional. Refund Note Type Code (UN/EDIFACT 1001).
   * Common codes include "381" (Credit note for goods or services), which is generally used for refund notes.
   * E.g., "381".
   */
  refundNoteTypeCode?: string;

  /**
   * Optional. Notes providing additional textual information.
   * Can be used to explicitly state "SELF-BILLED REFUND NOTE".
   * E.g., ["SELF-BILLED REFUND NOTE", "Refund for overpayment on SBINV-123"].
   */
  notes?: string[];

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

  /**
   * Supplier (Seller) details. In a self-billed refund note scenario, this is the party
   * who originally supplied the goods/services and would typically issue a refund note (but is now receiving it from the customer).
   * Mandatory.
   */
  supplier: SupplierPartyParam;
  /**
   * Customer (Buyer) details. In a self-billed refund note scenario, this is the party
   * issuing the refund note to themselves (i.e., the recipient of goods/services who is now acknowledging a refund due to them).
   * Mandatory.
   */
  customer: CustomerPartyParam;

  /**
   * Array of refund note line items. At least one line item is typically mandatory
   * unless it's a document-level refund/credit.
   */
  refundNoteLines: SelfBilledRefundNoteLineParam[];
  /** Overall tax total for the refund note. Mandatory. */
  taxTotal: TaxTotalParam;
  /** Legal monetary total summary for the refund note. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /**
   * Billing reference information, crucial for linking the self-billed refund note to the original self-billed invoice(s).
   * A self-billed refund note can ONLY refer to self-billed invoices.
   * An array as a refund note can reference multiple invoices. Mandatory.
   */
  billingReferences: BillingReferenceParam[];

  /** Optional. Billing period information for the refund. */
  refundNotePeriod?: PeriodParam[];
  /**
   * Optional. List of additional document references.
   * Could be used to reference a self-billing agreement or the original transaction leading to the refund.
   */
  additionalDocumentReferences?: AdditionalDocRefParam[];
  /** Optional. Delivery information related to the items being refunded, if applicable. Can be an array if multiple deliveries are involved. */
  delivery?: DeliveryParam[];
  /** Optional. Payment means information relevant to the refund. */
  paymentMeans?: PaymentMeansParam[];
  /** Optional. Payment terms description for the refund. */
  paymentTerms?: PaymentTermsParam[];
  /** Optional. List of prepaid payments associated with the original invoice that are being reversed/credited. */
  prepaidPayments?: PrepaidPaymentParam[];
  /** Optional. Document-level allowances or charges applied to the refund note. */
  allowanceCharges?: AllowanceChargeParam[];
  /**
   * Optional. Parameters for creating a UBL digital signature extension.
   * If provided, the builder will attempt to create and embed a signature extension
   * into the `UBLExtensions` of the refund note.
   */
  signature?: SignatureParams;
}
