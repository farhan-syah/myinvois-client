import {
  MyInvoisLoginRequest,
  MyInvoisLoginResponse,
  MyInvoisErrorResponse,
} from "./types";

export class AuthService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticates with the MyInvois Identity Service and retrieves an access token.
   * @param clientId The client ID for the ERP system.
   * @param clientSecret The client secret for the ERP system.
   * @param scope Optional scope for access.
   * @returns A promise that resolves with the login response or rejects with an error.
   */
  async loginAsTaxpayer(
    clientId: string,
    clientSecret: string,
    scope?: string,
  ): Promise<MyInvoisLoginResponse> {
    const requestBody: MyInvoisLoginRequest = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: scope,
    };

    try {
      const response = await fetch(`${this.baseUrl}/connect/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(Object.fromEntries(Object.entries(requestBody).filter(([_, v]) => v !== undefined))).toString(),
      });

      if (!response.ok) {
        let errorData: MyInvoisErrorResponse;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(
            `API Error: HTTP ${response.status} ${response.statusText}`,
          );
        }

        throw new Error(
          `API Error: ${errorData.error ?? errorData.statusCode ?? ""} - ${errorData.error_description ?? errorData.message ?? response.statusText ?? "Unknown error"}`,
        );
      }

      const responseData: MyInvoisLoginResponse = await response.json();

      return responseData;
    } catch (error) {

      throw error;
    }
  }

  /**
   * Authenticates as an intermediary system with the MyInvois Identity Service and retrieves an access token.
   * @param clientId The client ID for the ERP system.
   * @param clientSecret The client secret for the ERP system.
   * @param onBehalfOfTIN The Tax Identification Number (TIN) of the taxpayer the intermediary is representing, or TIN:ROBNumber.
   * @param scope Optional scope for access.
   * @returns A promise that resolves with the login response or rejects with an error.
   */
  async loginAsIntermediary(
    clientId: string,
    clientSecret: string,
    onBehalfOfTIN: string,
    scope?: string,
  ): Promise<MyInvoisLoginResponse> {
    const requestBody: MyInvoisLoginRequest = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: scope,
    };

    try {
      const response = await fetch(`${this.baseUrl}/connect/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          onbehalfof: onBehalfOfTIN,
        },
        body: new URLSearchParams(Object.fromEntries(Object.entries(requestBody).filter(([_, v]) => v !== undefined))).toString(),
      });

      if (!response.ok) {
        let errorData: MyInvoisErrorResponse;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(
            `API Error: HTTP ${response.status} ${response.statusText}`,
          );
        }
        throw new Error(
          `API Error: ${errorData.error} - ${errorData.error_description || response.statusText || "Unknown error"}`,
        );
      }

      const responseData: MyInvoisLoginResponse = await response.json();

      return responseData;
    } catch (error) {
      // console.error(
      //   "MyInvois intermediary authentication failed in AuthService:",
      //   error,
      // ); // Removed
      throw error;
    }
  }
}
