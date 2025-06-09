// --- User-Friendly Parameter Interfaces - Invoice Specific ---

import {
  AdditionalDocRefParam,
  AllowanceChargeParam,
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
} from "../params/common";
import { SignatureParams } from "./signature";

/**
 * User-friendly parameters for defining an invoice line item.
 */
export interface InvoiceLineParam {
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
 * User-friendly parameters for defining the overall tax total for the invoice.
 */
export interface InvoiceTaxTotalParam {
  /** Total tax amount for the entire invoice. E.g., 87.63. */
  totalTaxAmount: number;
  /** Breakdown of taxes by category/rate for the entire invoice. */
  taxSubtotals: TaxSubtotalParam[];
  /** Optional. Rounding amount applied to the total tax. E.g., 0.03 (for positive rounding). */
  roundingAmount?: number;
}

/**
 * Comprehensive user-friendly parameters for creating a full UBL Invoice document (supports v1.0 and v1.1).
 * The `createUblJsonInvoiceDocument` builder function uses these parameters to simplify invoice generation.
 * This interface is designed to abstract many of the complexities of direct UBL JSON construction.
 */
export interface CreateInvoiceDocumentParams {
  /**
   * e-Invoice Code / Number: Document reference number used by Supplier for internal tracking.
   * E.g., "INV12345". Mandatory.
   */
  id: string;
  /**
   * e-Invoice Date: Date of issuance of the e-Invoice (YYYY-MM-DD).
   * Note: MyInvois expects this to be the current date in UTC timezone.
   * E.g., "2017-11-26". Mandatory.
   */
  issueDate: string;
  /**
   * e-Invoice Time: Time of issuance of the e-Invoice (HH:MM:SSZ or HH:MM:SS+HH:MM).
   * Note: MyInvois expects this to be the current time.
   * E.g., "15:30:00Z". Mandatory.
   */
  issueTime: string;
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

  /** Supplier (seller) details. Mandatory. */
  supplier: SupplierPartyParam;
  /** Customer (buyer) details. Mandatory. */
  customer: CustomerPartyParam;

  /** Array of invoice line items. At least one line item is typically mandatory. */
  invoiceLines: InvoiceLineParam[];
  /** Overall tax total for the invoice. Mandatory. */
  taxTotal: InvoiceTaxTotalParam;
  /** Legal monetary total summary for the invoice. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /** Optional. Billing period information. */
  invoicePeriod?: PeriodParam[];
  /** Optional. List of additional document references (e.g., customs forms, FTA info). */
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
   * This is typically used for v1.1 invoices that require a digital signature.
   * If provided, the builder will attempt to create and embed a signature extension
   * into the `UBLExtensions` of the invoice.
   */
  signature?: SignatureParams;
}
