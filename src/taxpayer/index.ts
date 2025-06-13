import { MyInvoisClient } from "../client";
import { TaxpayerIdType } from "../codes";
import { MyInvoisNetworkError, MyInvoisStandardAPIError, MyInvoisError } from "../errors";
import {
  GetTaxpayerInfoByQRCodeResponse,
  SearchTaxpayerTINRequestParams,
  SearchTaxpayerTINResponse,
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
   * @returns A promise that resolves to true if the TIN is valid.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response (e.g., TIN not found or invalid).
   */
  async validateTaxpayerTIN(
    tin: string,
    idType: TaxpayerIdType,
    idValue: string,
    onBehalfOfTIN?: string
  ): Promise<boolean> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(onBehalfOfTIN)
      : await this.apiClient.getTaxpayerAccessToken();

    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}/api/v1.0/taxpayer/validate/${tin}?idType=${idType}&idValue=${idValue}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in validateTaxpayerTIN: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      return true;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Searches for a specific Tax Identification Number (TIN) using supported search parameters.
   * Either taxpayerName OR (idType AND idValue) must be provided.
   * @param params The search parameters: idType, idValue, taxpayerName.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the matching TIN.
   * @throws {MyInvoisError} If search criteria are incomplete.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async searchTaxpayerTIN(
    params: SearchTaxpayerTINRequestParams,
    onBehalfOfTIN?: string
  ): Promise<SearchTaxpayerTINResponse> {
    if (!params.taxpayerName && !(params.idType && params.idValue)) {
      throw new MyInvoisError( // Using MyInvoisError for client-side validation
        "Search criteria incomplete: Provide either taxpayerName OR (idType AND idValue)."
      );
    }
    if (params.idType && !params.idValue) {
      throw new MyInvoisError("idValue is mandatory when idType is provided.");
    }
    if (params.idValue && !params.idType) {
      throw new MyInvoisError("idType is mandatory when idValue is provided.");
    }

    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const queryParameters = new URLSearchParams();
    if (params.idType) queryParameters.append("idType", params.idType);
    if (params.idValue) queryParameters.append("idValue", params.idValue);
    if (params.taxpayerName)
      queryParameters.append("taxpayerName", params.taxpayerName);

    const url = `${this.baseUrl}/api/v1.0/taxpayer/search/tin?${queryParameters.toString()}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in searchTaxpayerTIN: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: SearchTaxpayerTINResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
         error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Retrieves taxpayer information using a decoded QR code string.
   * @param qrCodeText The Base64 decoded string obtained from scanning a taxpayer's QR code.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the taxpayer's information.
   * @throws {MyInvoisError} If qrCodeText is not provided.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getTaxpayerInfoByQRCode(
    qrCodeText: string,
    onBehalfOfTIN?: string
  ): Promise<GetTaxpayerInfoByQRCodeResponse> {
    if (!qrCodeText) {
      throw new MyInvoisError("qrCodeText (decoded QR code string) is mandatory.");
    }
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(onBehalfOfTIN)
      : await this.apiClient.getTaxpayerAccessToken();

    const url = `${this.baseUrl}/api/v1.0/taxpayer/qrcodeinfo/${encodeURIComponent(qrCodeText)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getTaxpayerInfoByQRCode: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: GetTaxpayerInfoByQRCodeResponse =
        await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }
}

export * from "./types";
