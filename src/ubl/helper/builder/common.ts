import {
  UBLJsonCurrencyAmount,
  UBLJsonCustomerContact,
  UBLJsonCustomerParty,
  UBLJsonDate,
  UBLJsonFreightAllowanceCharge,
  UBLJsonIdentifier,
  UBLJsonIndicator,
  UBLJsonNumeric,
  UBLJsonPostalAddress,
  UBLJsonSupplierContact,
  UBLJsonSupplierParty,
  UBLJsonText,
  UBLJsonTime,
} from "../../json/ubl_json";
import {
  AddressParam,
  AllowanceChargeParam,
  CustomerPartyParam,
  SupplierPartyParam,
} from "../params/common";

// --- Helper functions for UBL JSON primitive construction ---
/**
 * @internal
 * Converts a string to a UBLJsonText structure.
 * UBLJsonText is an array with one object: `[{ _: "value" }]`.
 */
export const toUblText = (value?: string): UBLJsonText | undefined =>
  value !== undefined ? [{ _: value }] : undefined;
/**
 * @internal
 * Converts a string to a UBLJsonIdentifier structure.
 */
export const toUblIdentifier = (
  value?: string
): UBLJsonIdentifier | undefined =>
  value !== undefined ? [{ _: value }] : undefined;
/**
 * @internal
 * Converts a string (YYYY-MM-DD) to a UBLJsonDate structure.
 */
export const toUblDate = (value?: string): UBLJsonDate | undefined =>
  value !== undefined ? [{ _: value }] : undefined;
/**
 * @internal
 * Converts a string (HH:MM:SSZ) to a UBLJsonTime structure.
 */
export const toUblTime = (value?: string): UBLJsonTime | undefined =>
  value !== undefined ? [{ _: value }] : undefined;
/**
 * @internal
 * Converts a number and currency ID to a UBLJsonCurrencyAmount structure.
 * Result: `[{ _: amount, currencyID: "MYR" }]`
 */
export const toUblCurrencyAmount = (
  amount: number | undefined,
  currencyID: string
): UBLJsonCurrencyAmount | undefined =>
  amount !== undefined ? [{ _: amount, currencyID }] : undefined;
/**
 * @internal
 * Converts a number to a UBLJsonNumeric structure.
 */
export const toUblNumeric = (
  value: number | undefined
): UBLJsonNumeric | undefined =>
  value !== undefined ? [{ _: value }] : undefined;
/**
 * @internal
 * Converts a boolean to a UBLJsonIndicator structure.
 */
export const toUblIndicator = (
  value: boolean | undefined
): UBLJsonIndicator | undefined =>
  value !== undefined ? [{ _: value }] : undefined;

// --- Helper functions for UBL JSON aggregate component construction (Can also be in common) ---
/**
 * @internal
 * Constructs the UBL `AccountingCustomerParty` JSON structure from simplified `CustomerPartyParam`.
 * @param customer The customer parameters.
 * @param docCurrency The document currency code, used for any monetary values if needed (though not directly in this specific builder).
 * @returns UBLJsonCustomerParty structure.
 */
export const buildCustomerParty = (
  customer: CustomerPartyParam
): UBLJsonCustomerParty => {
  const postalAddress: UBLJsonPostalAddress = {
    AddressLine: customer.address.addressLines.map((line) => ({
      Line: [{ _: line }],
    })),
    PostalZone: toUblText(customer.address.postalZone),
    CityName: [{ _: customer.address.cityName }],
    CountrySubentityCode: [{ _: customer.address.countrySubentityCode }],
    Country: [
      {
        IdentificationCode: [
          {
            _: customer.address.countryCode,
            listID: "ISO3166-1",
            listAgencyID: "6",
          },
        ],
      },
    ],
  };

  const contact: UBLJsonCustomerContact[] = [
    {
      Telephone: [{ _: customer.telephone }],
      // Note: email is optional in CustomerPartyParam and UBLJsonCustomerContact
      ...(customer.electronicMail && {
        ElectronicMail: [{ _: customer.electronicMail }],
      }),
    },
  ];

  return {
    PartyLegalEntity: [
      {
        RegistrationName: toUblText(customer.legalName),
      },
    ],
    PartyIdentification: [
      {
        ID: [
          {
            _: customer.TIN,
            schemeID: "TIN",
          },
        ],
      },
      {
        ID: [
          {
            _: customer.identificationNumber,
            schemeID: customer.identificationScheme,
          },
        ],
      },
      {
        ID: [
          {
            _: customer.sstRegistrationNumber ?? "NA",
            schemeID: "SST",
          },
        ],
      },
      {
        ID: [
          {
            _: customer.tourismTaxRegistrationNumber ?? "NA",
            schemeID: "TTX",
          },
        ],
      },
    ],
    PostalAddress: [postalAddress],
    Contact: contact,
  };
};

/**
 * @internal
 * Constructs the UBL `AccountingSupplierParty` JSON structure from simplified `SupplierPartyParam`.
 * @param supplierParam The supplier parameters.
 * @param docCurrency The document currency code.
 * @returns UBLJsonSupplierParty structure.
 */
export const buildSupplier = (
  supplierParam: SupplierPartyParam
): UBLJsonSupplierParty => {
  const postalAddress: UBLJsonPostalAddress = {
    AddressLine: supplierParam.address.addressLines.map((line) => ({
      Line: [{ _: line }],
    })),
    PostalZone: toUblText(supplierParam.address.postalZone),
    CityName: [{ _: supplierParam.address.cityName }],
    CountrySubentityCode: [{ _: supplierParam.address.countrySubentityCode }],
    Country: [
      {
        IdentificationCode: [
          {
            _: supplierParam.address.countryCode,
            listID: "ISO3166-1",
            listAgencyID: "6",
          },
        ],
      },
    ],
  };

  const contact: UBLJsonSupplierContact[] = [
    {
      Telephone: [{ _: supplierParam.telephone }],
      // Note: email is optional in SupplierPartyParam and UBLJsonSupplierContact
      ...(supplierParam.electronicMail && {
        ElectronicMail: [{ _: supplierParam.electronicMail }],
      }),
    },
  ];

  return {
    IndustryClassificationCode: [
      {
        _: supplierParam.industryClassificationCode,
        name: supplierParam.industryClassificationName,
      },
    ],
    PartyLegalEntity: [
      {
        RegistrationName: toUblText(supplierParam.legalName),
      },
    ],
    PartyIdentification: [
      {
        ID: [
          {
            _: supplierParam.TIN,
            schemeID: "TIN",
          },
        ],
      },
      {
        ID: [
          {
            _: supplierParam.identificationNumber,
            schemeID: supplierParam.identificationScheme,
          },
        ],
      },
      {
        ID: [
          {
            _: supplierParam.sstRegistrationNumber ?? "NA",
            schemeID: "SST",
          },
        ],
      },
      {
        ID: [
          {
            _: supplierParam.tourismTaxRegistrationNumber ?? "NA",
            schemeID: "TTX",
          },
        ],
      },
    ],
    PostalAddress: [postalAddress],
    Contact: contact,
  };
};

/**
 * @internal
 * Constructs an array of UBL `AllowanceCharge` JSON structures from simplified `AllowanceChargeParam` objects.
 * @param params Array of allowance/charge parameters.
 * @param currencyID The currency ID to use for the amounts.
 * @returns Array of UBLJsonFreightAllowanceCharge structures, or undefined if params is empty.
 */
export const buildAllowanceCharges = (
  params: AllowanceChargeParam[] | undefined,
  currencyID: string
): UBLJsonFreightAllowanceCharge[] | undefined => {
  if (!params || params.length === 0) return undefined;
  return params.map((ac) => ({
    ChargeIndicator: [{ _: ac.isCharge }],
    AllowanceChargeReason: toUblText(ac.reason),
    Amount: toUblCurrencyAmount(ac.amount, currencyID)!, // Amount is mandatory in UBLJsonFreightAllowanceCharge
  }));
};

/**
 * @internal
 * Helper to build UBL `PostalAddress` JSON structure from `AddressParam`.
 * @param addressParam The address parameters.
 * @returns UBLJsonPostalAddress structure.
 */
export const buildPostalAddressFromAddressParam = (
  addressParam: AddressParam
): UBLJsonPostalAddress => {
  return {
    AddressLine: addressParam.addressLines.map((line) => ({
      Line: [{ _: line }],
    })),
    PostalZone: toUblText(addressParam.postalZone),
    CityName: [{ _: addressParam.cityName }],
    CountrySubentityCode: [{ _: addressParam.countrySubentityCode }],
    Country: [
      {
        IdentificationCode: [
          {
            _: addressParam.countryCode,
            listID: "ISO3166-1",
            listAgencyID: "6",
          },
        ],
      },
    ],
  };
};
