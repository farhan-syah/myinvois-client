import { MyInvoisClient } from "../client";
import { MyInvoisGenericApiResponseError } from "../types";
import { TaxpayerIdType } from "../codes";
import {
  SearchTaxpayerTINRequestParams,
  SearchTaxpayerTINResponse,
  GetTaxpayerInfoByQRCodeResponse, // Added for new API
} from "./types";

export class TaxpayerService {
  private apiClient: MyInvoisClient;
  private baseUrl: string; // This will be the documents base URL as per API structure

  constructor(apiClient: MyInvoisClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  /**
   * Validates a Taxpayer's Identification Number (TIN).
   * @param tin The Tax Identification Number to validate.
   * @param idType The type of ID being provided (NRIC, PASSPORT, BRN, ARMY).
   * @param idValue The actual value of the ID.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves if the TIN is valid (HTTP 200) or rejects with an error.
   */
  async validateTaxpayerTIN(
    tin: string,
    idType: TaxpayerIdType,
    idValue: string,
    onBehalfOfTIN?: string,
  ): Promise<boolean> {
    try {
      const accessToken = onBehalfOfTIN
        ? await this.apiClient.getIntermediaryAccessToken(
            onBehalfOfTIN,
            "InvoicingAPI",
          )
        : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

      const response = await fetch(
        `${this.baseUrl}/api/v1.0/taxpayer/validate/${tin}?idType=${idType}&idValue=${idValue}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        return true;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      let errorMessage = `API Error: HTTP ${response.status} ${response.statusText}`;
      try {
        errorData = await response.json();
        if (typeof errorData === "object" && errorData.error) {
          errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
          if (errorData.error.errorMS) {
            errorMessage += ` - ${errorData.error.errorMS}`;
          }
        }
      } catch (e) {
        // If parsing JSON fails, use the basic HTTP error
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Searches for a specific Tax Identification Number (TIN) using supported search parameters.
   * Either taxpayerName OR (idType AND idValue) must be provided.
   * @param params The search parameters: idType, idValue, taxpayerName.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the matching TIN or rejects with an error.
   */
  async searchTaxpayerTIN(
    params: SearchTaxpayerTINRequestParams,
    onBehalfOfTIN?: string,
  ): Promise<SearchTaxpayerTINResponse> {
    if (!params.taxpayerName && !(params.idType && params.idValue)) {
      throw new Error(
        "Search criteria incomplete: Provide either taxpayerName OR (idType AND idValue).",
      );
    }
    if (params.idType && !params.idValue) {
      throw new Error("idValue is mandatory when idType is provided.");
    }
    if (params.idValue && !params.idType) {
      throw new Error("idType is mandatory when idValue is provided.");
    }

    try {
      const accessToken = onBehalfOfTIN
        ? await this.apiClient.getIntermediaryAccessToken(
            onBehalfOfTIN,
            "InvoicingAPI",
          )
        : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

      const queryParameters = new URLSearchParams();
      if (params.idType) queryParameters.append("idType", params.idType);
      if (params.idValue) queryParameters.append("idValue", params.idValue);
      if (params.taxpayerName)
        queryParameters.append("taxpayerName", params.taxpayerName);

      const url = `${this.baseUrl}/api/v1.0/taxpayer/search/tin?${queryParameters.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const responseData: SearchTaxpayerTINResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        errorData = await response.json();
        if (typeof errorData === "object" && errorData.error) {
          errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
          if (errorData.error.errorMS) {
            errorMessage += ` - ${errorData.error.errorMS}`;
          }
        }
      } catch (e) {
        // If parsing JSON fails or no JSON body for some errors
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves taxpayer information using a decoded QR code string.
   * @param qrCodeText The Base64 decoded string obtained from scanning a taxpayer's QR code.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the taxpayer's information.
   */
  async getTaxpayerInfoByQRCode(
    qrCodeText: string,
    onBehalfOfTIN?: string,
  ): Promise<GetTaxpayerInfoByQRCodeResponse> {
    if (!qrCodeText) {
      throw new Error("qrCodeText (decoded QR code string) is mandatory.");
    }

    try {
      const accessToken = onBehalfOfTIN
        ? await this.apiClient.getIntermediaryAccessToken(
            onBehalfOfTIN,
            "InvoicingAPI",
          )
        : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

      // The qrCodeText is part of the path, ensure it's properly encoded for a URL path segment if necessary (though typically UUIDs are URL-safe)
      const url = `${this.baseUrl}/api/v1.0/taxpayer/qrcodeinfo/${encodeURIComponent(qrCodeText)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json", // API expects JSON response
        },
      });

      if (response.status === 200) {
        const responseData: GetTaxpayerInfoByQRCodeResponse =
          await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      let errorMessage = `API Error: HTTP ${response.status} ${response.statusText}`;
      try {
        errorData = await response.json(); // Errors are usually JSON
        if (typeof errorData === "object" && errorData.error) {
          errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
          if (errorData.error.errorMS) {
            errorMessage += ` - ${errorData.error.errorMS}`;
          }
        } else if (
          response.status === 404 &&
          typeof errorData === "object" &&
          (errorData as any).Message
        ) {
          // Handle specific 404 message format if different
          errorMessage = `API Error: 404 Not Found - ${(errorData as any).Message}`;
        } else if (response.status === 404) {
          errorMessage = `API Error: 404 QR Code Not Found (qrCodeText: ${qrCodeText})`;
        }
      } catch (e) {
        if (response.status === 404) {
          errorMessage = `API Error: 404 QR Code Not Found (qrCodeText: ${qrCodeText})`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }
}
