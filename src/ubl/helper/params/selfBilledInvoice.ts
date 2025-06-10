// --- User-Friendly Parameter Interfaces - Self-Billed Invoice Specific ---

import {
  AdditionalDocRefParam,
  AllowanceChargeParam,
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
 * User-friendly parameters for defining an self billed invoice line item.
 */
export interface SelfBilledInvoiceLineParam {
  /** Unique identifier for the invoice line (e.g., item number "1", "2", etc.). */
  id: string;
  /** Number of units of the product or service. E.g., 1.00. */
  quantity: number;
  /** Price assigned to a single unit of the product or service. E.g., 17.00. */
  unitPrice: number;
  /**
   * Subtotal for the line item: Amount of each individual item/service, excluding taxes, charges, or discounts.
   * This maps to `ItemPriceExtension/Amount` in UBL, which is used for line item subtotal in MyInvois.
   * E.g., 100.00.
   */
  subtotal: number;

  /** Description of the product or service. E.g., "Laptop Peripherals". Mandatory. */
  itemDescription: string;
  /** Commodity classification details for the item. */
  itemCommodityClassification: ItemCommodityClassificationParam;
  /**
   * Tax details for this specific line item. .
   */
  lineTaxTotal: {
    /** Breakdown of taxes for this line item by category/rate. At least one item is required*/
    taxSubtotals: TaxSubtotalParam[];
    /** Total tax amount for this line item. E.g., 8.76. */
    taxAmount: number;
  };
  /**
   * Standard unit or system used to measure the product or service (UN/ECE Recommendation 20).
   * E.g., "KGM" for kilograms, "UNT" for unit. Optional.
   */
  unitCode?: string;
  /** Optional list of allowances or charges specific to this line item. */
  allowanceCharges?: AllowanceChargeParam[];
}

/**
 * Comprehensive user-friendly parameters for creating a full UBL Self-Billed Invoice document.
 * This interface is designed to abstract many of the complexities of direct UBL JSON construction
 * for self-billing scenarios.
 */
export interface CreateSelfBilledInvoiceDocumentParams {
  /**
   * e-Invoice Code / Number: Document reference number used by the party issuing the self-billed invoice
   * (typically the customer) for internal tracking. E.g., "SBINV-001". Mandatory.
   */
  id: string;
  /**
   * e-Invoice Date: Date of issuance of the self-billed e-Invoice (YYYY-MM-DD).
   * Note: MyInvois expects this to be the current date in UTC timezone.
   * E.g., "2023-10-27". Mandatory.
   */
  issueDate: string;
  /**
   * e-Invoice Time: Time of issuance of the self-billed e-Invoice (HH:MM:SSZ or HH:MM:SS+HH:MM).
   * Note: MyInvois expects this to be the current time.
   * E.g., "10:00:00Z". Mandatory.
   */
  issueTime: string;

  /**
   * Optional. Invoice Type Code (UN/EDIFACT 1001).
   * For Self-billed invoices, the code "389" is typically used.
   * E.g., "389".
   */
  invoiceTypeCode?: string;

  /**
   * Optional. Notes providing additional textual information.
   * Can be used to explicitly state "SELF-BILLED INVOICE".
   * E.g., ["SELF-BILLED INVOICE", "As per agreement XYZ"].
   */
  notes?: string[];

  /**
   * Invoice Currency Code: Specific currency for monetary values in the e-Invoice.
   * E.g., "MYR". Mandatory.
   */
  documentCurrencyCode: string;
  /**
   * Tax Currency Code. Optional. If not provided, defaults to `documentCurrencyCode`.
   * E.g., "MYR".
   */
  taxCurrencyCode?: string;

  /**
   * Supplier (Seller) details. In a self-billing scenario, this is the party
   * providing the goods or services, who would normally issue the invoice. Mandatory.
   */
  supplier: SupplierPartyParam;
  /**
   * Customer (Buyer) details. In a self-billing scenario, this is the party
   * issuing the self-billed invoice (i.e., the recipient of goods/services who is billing themselves). Mandatory.
   */
  customer: CustomerPartyParam;

  /** Array of invoice line items. At least one line item is typically mandatory. */
  invoiceLines: InvoiceLineItem[];
  /** Overall tax total for the invoice. Mandatory. */
  taxTotal: TaxTotalParam;
  /** Legal monetary total summary for the invoice. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /** Optional. Billing period information. */
  invoicePeriod?: PeriodParam[];
  /**
   * Optional. List of additional document references.
   * Could be used to reference a self-billing agreement.
   * E.g., customs forms, FTA info, self-billing agreement reference.
   */
  additionalDocumentReferences?: AdditionalDocRefParam[];
  /** Optional. Delivery information. Can be an array if multiple deliveries are involved, though typically one. */
  delivery?: DeliveryParam[];
  /** Optional. Payment means information. */
  paymentMeans?: PaymentMeansParam[];
  /** Optional. Payment terms description. */
  paymentTerms?: PaymentTermsParam[];
  /** Optional. List of prepaid payments. */
  prepaidPayments?: PrepaidPaymentParam[];
  /** Optional. Document-level allowances or charges. */
  allowanceCharges?: AllowanceChargeParam[];

  /**
   * Optional. Parameters for creating a UBL digital signature extension.
   * If provided, the builder will attempt to create and embed a signature extension
   * into the `UBLExtensions` of the invoice.
   */
  signature?: SignatureParams;
}
