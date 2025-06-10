import {
  MalaysianStateCode,
  CountryCodeISO3166Alpha3,
  ClassificationCode,
  TaxTypeCode,
  PaymentMode,
} from "../../../codes";

/**
 * User-friendly parameters for defining a postal address.
 * This is used by helper functions to construct the UBL `PostalAddress` structure.
 */
export interface AddressParam {
  /** Street lines of the address. E.g., ["Lot 66", "Bangunan Merdeka", "Persiaran Jaya"]. At least one line is typically expected. */
  addressLines: string[];
  /** Postal zone or postcode. E.g., "50480". */
  postalZone?: string;
  /** City name. E.g., "Kuala Lumpur". */
  cityName: string;
  /** State or administrative subdivision code. For Malaysia, use `MalaysianStateCode`. E.g., "14" for W.P. Kuala Lumpur. */
  countrySubentityCode: MalaysianStateCode;
  /** ISO 3166-1 alpha-3 country code. E.g., "MYS" for Malaysia. */
  countryCode: CountryCodeISO3166Alpha3;
}

export type IdentificationScheme = "NRIC" | "BRN" | "PASSPORT" | "ARMY";
/**
 * User-friendly parameters for defining a supplier (seller) party.
 */
export interface SupplierPartyParam {
  /** Supplier's Tax Identification Number (TIN). E.g., "C2584563222". */
  TIN: string;
  /** Supplier's registration/identification number (e.g., MyKad, Business Registration Number). E.g., "202001234567". */
  identificationNumber: string;
  /** Scheme for the `identificationNumber` (NRIC, BRN, PASSPORT, ARMY). */
  identificationScheme: IdentificationScheme;
  /** Supplier's contact telephone number. E.g., "+60123456789". */
  telephone: string;
  /** Supplier's legal name. E.g., "AMS Setia Jaya Sdn. Bhd.". */
  legalName: string;
  /** Supplier's address details. */
  address: AddressParam;
  /** Supplier's Malaysia Standard Industrial Classification (MSIC) Code (5-digit numeric). E.g., "01111". */
  industryClassificationCode: string;
  /** Description of the supplier's business activity, corresponding to the MSIC code. E.g., "Growing of maize". */
  industryClassificationName: string;
  /** Supplier's Tourism Tax Registration Number. Optional. Input "NA" if not applicable and required by schema. E.g., "123-4567-89012345". */
  tourismTaxRegistrationNumber?: string;
  /** Supplier's SST Registration Number. Optional. Input "NA" if not applicable and required by schema. E.g., "A01-2345-67891012". */
  sstRegistrationNumber?: string;
  /**
   * Supplier's additional account ID. Can be used for specific purposes like
   * Authorisation Number for Certified Exporter (e.g., ATIGA number).
   * E.g., "CPT-CCN-W-211111-KL-000002".
   */
  additionalAccountId?: string;
  /** Supplier's e-mail address. Optional. E.g., "general.ams@supplier.com". */
  electronicMail?: string;
}

/**
 * User-friendly parameters for defining a customer (buyer) party.
 */
export interface CustomerPartyParam {
  /** Customer's Tax Identification Number (TIN). E.g., "C2584563200". */
  TIN: string;
  /** Customer's registration/identification number (e.g., MyKad, Business Registration Number). E.g., "202001234567". */
  identificationNumber: string;
  /** Scheme for the `identificationNumber` (NRIC, BRN, PASSPORT, ARMY). */
  identificationScheme: IdentificationScheme;
  /** Customer's contact telephone number. E.g., "+60123456789". Can be "NA" for consolidated e-Invoices. */
  telephone: string;
  /** Customer's legal name. E.g., "Hebat Group". */
  legalName: string;
  /** Customer's address details. */
  address: AddressParam;
  /** Customer's Tourism Tax Registration Number. Optional. */
  tourismTaxRegistrationNumber?: string;
  /** Customer's SST Registration Number. Optional. Input "NA" if not available/provided and schema requires it. */
  sstRegistrationNumber?: string;
  /** Customer's additional account ID. Optional, less common than for supplier. */
  additionalAccountId?: string;
  /** Customer's e-mail address. Optional. E.g., "name@buyer.com". */
  electronicMail?: string;
}

/**
 * User-friendly parameters for defining an item's commodity classification.
 */
export interface ItemCommodityClassificationParam {
  /** Classification code for the product or service. E.g., "001". */
  code: ClassificationCode | string;
  /**
   * Identifier for the classification list used.
   * E.g., "CLASS" for general classification, "PTC" for Product Tariff Code.
   * Defaults to "CLASS" in the builder if not provided.
   */
  listID?: "CLASS" | "PTC" | string;
}

/**
 * User-friendly parameters for defining a tax subtotal.
 */
export interface TaxSubtotalParam {
  /** Amount taxable under this specific tax category. E.g., 1460.50. */
  taxableAmount: number;
  /** Tax amount for this specific category. E.g., 87.63. If exempt, this is 0. */
  taxAmount: number;
  /** Tax type code (e.g., Sales Tax, Service Tax, Exempt). */
  taxCategoryCode: TaxTypeCode;
  /** Description of tax exemption applicable on the invoice level.
   * (e.g., Buyer’s sales tax exemption certificate number, special exemption as per gazette orders, etc.).
   * The input is limited to the following special characters:
   * period “.”, dash “-“, comma “,” and parenthesis “() */
  taxExemptReason?: string;
  /** Tax rate percentage, if applicable (e.g., 10 for 10%). Optional. */
  percent?: number;
}

/**
 * User-friendly parameters for defining payment means.
 */
export interface PaymentMeansParam {
  /** Code for the mode of payment (e.g., cash, cheque). E.g., "01". */
  paymentMeansCode: PaymentMode;
  /** Supplier’s bank account number for payment. Optional. E.g., "1234567890123". */
  payeeFinancialAccountId?: string;
}

/**
 * User-friendly parameters for defining payment terms.
 */
export interface PaymentTermsParam {
  /** A note describing the payment terms. E.g., "Payment method is Cash". */
  note: string;
}

/**
 * User-friendly parameters for defining a prepaid payment.
 */
export interface PrepaidPaymentParam {
  /** Prepayment reference number. Optional. E.g., "E12345678912". */
  id?: string;
  /** The amount that was prepaid. E.g., 1.00. */
  paidAmount: number;
  /** Date of prepayment (YYYY-MM-DD). Optional. E.g., "2000-01-01". */
  paidDate?: string;
  /** Time of prepayment (HH:MM:SSZ). Optional. E.g., "12:00:00Z". */
  paidTime?: string;
}

/**
 * Parameters for defining an allowance or a charge (can be at document or line item level).
 */
export interface AllowanceChargeParam {
  /** True if this is a charge, false if it is an allowance (discount). */
  isCharge: boolean;
  /** Reason for the allowance or charge. Optional. E.g., "Volume Discount" or "Service Fee". */
  reason?: string;
  /** Amount of the allowance or charge. E.g., 100.00. */
  amount: number;
}

/**
 * User-friendly parameters for defining delivery information.
 */
export interface DeliveryParam {
  /** Name of the party involved in the delivery. Optional. E.g., "Greenz Sdn. Bhd.". */
  partyName?: string;
  /** Address related to the delivery. Optional. */
  address?: AddressParam;
  /**
   * Shipment identifier related to the original invoice or return.
   */
  shipmentId?: string;
}

/**
 * User-friendly parameters for defining an additional document reference.
 */
export interface AdditionalDocRefParam {
  /**
   * Identifier of the referenced document.
   */
  id: string;
  /**
   * Type of the document. Optional.
   */
  documentType?: string;
  /**
   * Description of the document. Optional.
   */
  documentDescription?: string;
}

/**
 * User-friendly parameters for defining the legal monetary totals for a document (Invoice or Credit Note).
 */
export interface LegalMonetaryTotalParam {
  /**
   * Total Net Amount: Sum of all line item subtotals (LineExtensionAmount in UBL).
   * E.g., 1436.50.
   */
  lineExtensionAmount: number;
  /**
   * Total Excluding Tax: Sum of amount (inclusive of discounts/charges), excluding taxes.
   * E.g., 1436.50.
   */
  taxExclusiveAmount: number;
  /**
   * Total Including Tax: Sum of amount inclusive of total taxes (i.e., taxExclusiveAmount + totalTaxAmount from TaxTotalParam).
   * E.g., 1524.13 (where taxExclusiveAmount is 1436.50 and total tax is 87.63).
   */
  taxInclusiveAmount: number;
  /** Total document-level discount amount. Optional. E.g., 100.00. */
  allowanceTotalAmount?: number;
  /** Total document-level fee/charge amount. Optional. E.g., 50.00. */
  chargeTotalAmount?: number;
  /** Total prepaid amount. Optional. E.g., 200.00. */
  prepaidAmount?: number;
  /** Rounding amount applied to the final payable amount. Optional. E.g., 0.03. */
  payableRoundingAmount?: number;
  /**
   * Total Payable Amount: Final amount due after all taxes, charges, discounts, and rounding.
   * E.g., 1324.13 (if taxInclusiveAmount is 1524.13 and prepaidAmount is 200.00).
   */
  payableAmount: number;
}

/**
 * User-friendly parameters for defining a billing reference, linking the document to the original document.
 */
export interface BillingReferenceParam {
  /** The ID of the original document being referenced. */
  uuid: string;
  /** User's internal identifier for the original referenced document. */
  internalId: string;
}

/**
 * User-friendly parameters for defining a billing period.
 */
export interface PeriodParam {
  /** Start date of the billing period (YYYY-MM-DD). Optional. E.g., "2017-11-26". */
  startDate?: string;
  /** End date of the billing period (YYYY-MM-DD). Optional. E.g., "2017-11-30". */
  endDate?: string;
  /** Description of the billing frequency (e.g., "Monthly"). Optional. */
  description?: string;
}

/**
 * User-friendly parameters for defining the overall tax total for the document.
 */
export interface TaxTotalParam {
  /** Total tax amount for the entire invoice. E.g., 87.63. */
  totalTaxAmount: number;
  /** Breakdown of taxes by category/rate for the entire invoice. */
  taxSubtotals: TaxSubtotalParam[];
  /** Optional. Rounding amount applied to the total tax. E.g., 0.03 (for positive rounding). */
  roundingAmount?: number;
}
