// --- User-Friendly Parameter Interfaces - Self-Billed Credit Note Specific ---

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
 * User-friendly parameters for defining a credit note line item.
 * This structure is consistent for standard and self-billed credit notes.
 * Adapted from InvoiceLineParam.
 */
export interface SelfBilledCreditNoteLineParam {
  /** Unique identifier for the credit note line (e.g., item number "1", "2", etc.). */
  id: string;
  /** Number of units of the product or service being credited. E.g., 1.00. */
  quantity: number;
  /**
   * Standard unit or system used to measure the product or service (UN/ECE Recommendation 20).
   * E.g., "KGM" for kilograms, "UNT" for unit. Optional.
   */
  unitCode?: string;
  /**
   * Subtotal for the line item being credited: Amount of each individual item/service, excluding taxes, charges, or discounts.
   * This maps to `ItemPriceExtension/Amount` in UBL, which is used for line item subtotal in MyInvois.
   * E.g., 100.00.
   */
  subtotal: number;
  /** Description of the product or service being credited. E.g., "Laptop Peripherals". Mandatory. */
  itemDescription: string;
  /** Commodity classification details for the item being credited. */
  itemCommodityClassification: ItemCommodityClassificationParam;
  /** Price assigned to a single unit of the product or service being credited. E.g., 17.00. */
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
 * Comprehensive user-friendly parameters for creating a full UBL Self-Billed Credit Note document.
 * This interface abstracts complexities of UBL JSON construction for self-billing credit note scenarios.
 */
export interface CreateSelfBilledCreditNoteDocumentParams {
  /**
   * Self-Billed Credit Note Code / Number: Document reference number used by the party issuing
   * the self-billed credit note (typically the customer) for internal tracking.
   * E.g., "SBCN-001". Mandatory.
   */
  id: string;
  /**
   * Credit Note Date: Date of issuance of the Credit Note (YYYY-MM-DD).
   * Note: MyInvois expects this to be the current date in UTC timezone.
   * E.g., "2024-07-30". Mandatory.
   */
  issueDate: string;
  /**
   * Credit Note Time: Time of issuance of the Credit Note (HH:MM:SSZ or HH:MM:SS+HH:MM).
   * Note: MyInvois expects this to be the current time.
   * E.g., "10:00:00Z". Mandatory.
   */
  issueTime: string;

  /**
   * Optional. Credit Note Type Code (UN/EDIFACT 1001).
   * Common codes include "381" (Credit note).
   * E.g., "381".
   */
  creditNoteTypeCode?: string;

  /**
   * Optional. Notes providing additional textual information.
   * Can be used to explicitly state "SELF-BILLED CREDIT NOTE".
   * E.g., ["SELF-BILLED CREDIT NOTE", "As per agreement XYZ for returned goods"].
   */
  notes?: string[];

  /**
   * Credit Note Currency Code: Specific currency for monetary values in the Credit Note.
   * E.g., "MYR". Mandatory.
   */
  documentCurrencyCode: string;
  /**
   * Tax Currency Code. Optional. If not provided, defaults to `documentCurrencyCode`.
   * E.g., "MYR".
   */
  taxCurrencyCode?: string;

  /**
   * Supplier (Seller) details. In a self-billing credit note scenario, this is the party
   * who originally supplied the goods/services and would typically receive a credit note. Mandatory.
   */
  supplier: SupplierPartyParam;
  /**
   * Customer (Buyer) details. In a self-billing credit note scenario, this is the party
   * issuing the credit note to themselves (i.e., the recipient of goods/services who is now claiming a credit). Mandatory.
   */
  customer: CustomerPartyParam;

  /**
   * Array of credit note line items. At least one line item is typically mandatory
   * unless it's a document-level credit/charge.
   */
  creditNoteLines: SelfBilledCreditNoteLineParam[];
  /** Overall tax total for the credit note. Mandatory. */
  taxTotal: TaxTotalParam;
  /** Legal monetary total summary for the credit note. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /**
   * Billing reference information, crucial for linking the self-billed credit note to the original self-billed invoice(s).
   * A self-billed credit note can only refer to self-billed invoices.
   * An array as a credit note can reference multiple invoices. Mandatory.
   */
  billingReferences: BillingReferenceParam[];

  /** Optional. Billing period information for the credit. */
  creditNotePeriod?: PeriodParam[];
  /**
   * Optional. List of additional document references.
   * Could be used to reference a self-billing agreement.
   */
  additionalDocumentReferences?: AdditionalDocRefParam[];
  /** Optional. Delivery information. Can be an array if multiple deliveries are involved, though typically one. */
  delivery?: DeliveryParam[];
  /** Optional. Payment means information relevant to the credit. */
  paymentMeans?: PaymentMeansParam[];
  /** Optional. Payment terms description for the credit. */
  paymentTerms?: PaymentTermsParam[];
  /** Optional. List of prepaid payments associated with the original invoice that are being reversed/credited. */
  prepaidPayments?: PrepaidPaymentParam[];
  /** Optional. Document-level allowances or charges applied to the credit note. */
  allowanceCharges?: AllowanceChargeParam[];
  /**
   * Optional. Parameters for creating a UBL digital signature extension.
   * If provided, the builder will attempt to create and embed a signature extension
   * into the `UBLExtensions` of the credit note.
   */
  signature?: SignatureParams;
}
