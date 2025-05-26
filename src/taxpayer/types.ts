import { TaxpayerIdType } from "../codes";

// Types for Search Taxpayer's TIN API
export interface SearchTaxpayerTINRequestParams {
  idType?: TaxpayerIdType;
  idValue?: string;
  taxpayerName?: string;
}

export interface SearchTaxpayerTINResponse {
  tin: string;
}

// Types for Get Taxpayer Info by QR Code API
export interface GetTaxpayerInfoByQRCodeResponse {
  tin: string;
  name: string;
  idType: string; // Could be TaxpayerIdType, but API doc shows it as string (e.g., "BRN")
  idNumber: string;
  sst?: string; // Optional as not all taxpayers might have SST
  email?: string; // Can be multiple, separated by semicolon
  contactNumber?: string;
  ttx?: string; // Tourism Tax number, optional
  businessActivityDescriptionBM?: string;
  businessActivityDescriptionEN?: string;
  msic?: string; // Malaysian Standard Industrial Classification
  addressLine0?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalZone?: string;
  city?: string;
  state?: string;
  country?: string; // API example shows "TCA", which is Turks and Caicos. Should map to CountryCodeISO3166Alpha3 if strict typing is desired here, but API just says String.
  generatedTimestamp: string; // ISO 8601 DateTime format e.g., "2025-01-02T14:52:50"
}
