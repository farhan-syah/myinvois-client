// --- User-Friendly Parameter Interfaces - Self-Billed Debit Note Specific ---

import {
  AdditionalDocRefParam,
  AllowanceChargeParam,
  BillingReferenceParam,
  CustomerPartyParam,
  DeliveryParam,
  InvoiceLineItem,
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
 * User-friendly parameters for defining a debit note line item.
 * This structure is consistent for standard and self-billed debit notes.
 */
export interface SelfBilledDebitNoteLineParam {
  /** Unique identifier for the debit note line (e.g., item number "1", "2", etc.). */
  id: string;
  /** Number of units of the product or service being debited. E.g., 1.00. */
  quantity: number;
  /**
   * Standard unit or system used to measure the product or service (UN/ECE Recommendation 20).
   * E.g., "KGM" for kilograms, "UNT" for unit. Optional.
   */
  unitCode?: string;
  /**
   * Subtotal for the line item being debited: Amount of each individual item/service, excluding taxes, charges, or discounts.
   * This maps to `ItemPriceExtension/Amount` in UBL, which is used for line item subtotal in MyInvois.
   * E.g., 50.00.
   */
  subtotal: number;
  /** Description of the product or service being debited. E.g., "Late Payment Fee". Mandatory. */
  itemDescription: string;
  /** Commodity classification details for the item being debited. */
  itemCommodityClassification: ItemCommodityClassificationParam;
  /** Price assigned to a single unit of the product or service being debited. E.g., 50.00. */
  unitPrice: number;
  /**
   * Tax details for this specific line item. Optional.
   * If provided, `taxAmount` and at least one `taxSubtotal` are expected.
   */
  lineTaxTotal?: {
    /** Total tax amount for this line item. E.g., 3.00. */
    taxAmount: number;
    /** Breakdown of taxes for this line item by category/rate. */
    taxSubtotals: TaxSubtotalParam[];
  };
  /** Optional list of allowances or charges specific to this line item. */
  allowanceCharges?: AllowanceChargeParam[];
}

/**
 * Comprehensive user-friendly parameters for creating a full UBL Self-Billed Debit Note document.
 * This interface abstracts complexities of UBL JSON construction for self-billing debit note scenarios.
 */
export interface CreateSelfBilledDebitNoteDocumentParams {
  /**
   * Self-Billed Debit Note Code / Number: Document reference number used by the party issuing
   * the self-billed debit note (typically the customer) for internal tracking.
   * E.g., "SBDN-001". Mandatory.
   */
  id: string;
  /**
   * Debit Note Date: Date of issuance of the Debit Note (YYYY-MM-DD).
   * Note: MyInvois expects this to be the current date in UTC timezone.
   * E.g., "2024-08-15". Mandatory.
   */
  issueDate: string;
  /**
   * Debit Note Time: Time of issuance of the Debit Note (HH:MM:SSZ or HH:MM:SS+HH:MM).
   * Note: MyInvois expects this to be the current time.
   * E.g., "11:30:00Z". Mandatory.
   */
  issueTime: string;

  /**
   * Optional. Debit Note Type Code (UN/EDIFACT 1001).
   * Common codes include "383" (Debit note).
   * E.g., "383".
   */
  debitNoteTypeCode?: string;

  /**
   * Optional. Notes providing additional textual information.
   * Can be used to explicitly state "SELF-BILLED DEBIT NOTE".
   * E.g., ["SELF-BILLED DEBIT NOTE", "Adjustment for undercharged amount on SBINV-123"].
   */
  notes?: string[];

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

  /**
   * Supplier (Seller) details. In a self-billed debit note scenario, this is the party
   * who originally supplied the goods/services and would typically issue a debit note (but is now receiving it from the customer). Mandatory.
   */
  supplier: SupplierPartyParam;
  /**
   * Customer (Buyer) details. In a self-billed debit note scenario, this is the party
   * issuing the debit note to themselves (i.e., the recipient of goods/services who is now acknowledging an additional amount due). Mandatory.
   */
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
   * Billing reference information, crucial for linking the self-billed debit note to the original self-billed invoice(s).
   * A self-billed debit note can ONLY refer to self-billed invoices.
   * An array as a debit note can reference multiple invoices. Mandatory.
   */
  billingReferences: BillingReferenceParam[];

  /** Optional. Billing period information for the debit. */
  debitNotePeriod?: PeriodParam[];
  /**
   * Optional. List of additional document references.
   * Could be used to reference a self-billing agreement or the original transaction leading to the debit.
   */
  additionalDocumentReferences?: AdditionalDocRefParam[];
  /** Optional. Delivery information related to the items being debited, if applicable. Can be an array if multiple deliveries are involved. */
  delivery?: DeliveryParam[];
  /** Optional. Payment means information relevant to the debit. */
  paymentMeans?: PaymentMeansParam[];
  /** Optional. Payment terms description for the debit. */
  paymentTerms?: PaymentTermsParam[];
  /**
   * Optional. List of prepaid payments associated with the original invoice that are being adjusted.
   * This might be less common for debit notes but included for structural consistency.
   */
  prepaidPayments?: PrepaidPaymentParam[];
  /** Optional. Document-level allowances or charges applied to the debit note. */
  allowanceCharges?: AllowanceChargeParam[];
  /**
   * Optional. Parameters for creating a UBL digital signature extension.
   * If provided, the builder will attempt to create and embed a signature extension
   * into the `UBLExtensions` of the debit note.
   */
  signature?: SignatureParams;
}
