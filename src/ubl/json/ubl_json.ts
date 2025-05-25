import {
  CountryCodeISO3166Alpha3,
  TaxTypeCode,
  PaymentMode,
  MalaysianStateCode,
  ClassificationCode,
} from "../../codes";
import { UBLDocumentSignatureExtension } from "./digitalSignature";

// --- Base UBL JSON Helpers ---

/**
 * Helper type for JSON elements that have attributes and/or a text value.
 * Text content is in \`_\`. Attributes are direct properties of the object.
 */
export interface UBLJsonValue<TValue> {
  _?: TValue; // The text content of the element
  // Attributes are other direct properties
  [attributeName: string]: string | number | boolean | TValue | undefined;
}

// --- Reusable JSON Primitive Types (Arrays of UBLJsonValue) ---
/** Represents a UBL text value, typically for single string content. */
export type UBLJsonText = Array<UBLJsonValue<string>>;
/** Represents a UBL identifier. */
export type UBLJsonIdentifier = Array<UBLJsonValue<string>>;
/** Represents a UBL date value in YYYY-MM-DD format. */
export type UBLJsonDate = Array<UBLJsonValue<string>>; // YYYY-MM-DD
/** Represents a UBL time value in HH:MM:SSZ or HH:MM:SS+HH:MM format. */
export type UBLJsonTime = Array<UBLJsonValue<string>>; // HH:MM:SSZ or HH:MM:SS+HH:MM
/** Represents a UBL quantity. */
export type UBLJsonQuantity = Array<UBLJsonValue<number>>;
/** Represents a UBL monetary amount. For amounts with specific currency, see UBLJsonCurrencyAmount. */
export type UBLJsonAmount = Array<UBLJsonValue<number>>;
/** Represents a UBL numeric value. */
export type UBLJsonNumeric = Array<UBLJsonValue<number>>;
/** Represents a UBL code value. */
export type UBLJsonCode = Array<UBLJsonValue<string>>;
/** Represents a UBL boolean indicator (true/false). */
export type UBLJsonIndicator = Array<UBLJsonValue<boolean>>;

// --- Currency Specific Amount ---
/**
 * Extends UBLJsonValue for numeric content specifically to include a currencyID attribute.
 * Used within UBLJsonCurrencyAmount.
 */
export interface UBLJsonCurrencyObject extends UBLJsonValue<number> {
  /** The currency code (e.g., "MYR") for the amount. Mandatory. */
  currencyID: string;
}
/** Represents a UBL monetary amount that requires a currency identifier. */
export type UBLJsonCurrencyAmount = Array<UBLJsonCurrencyObject>;

// --- Address Structure ---
/**
 * Represents a postal address in UBL JSON format.
 * Corresponds to UBL: cac:PostalAddress
 */
export interface UBLJsonPostalAddress {
  /**
   * Address lines. At least one line is mandatory.
   * Maps to UBL: cbc:Line within cac:AddressLine
   */
  AddressLine: Array<{ Line: UBLJsonText }>;
  /**
   * Postal zone or postcode.
   * Maps to UBL: cbc:PostalZone
   */
  PostalZone?: UBLJsonText;
  /**
   * City name.
   * Maps to UBL: cbc:CityName
   */
  CityName: UBLJsonText;
  /**
   * State or sub-entity of the country. For Malaysia, this is MalaysianStateCode.
   * Maps to UBL: cbc:CountrySubentityCode
   */
  CountrySubentityCode: Array<UBLJsonValue<MalaysianStateCode>>;
  /**
   * Country identification.
   * Maps to UBL: cac:Country/cbc:IdentificationCode
   */
  Country: Array<{
    IdentificationCode: Array<
      UBLJsonValue<CountryCodeISO3166Alpha3> & {
        listID: "ISO3166-1";
        listAgencyID: "6";
      }
    >;
  }>;
}

// --- Party Identification Item ---
/**
 * Represents a single identification item for a party (e.g., TIN, NRIC, BRN).
 * Used within cac:PartyIdentification which is an array of these items.
 * Maps to UBL: cac:PartyIdentification/cbc:ID with a schemeID attribute.
 */
export interface UBLJsonPartyIdentificationItem {
  /**
   * The identification number/code.
   * The `schemeID` attribute specifies the type of identification.
   */
  ID: Array<
    UBLJsonValue<string> & {
      /** Type of identification, e.g., 'TIN', 'NRIC', 'BRN', 'PASSPORT', 'ARMY', 'SST', 'TTX'. */
      schemeID?:
        | "TIN"
        | "NRIC"
        | "BRN"
        | "PASSPORT"
        | "ARMY"
        | "SST"
        | "TTX"
        | string;
    }
  >;
}

// --- Contact ---
/**
 * Represents contact information for a party.
 * Maps to UBL: cac:Contact
 */
export interface UBLJsonContact {
  /**
   * Telephone number.
   * Maps to UBL: cbc:Telephone
   */
  Telephone?: UBLJsonText;
  /**
   * Electronic mail address.
   * Maps to UBL: cbc:ElectronicMail
   */
  ElectronicMail?: UBLJsonText;
}

// --- Suppplier Contact ---
/**
 * Represents contact information specifically for a supplier.
 * Ensures Telephone is mandatory as per typical supplier requirements.
 * Maps to UBL: cac:Contact (within cac:AccountingSupplierParty/cac:Party)
 */
export interface UBLJsonSupplierContact {
  /**
   * Supplier's telephone number. Mandatory.
   * Maps to UBL: cbc:Telephone
   */
  Telephone: UBLJsonText;
  /**
   * Supplier's electronic mail address. Optional.
   * Maps to UBL: cbc:ElectronicMail
   */
  ElectronicMail?: UBLJsonText;
}

// --- Customer Contact ---
/**
 * Represents contact information specifically for a customer.
 * Ensures Telephone is mandatory as per typical customer requirements.
 * Maps to UBL: cac:Contact (within cac:AccountingCustomerParty/cac:Party)
 */
export interface UBLJsonCustomerContact {
  /**
   * Customer's telephone number. Mandatory.
   * Maps to UBL: cbc:Telephone
   */
  Telephone: UBLJsonText;
  /**
   * Customer's electronic mail address. Optional.
   * Maps to UBL: cbc:ElectronicMail
   */
  ElectronicMail?: UBLJsonText;
}

// --- Party Legal Entity ---
/**
 * Represents the legal entity information for a party.
 * Maps to UBL: cac:PartyLegalEntity
 */
export interface UBLJsonPartyLegalEntity {
  /**
   * Registered name of the company or individual.
   * Maps to UBL: cbc:RegistrationName
   */
  RegistrationName?: UBLJsonText;
  /**
   * Company ID (e.g., business registration number). This is a single item here,
   * distinct from PartyIdentification which is an array for multiple IDs like TIN, SST etc.
   * Maps to UBL: cbc:CompanyID (within cac:PartyLegalEntity)
   */
  CompanyID?: UBLJsonPartyIdentificationItem;
}

// UBLJsonDelivaryPartyLegalEntity was removed as it was unused.

// --- Tax Scheme ---
/**
 * Represents a tax scheme.
 * Maps to UBL: cac:TaxScheme
 */
export interface UBLJsonTaxScheme {
  /**
   * Identifier for the tax scheme. Includes attributes for schemeID and schemeAgencyID.
   * For MyInvois, common schemeID is "UN/ECE 5153" and schemeAgencyID is "6".
   * Maps to UBL: cbc:ID
   */
  ID: Array<
    UBLJsonValue<string> & {
      schemeID?: "UN/ECE 5153" | string;
      schemeAgencyID?: "6" | string;
    }
  >;
  /**
   * Name of the tax scheme. Optional.
   * Maps to UBL: cbc:Name
   */
  Name?: UBLJsonText;
  /**
   * Tax type code for this scheme. Optional.
   * Maps to UBL: cbc:TaxTypeCode
   */
  TaxTypeCode?: UBLJsonCode;
}

// --- Party Tax Scheme ---
/**
 * Represents the tax scheme information associated with a party.
 * Maps to UBL: cac:PartyTaxScheme
 */
export interface UBLJsonPartyTaxScheme {
  /**
   * Registration name associated with this tax scheme for the party. Optional.
   * Maps to UBL: cbc:RegistrationName
   */
  RegistrationName?: UBLJsonText;
  /**
   * Company ID related to this tax scheme. Optional.
   * Maps to UBL: cbc:CompanyID
   */
  CompanyID?: UBLJsonIdentifier; // This itself is Array<UBLJsonValue<string>>
  /**
   * The tax scheme details.
   * Maps to UBL: cac:TaxScheme
   */
  TaxScheme: Array<UBLJsonTaxScheme>;
}

// --- Party (Supplier/Customer/Payee) ---
/**
 * Represents a generic Party (e.g., Supplier, Customer, Payee) in UBL JSON.
 * This is a general structure; more specific party types like UBLJsonSupplierParty or UBLJsonCustomerParty extend or specialize this.
 * Corresponds to UBL: cac:Party
 */
export interface UBLJsonParty {
  /**
   * Legal entity information for the party.
   * Maps to UBL: cac:PartyLegalEntity
   */
  PartyLegalEntity?: Array<UBLJsonPartyLegalEntity>;
  /**
   * Party identification numbers (e.g., TIN, BRN).
   * Maps to UBL: cac:PartyIdentification
   */
  PartyIdentification?: Array<UBLJsonPartyIdentificationItem>;
  /**
   * Postal address of the party.
   * Maps to UBL: cac:PostalAddress
   */
  PostalAddress: Array<UBLJsonPostalAddress>;
  /**
   * Contact information for the party.
   * Maps to UBL: cac:Contact
   */
  Contact?: Array<UBLJsonContact>;
}

// --- Party (Customer) ---
/**
 * Represents a Customer Party, detailing the buyer's information.
 * Corresponds to UBL: cac:Party (used within cac:AccountingCustomerParty)
 */
export interface UBLJsonCustomerParty {
  /**
   * Legal entity information for the customer.
   * Maps to UBL: cac:PartyLegalEntity
   */
  PartyLegalEntity: Array<UBLJsonPartyLegalEntity>;
  /**
   * Customer's identification numbers (e.g., TIN, BRN).
   * Maps to UBL: cac:PartyIdentification
   */
  PartyIdentification: Array<UBLJsonPartyIdentificationItem>; // Array of ID items
  /**
   * Postal address of the customer.
   * Maps to UBL: cac:PostalAddress
   */
  PostalAddress: Array<UBLJsonPostalAddress>;
  /**
   * Contact information for the customer.
   * Maps to UBL: cac:Contact
   */
  Contact: Array<UBLJsonCustomerContact>;
}

/**
 * Represents a Supplier Party, detailing the seller's information.
 * Corresponds to UBL: cac:Party (used within cac:AccountingSupplierParty)
 */
export interface UBLJsonSupplierParty {
  /**
   * Malaysia Standard Industrial Classification (MSIC) Code for the supplier.
   * 5-digit numeric code, e.g., "01111". Includes a 'name' attribute for the description.
   * Maps to UBL: cbc:IndustryClassificationCode and @name attribute
   */
  IndustryClassificationCode: Array<
    // 5-digit numeric MSCI code e.g = "01111"
    UBLJsonValue<string> & { name: string }
  >;
  /**
   * Legal entity information for the supplier.
   * Maps to UBL: cac:PartyLegalEntity
   */
  PartyLegalEntity: Array<UBLJsonPartyLegalEntity>;
  /**
   * Supplier's identification numbers (e.g., TIN, BRN, SST).
   * Maps to UBL: cac:PartyIdentification
   */
  PartyIdentification: Array<UBLJsonPartyIdentificationItem>; // Array of ID items
  /**
   * Postal address of the supplier.
   * Maps to UBL: cac:PostalAddress
   */
  PostalAddress: Array<UBLJsonPostalAddress>;
  /**
   * Contact information for the supplier.
   * Maps to UBL: cac:Contact
   */
  Contact: Array<UBLJsonSupplierContact>;
}

// --- Customer/Buyer ---
/**
 * Wrapper for the Customer Party details within an invoice.
 * Corresponds to UBL: cac:AccountingCustomerParty
 */
export interface UBLJsonAccountingCustomerParty {
  /**
   * Contains the detailed party information for the customer.
   * Maps to UBL: cac:Party
   */
  Party: Array<UBLJsonCustomerParty>;
}

// --- Customer/Buyer ---
/**
 * Represents the Accounting Supplier Party (Seller) details.
 * Corresponds to UBL: cac:AccountingSupplierParty
 */
export interface UBLJsonAccountingSupplierParty {
  /**
   * Contains the detailed party information for the supplier.
   * Maps to UBL: cac:Party
   */
  Party: Array<UBLJsonSupplierParty>;
  /**
   * Optional. Additional account ID for the supplier, e.g., Authorisation Number for Certified Exporter.
   * Maps to UBL: cbc:AdditionalAccountID. The schemeAgencyName attribute can specify context like 'CertEx'.
   */
  AdditionalAccountId?: Array<{ _: string; schemeAgencyName?: string }>;
}

// --- Party (DeliveryParty) ---
/**
 * Represents the party to whom goods are delivered or services are rendered.
 * Maps to UBL: cac:DeliveryParty
 */
export interface UBLJsonDeliveryParty {
  /**
   * Legal entity information for the delivery party. Optional.
   * Maps to UBL: cac:PartyLegalEntity
   */
  PartyLegalEntity?: Array<UBLJsonPartyLegalEntity>;
  /**
   * Delivery party's identification numbers. Optional.
   * Maps to UBL: cac:PartyIdentification
   */
  PartyIdentification?: Array<UBLJsonPartyIdentificationItem>; // Array of ID items
  /**
   * Postal address of the delivery party. Optional.
   * Maps to UBL: cac:PostalAddress
   */
  PostalAddress?: Array<UBLJsonPostalAddress>;
}

// --- Tax Category ---
/**
 * Represents a category of tax (e.g., sales tax, service tax).
 * Maps to UBL: cac:TaxCategory
 */
export interface UBLJsonTaxCategory {
  /**
   * Identifier for the tax category (Tax Type Code).
   * Maps to UBL: cbc:ID (e.g., '01' for Sales Tax, 'E' for Exempt)
   */
  ID: Array<UBLJsonValue<TaxTypeCode>>;
  /**
   * Reason for tax exemption, if applicable. Optional.
   * Maps to UBL: cbc:TaxExemptionReason
   */
  TaxExemptionReason?: UBLJsonText;
  /**
   * The tax scheme applicable to this category.
   * Maps to UBL: cac:TaxScheme
   */
  TaxScheme: Array<UBLJsonTaxScheme>;
}

// --- Tax Subtotal ---
/**
 * Represents a subtotal for a specific tax category, including taxable amount and tax amount.
 * Maps to UBL: cac:TaxSubtotal
 */
export interface UBLJsonTaxSubtotal {
  /**
   * The amount subject to this tax category.
   * Maps to UBL: cbc:TaxableAmount
   */
  TaxableAmount: UBLJsonCurrencyAmount;
  /**
   * The actual tax amount for this category.
   * Maps to UBL: cbc:TaxAmount (If exemption, this should be 0)
   */
  TaxAmount: UBLJsonCurrencyAmount;
  /**
   * Details of the tax category.
   * Maps to UBL: cac:TaxCategory
   */
  TaxCategory: Array<UBLJsonTaxCategory>;
  /**
   * Tax rate percentage, if applicable. Optional.
   * Maps to UBL: cbc:Percent
   */
  Percent?: UBLJsonNumeric;
}

// --- Tax Total (Invoice level or Line Item level) ---
/**
 * Represents the total tax amount and subtotals for an invoice or an invoice line.
 * Corresponds to UBL: cac:TaxTotal
 */
export interface UBLJsonTaxTotal {
  /**
   * Total amount of tax payable.
   * Maps to UBL: cbc:TaxAmount
   */
  TaxAmount: UBLJsonCurrencyAmount;
  /**
   * Array of tax subtotals, breaking down taxes by category/rate.
   * Maps to UBL: cac:TaxSubtotal
   */
  TaxSubtotal: Array<UBLJsonTaxSubtotal>;
  /**
   * Optional rounding amount for the total tax.
   * This is not explicitly in the provided core documentation table but is a standard UBL field.
   */
  RoundingAmount?: UBLJsonCurrencyAmount;
}

// --- Allowance/Charge ---
/**
 * Represents an allowance or a charge that applies to an invoice or line item.
 * Maps to UBL: cac:AllowanceCharge
 */
export interface UBLJsonFreightAllowanceCharge {
  /**
   * Indicator whether this is a charge (true) or an allowance (false).
   * Maps to UBL: cbc:ChargeIndicator
   */
  ChargeIndicator: UBLJsonIndicator;
  /**
   * Reason for the allowance or charge. Optional.
   * Maps to UBL: cbc:AllowanceChargeReason
   */
  AllowanceChargeReason?: UBLJsonText;
  /**
   * Amount of the allowance or charge.
   * Maps to UBL: cbc:Amount
   */
  Amount: UBLJsonCurrencyAmount;
}

// --- Item Identification ---
/**
 * Represents identification details for an item.
 * Maps to UBL: cac:BuyersItemIdentification or cac:SellersItemIdentification or standard cac:ItemIdentification
 */
export interface UBLJsonItemIdentification {
  /**
   * The item's identifier.
   * Maps to UBL: cbc:ID
   */
  ID: UBLJsonIdentifier;
  /** Physical attributes of the item. Optional. */
  PhysicalAttribute?: Array<{
    AttributeID: UBLJsonIdentifier;
    PositionCode?: UBLJsonCode;
    DescriptionCode?: UBLJsonCode;
    Description?: UBLJsonText;
  }>;
  /** Measurement dimensions of the item. Optional. */
  MeasurementDimension?: Array<{
    AttributeID: UBLJsonIdentifier;
  }>;
  /** Party that issued this item identification. Optional. */
  IssuerParty?: Array<UBLJsonParty>;
}

// --- Commodity Classification ---
/**
 * Represents how an item is classified (e.g., by product category code).
 * Maps to UBL: cac:CommodityClassification
 */
export interface UBLJsonCommodityClassification {
  /**
   * The classification code for the item.
   * `listID` attribute can specify the classification system (e.g., 'CLASS' for general, 'PTC' for Product Tariff Code).
   * Maps to UBL: cbc:ItemClassificationCode
   */
  ItemClassificationCode: Array<
    UBLJsonValue<ClassificationCode | string> & {
      listID?: "CLASS" | "PTC" | string;
    }
  >;
}

// --- Item ---
/**
 * Represents an item in an invoice line.
 * Maps to UBL: cac:Item
 */
export interface UBLJsonItem {
  /**
   * Commodity classification for the item.
   * Maps to UBL: cac:CommodityClassification
   */
  CommodityClassification: Array<UBLJsonCommodityClassification>;
  /**
   * Description of the product or service. Mandatory for invoice line item.
   * Maps to UBL: cbc:Description
   */
  Description?: UBLJsonText;
  /**
   * Country of origin of the item. Optional.
   * Maps to UBL: cac:OriginCountry/cbc:IdentificationCode
   */
  OriginCountry?: Array<{
    IdentificationCode: Array<UBLJsonValue<CountryCodeISO3166Alpha3>>;
  }>;
}

// --- Price ---
/**
 * Represents the price of an item.
 * Maps to UBL: cac:Price
 */
export interface UBLJsonPrice {
  /**
   * The unit price amount.
   * Maps to UBL: cbc:PriceAmount
   */
  PriceAmount: UBLJsonCurrencyAmount;
}

// --- Item Price Extension ---
/**
 * Represents extensions to the item price, often used for line item subtotal.
 * Maps to UBL: cac:ItemPriceExtension
 */
export interface UBLJsonItemPriceExtension {
  /**
   * The amount associated with this price extension. For MyInvois invoice lines, this represents the Subtotal.
   * Maps to UBL: cbc:Amount (within cac:ItemPriceExtension)
   */
  Amount: UBLJsonCurrencyAmount;
}

// --- Invoice Line (Common to Invoice, CreditNote, DebitNote, RefundNote) ---
/**
 * Represents an individual line item within an invoice or related document.
 * Corresponds to UBL: cac:InvoiceLine
 */
export interface UBLJsonInvoiceLine {
  /**
   * Identifier for the invoice line (e.g., line number).
   * Maps to UBL: cbc:ID
   */
  ID: UBLJsonIdentifier;
  /**
   * Quantity of items for this line. Includes unitCode attribute.
   * Maps to UBL: cbc:InvoicedQuantity
   */
  InvoicedQuantity: Array<UBLJsonValue<number> & { unitCode?: string }>;
  /**
   * Total amount for the line, excluding taxes (Quantity * UnitPrice).
   * Maps to UBL: cbc:LineExtensionAmount
   */
  LineExtensionAmount: UBLJsonCurrencyAmount;
  /**
   * Optional allowances or charges applicable to this line item.
   * Maps to UBL: cac:AllowanceCharge
   */
  AllowanceCharge?: Array<UBLJsonFreightAllowanceCharge>;
  /**
   * Optional tax total for this line item.
   * Maps to UBL: cac:TaxTotal
   */
  TaxTotal?: Array<UBLJsonTaxTotal>;
  /**
   * Details of the item being invoiced.
   * Maps to UBL: cac:Item
   */
  Item: Array<UBLJsonItem>;
  /**
   * Price of the item.
   * Maps to UBL: cac:Price
   */
  Price: Array<UBLJsonPrice>;
  /**
   * Subtotal for the line item (often equivalent to LineExtensionAmount or PriceAmount * Quantity).
   * MyInvois documentation maps 'Subtotal' to this: /Invoice/cac:InvoiceLine/cac:ItemPriceExtension/cbc:Amount
   */
  ItemPriceExtension: Array<UBLJsonItemPriceExtension>;
}

// --- Payment Means ---
/**
 * Describes the means of payment.
 * Maps to UBL: cac:PaymentMeans
 */
export interface UBLJsonPaymentMeans {
  /**
   * Code for the payment mode (e.g., cash, cheque, bank transfer).
   * Maps to UBL: cbc:PaymentMeansCode
   */
  PaymentMeansCode: Array<UBLJsonValue<PaymentMode>>;
  /**
   * Supplier's bank account number for payment. Optional.
   * Maps to UBL: cac:PayeeFinancialAccount/cbc:ID
   */
  PayeeFinancialAccount?: Array<{
    ID: UBLJsonIdentifier;
  }>;
  /**
   * Payment reference number. Optional.
   * Maps to UBL: cbc:PaymentID (Note: This seems to be an identifier not a list of IDs as per MyInvois usage example)
   */
  PaymentID?: UBLJsonIdentifier;
}

// --- Payment Terms ---
/**
 * Describes the payment terms and conditions.
 * Maps to UBL: cac:PaymentTerms
 */
export interface UBLJsonPaymentTerms {
  /**
   * A note about the payment terms (e.g., timing and method of payment).
   * Maps to UBL: cbc:Note
   */
  Note: UBLJsonText;
}

// --- Prepaid Payment ---
/**
 * Describes a prepayment made by the buyer.
 * Maps to UBL: cac:PrepaidPayment
 */
export interface UBLJsonPrepaidPayment {
  /**
   * Prepayment reference number. Optional.
   * Maps to UBL: cbc:ID
   */
  ID?: UBLJsonIdentifier;
  /**
   * The amount prepaid.
   * Maps to UBL: cbc:PaidAmount
   */
  PaidAmount: UBLJsonCurrencyAmount;
  /**
   * Date of prepayment. Optional.
   * Maps to UBL: cbc:PaidDate
   */
  PaidDate?: UBLJsonDate;
  /**
   * Time of prepayment. Optional.
   * Maps to UBL: cbc:PaidTime
   */
  PaidTime?: UBLJsonTime;
}

// --- Legal Monetary Total ---
/**
 * Represents the summary of monetary totals for the invoice.
 * Corresponds to UBL: cac:LegalMonetaryTotal
 */
export interface UBLJsonLegalMonetaryTotal {
  /**
   * Total Net Amount. Sum of total amount payable (inclusive of applicable line item and invoice level discounts and charges), excluding any applicable taxes.
   * Maps to UBL: cbc:LineExtensionAmount
   */
  LineExtensionAmount: UBLJsonCurrencyAmount;
  /**
   * Total Excluding Tax. Sum of amount payable (inclusive of applicable discounts and charges), excluding any applicable taxes.
   * Maps to UBL: cbc:TaxExclusiveAmount
   */
  TaxExclusiveAmount: UBLJsonCurrencyAmount;
  /**
   * Total Including Tax. Sum of amount payable inclusive of total taxes chargeable.
   * Maps to UBL: cbc:TaxInclusiveAmount
   */
  TaxInclusiveAmount: UBLJsonCurrencyAmount;
  /**
   * Total Discount Value. Total amount deducted from the original price.
   * Maps to UBL: cbc:AllowanceTotalAmount
   */
  AllowanceTotalAmount?: UBLJsonCurrencyAmount;
  /**
   * Total Fee / Charge Amount. Total charge associated with the product(s) or service(s) imposed before tax.
   * Maps to UBL: cbc:ChargeTotalAmount
   */
  ChargeTotalAmount?: UBLJsonCurrencyAmount;
  /**
   * PrePayment Amount. Monetary value that is prepaid by the Buyer.
   * Maps to UBL: cac:PrepaidPayment/cbc:PaidAmount (referenced here for summary)
   */
  PrepaidAmount?: UBLJsonCurrencyAmount;
  /**
   * Rounding Amount. Rounding amount added to the amount payable.
   * Maps to UBL: cbc:PayableRoundingAmount
   */
  PayableRoundingAmount?: UBLJsonCurrencyAmount;
  /**
   * Total Payable Amount. Sum of amount payable (inclusive of total taxes chargeable and any rounding adjustment) excluding any amount paid in advance.
   * Maps to UBL: cbc:PayableAmount
   */
  PayableAmount: UBLJsonCurrencyAmount;
}

// --- Document Reference ---
/**
 * Represents a reference to another document.
 * Maps to UBL: cac:DocumentReference (or specific types like cac:InvoiceDocumentReference)
 */
export interface UBLJsonDocumentReference {
  /**
   * Identifier of the referenced document.
   * Maps to UBL: cbc:ID
   */
  ID: UBLJsonIdentifier;
  /**
   * Universally Unique Identifier of the referenced document. Optional.
   * Maps to UBL: cbc:UUID
   */
  UUID?: UBLJsonIdentifier;
  /**
   * Issue date of the referenced document. Optional.
   * Maps to UBL: cbc:IssueDate
   */
  IssueDate?: UBLJsonDate;
  /**
   * Type code of the referenced document. Optional.
   * Maps to UBL: cbc:DocumentTypeCode
   */
  DocumentTypeCode?: Array<UBLJsonValue<string>>;
  /**
   * Type name/description of the referenced document. Optional.
   * Maps to UBL: cbc:DocumentType
   */
  DocumentType?: Array<UBLJsonValue<string>>;
  /**
   * Description of the referenced document. Optional.
   * Maps to UBL: cbc:DocumentDescription
   */
  DocumentDescription?: UBLJsonText;
  /**
   * Attachment containing the referenced document or a link to it. Optional.
   * Maps to UBL: cac:Attachment/cac:ExternalReference/cbc:URI
   */
  Attachment?: Array<{ ExternalReference?: Array<{ URI: UBLJsonIdentifier }> }>;
}

// --- Additional Document Reference ---
/**
 * Represents an additional document reference, often simpler than a full DocumentReference.
 * Maps to UBL: cac:AdditionalDocumentReference
 */
export interface UBLJsonAdditionalDocumentReference {
  /**
   * Identifier of the additional referenced document (e.g., Customs Form No.1, FTA Info).
   * Maps to UBL: cbc:ID
   */
  ID: UBLJsonIdentifier;
  /**
   * Type of the additional document (e.g., "CustomsImportForm", "FreeTradeAgreement", "K2"). Optional.
   * Maps to UBL: cbc:DocumentType
   */
  DocumentType?: Array<UBLJsonValue<string>>;
  /**
   * Description of the additional document. Optional.
   * Maps to UBL: cbc:DocumentDescription
   */
  DocumentDescription?: UBLJsonText;
}

// --- Billing Reference ---
/**
 * Contains references to various billing documents like original invoices, credit notes, etc.
 * Maps to UBL: cac:BillingReference
 */
export interface UBLJsonBillingReference {
  /** Reference to an invoice document. Optional. */
  InvoiceDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Reference to a self-billed invoice document. Optional. */
  SelfBilledInvoiceDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Reference to a credit note document. Optional. */
  CreditNoteDocumentReference?: Array<UBLJsonDocumentReference>;
  /** Reference to a debit note document. Optional. */
  DebitNoteDocumentReference?: Array<UBLJsonDocumentReference>;
  /**
   * Additional document references within billing context (e.g., Bill Reference Number).
   * Maps to UBL: cac:AdditionalDocumentReference/cbc:ID
   */
  AdditionalDocumentReference?: Array<UBLJsonDocumentReference>; // Note: MyInvois maps Bill Reference to AdditionalDocumentReference/ID
}

// --- Tax Exchange Rate ---
/**
 * Specifies the exchange rate used for converting amounts to the tax currency (e.g., MYR).
 * Maps to UBL: cac:TaxExchangeRate. Mandatory where applicable (non-MYR document currency).
 */
export interface UBLJsonTaxExchangeRate {
  /**
   * The currency code of the document being converted from (e.g., USD).
   * Maps to UBL: cbc:SourceCurrencyCode
   */
  SourceCurrencyCode: Array<UBLJsonValue<string>>;
  /**
   * The target currency code, typically the tax currency (e.g., MYR).
   * Maps to UBL: cbc:TargetCurrencyCode
   */
  TargetCurrencyCode: Array<UBLJsonValue<string>>;
  /**
   * The exchange rate applied.
   * Maps to UBL: cbc:CalculationRate
   */
  CalculationRate: UBLJsonNumeric;
}

// --- Invoice Period ---
/**
 * Defines a period to which the invoice applies (e.g., for recurring services).
 * Maps to UBL: cac:InvoicePeriod
 */
export interface UBLJsonInvoicePeriod {
  /**
   * Start date of the billing period. Optional.
   * Maps to UBL: cbc:StartDate
   */
  StartDate?: UBLJsonDate;
  /**
   * End date of the billing period. Optional.
   * Maps to UBL: cbc:EndDate
   */
  EndDate?: UBLJsonDate;
  /**
   * Description of the billing frequency or period (e.g., "Monthly"). Optional.
   * Maps to UBL: cbc:Description
   */
  Description?: UBLJsonText;
}

// --- Shipment ---
/**
 * Describes a shipment of goods.
 * Maps to UBL: cac:Shipment
 */
export interface UBLJsonShipment {
  /**
   * Identifier for the shipment. For MyInvois, this can be used for 'Details of other charges'
   * where ID equals the e-Invoice Code / Number.
   * Maps to UBL: cbc:ID
   */
  ID: UBLJsonIdentifier;
  /**
   * Freight-related allowances or charges for this shipment. Optional.
   * Used for 'Details of other charges' in MyInvois.
   * Maps to UBL: cac:FreightAllowanceCharge
   */
  FreightAllowanceCharge?: Array<UBLJsonFreightAllowanceCharge>;
}

// --- Delivery ---
/**
 * Describes the delivery of goods or services.
 * Maps to UBL: cac:Delivery
 */
export interface UBLJsonDelivery {
  /**
   * The party to whom delivery is made. Optional.
   * Maps to UBL: cac:DeliveryParty
   */
  DeliveryParty?: Array<UBLJsonDeliveryParty>;
  /**
   * Shipment details related to this delivery. Optional.
   * Maps to UBL: cac:Shipment
   */
  Shipment?: Array<UBLJsonShipment>;
}

// --- UBL Extensions ---

/**
 * Represents the data content within an \`ExtensionContent\` block.
 * Keys are typically prefixed (e.g., "sig:UBLDocumentSignatures"), and values are arrays of the specific extension structures.
 */
export type UBLJsonExtensionContentData = {
  // Example: "sig:UBLDocumentSignatures": Array<UBLJsonDocumentSignatureDetails>; (UBLJsonDocumentSignatureDetails would be defined elsewhere)
  [key: string]: Array<any> | any; // Value is typically an array of complex objects for that extension element.
};

/**
 * Represents a single UBL extension in the JSON format.
 */
export interface UBLJsonExtension {
  ExtensionURI?: UBLJsonText;
  ExtensionContent: Array<UBLJsonExtensionContentData>; // ExtensionContent is an array of objects, each object being the content data.
}

/**
 * Represents the \`UBLExtensions\` structure in the main UBL document.
 * It's an array containing one object, which in turn has a \`UBLExtension\` property holding an array of actual extensions.
 * e.g. \`"UBLExtensions": [ { "UBLExtension": [ {ext1}, {ext2} ] } ]\`
 */
export type UBLJsonExtensions = Array<{
  UBLExtension: Array<UBLJsonExtension>;
}>;

/**
 * Represents the content of a UBL extension specifically for UBLDocumentSignatures.
 * (Mirrors the definition from invoice.v1_1.types.ts for consistency as per samples)
 */
export interface UBLJsonSignatureExtensionContent
  extends UBLDocumentSignatureExtension {
  // No additional properties needed here, it directly maps to UBLDocumentSignatureExtension
}

/**
 * Represents a digital signature within a UBL document.
 */
export interface UBLJsonSignature {
  /** Identifies this signature block. Maps to UBL: /cbc:ID */
  ID: UBLJsonIdentifier;
  /** Method used for signature. Maps to UBL: /cbc:SignatureMethod */
  SignatureMethod: Array<UBLJsonValue<string>>;
}
