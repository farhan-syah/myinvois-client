import { AuthService } from "./auth";
import { DocumentsService } from "./documents";
import { TaxpayerService } from "./taxpayer"; // Added import
import { LoginResponse, MyInvoisRedisClient, MyInvoisClientOptions } from "./types"; // Imported MyInvoisClientOptions
import { MyInvoisAuthenticationError, MyInvoisError } from "./errors"; // Import custom errors

export type MyInvoisEnvironment = "PROD" | "SANDBOX";

const ENV_URLS = {
  PROD: {
    identity: "https://api.myinvois.hasil.gov.my",
    documents: "https://api.myinvois.hasil.gov.my", // Taxpayer API uses this base URL
  },
  SANDBOX: {
    identity: "https://preprod-api.myinvois.hasil.gov.my",
    documents: "https://preprod-api.myinvois.hasil.gov.my", // Taxpayer API uses this base URL
  },
};

import { MyInvoisOAuthError, MyInvoisNetworkError, MyInvoisStandardAPIError } from "./errors"; // Added for @throws

/**
 * Main client for interacting with the MyInvois API.
 * It handles authentication and provides access to various services
 * like DocumentsService and TaxpayerService.
 */
export class MyInvoisClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null; // Timestamp in ms when token expires
  private currentOnBehalfOfTIN: string | null = null;

  private authServiceInstance: AuthService;
  public documents: DocumentsService;
  public taxpayer: TaxpayerService;

  public auth: {
    /**
     * Logs in as a taxpayer and retrieves an access token.
     * This token is stored internally and used for subsequent API calls.
     * @param scope Optional scope for the access token. Defaults to "InvoicingAPI".
     * @returns A promise that resolves to the access token string.
     * @throws {MyInvoisAuthenticationError} If login fails locally or token cannot be retrieved post-login.
     * @throws {MyInvoisOAuthError} If the MyInvois API returns an OAuth error.
     * @throws {MyInvoisNetworkError} If a network error occurs.
     */
    loginAsTaxpayer: (scope?: string) => Promise<string>;
    /**
     * Logs in as an intermediary on behalf of a taxpayer and retrieves an access token.
     * This token is stored internally and used for subsequent API calls.
     * @param onBehalfOfTIN The TIN of the taxpayer on whose behalf the intermediary is acting.
     * @param scope Optional scope for the access token. Defaults to "InvoicingAPI".
     * @returns A promise that resolves to the access token string.
     * @throws {MyInvoisAuthenticationError} If login fails locally or token cannot be retrieved post-login.
     * @throws {MyInvoisOAuthError} If the MyInvois API returns an OAuth error.
     * @throws {MyInvoisNetworkError} If a network error occurs.
     */
    loginAsIntermediary: (
      onBehalfOfTIN: string,
      scope?: string
    ) => Promise<string>;
  };

  /**
   * Creates an instance of MyInvoisClient.
   * @param clientId Your client ID for the MyInvois API.
   * @param clientSecret Your client secret for the MyInvois API.
   * @param options Optional configuration options for the client. See {@link MyInvoisClientOptions}.
   * @example
   * ```typescript
   * // Basic instantiation for Production (default environment)
   * const clientProd = new MyInvoisClient("your-client-id", "your-client-secret");
   *
   * // Instantiation for Sandbox environment
   * const clientSandbox = new MyInvoisClient("your-client-id", "your-client-secret", { environment: "SANDBOX" });
   *
   * // With Redis for token caching
   * // import Redis from "ioredis";
   * // const redis = new Redis();
   * // const clientWithCache = new MyInvoisClient("your-client-id", "your-client-secret", { redisClient: redis });
   *
   * // With custom URL overrides
   * const clientCustomUrls = new MyInvoisClient("your-client-id", "your-client-secret", {
   *   identityBaseUrlOverride: "https://my-proxy.com/identity-api",
   *   documentsBaseUrlOverride: "https://my-proxy.com/documents-api"
   * });
   * ```
   */
  constructor(
    clientId: string,
    clientSecret: string,
    options: MyInvoisClientOptions = {} // Changed to options object
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    const resolvedEnvironment = options.environment ?? "PROD";
    const resolvedRedisClient = options.redisClient;

    const resolvedIdentityBaseUrl =
      options.identityBaseUrlOverride && options.identityBaseUrlOverride.trim() !== ""
        ? options.identityBaseUrlOverride
        : ENV_URLS[resolvedEnvironment].identity;

    const resolvedDocumentsBaseUrl =
      options.documentsBaseUrlOverride && options.documentsBaseUrlOverride.trim() !== ""
        ? options.documentsBaseUrlOverride
        : ENV_URLS[resolvedEnvironment].documents;

    this.authServiceInstance = new AuthService(resolvedIdentityBaseUrl, resolvedRedisClient);
    this.documents = new DocumentsService(this, resolvedDocumentsBaseUrl);
    this.taxpayer = new TaxpayerService(this, resolvedDocumentsBaseUrl);

    this.auth = {
      loginAsTaxpayer: (scope?: string) => this.getTaxpayerAccessToken(scope),
      loginAsIntermediary: (onBehalfOfTIN: string, scope?: string) =>
        this.getIntermediaryAccessToken(onBehalfOfTIN, scope),
    };
  }

  // This method now benefits from AuthService's caching.
  // The LoginResponse will have `expires_in` correctly set to remaining time.
  private async _loginAsTaxpayerAndStoreToken(scope?: string): Promise<void> {
    try {
      const loginResponse: LoginResponse =
        await this.authServiceInstance.loginAsTaxpayer(
          this.clientId,
          this.clientSecret,
          scope
        );
      this.accessToken = loginResponse.access_token;
      // Date.now() + (remaining_expires_in * 1000) is correct
      this.tokenExpiryTime = Date.now() + loginResponse.expires_in * 1000;
      this.currentOnBehalfOfTIN = null;
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiryTime = null;
      this.currentOnBehalfOfTIN = null;
      // console.error("MyInvoisClient: Failed to perform taxpayer login:", error);
      throw error;
    }
  }

  // This method also benefits similarly
  private async _performIntermediaryLoginAndStoreToken(
    onBehalfOfTIN: string,
    scope?: string
  ): Promise<void> {
    try {
      const loginResponse: LoginResponse =
        await this.authServiceInstance.loginAsIntermediary(
          this.clientId,
          this.clientSecret,
          onBehalfOfTIN,
          scope
        );
      this.accessToken = loginResponse.access_token;
      this.tokenExpiryTime = Date.now() + loginResponse.expires_in * 1000;
      this.currentOnBehalfOfTIN = onBehalfOfTIN;
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiryTime = null;
      this.currentOnBehalfOfTIN = null;
      // console.error("MyInvoisClient: Failed to perform intermediary login:", error);
      throw error;
    }
  }

  // isTokenValid remains crucial for the client's internal logic.
  private isTokenValid(): boolean {
    return (
      this.accessToken !== null &&
      this.tokenExpiryTime !== null &&
      Date.now() < this.tokenExpiryTime
    );
  }

  async getTaxpayerAccessToken(scope?: string): Promise<string> {
    if (!this.isTokenValid()) {
      await this._loginAsTaxpayerAndStoreToken(scope);
    }
    if (!this.accessToken) {
      // This path should ideally not be reached if _loginAsTaxpayerAndStoreToken throws on failure.
      // However, as a safeguard:
      throw new MyInvoisAuthenticationError(
        "MyInvoisClient: Unable to retrieve taxpayer access token after login attempt."
      );
    }
    return this.accessToken;
  }

  async getIntermediaryAccessToken(
    onBehalfOfTIN: string,
    scope?: string
  ): Promise<string> {
    // Token must be valid AND for the correct TIN if already an intermediary token
    if (!this.isTokenValid() || this.currentOnBehalfOfTIN !== onBehalfOfTIN) {
      await this._performIntermediaryLoginAndStoreToken(onBehalfOfTIN, scope);
    }
    if (!this.accessToken) {
      // This path should ideally not be reached if _performIntermediaryLoginAndStoreToken throws on failure.
      // However, as a safeguard:
      throw new MyInvoisAuthenticationError(
        "MyInvoisClient: Unable to retrieve intermediary access token after login attempt."
      );
    }
    return this.accessToken;
  }

  /**
   * Retrieves the current valid access token.
   * If the token is invalid or expired, it attempts to re-authenticate based on the last login type
   * (taxpayer or intermediary).
   * It's generally recommended that services ensure explicit login via `client.auth.loginAs...`
   * methods before relying heavily on automatic re-authentication by this method.
   *
   * @returns A Promise that resolves to the access token string.
   * @throws {MyInvoisAuthenticationError} If no valid token can be obtained, even after re-authentication attempts.
   * @throws {MyInvoisOAuthError} If the MyInvois API returns an OAuth error during re-authentication.
   * @throws {MyInvoisNetworkError} If a network error occurs during re-authentication.
   */
  public async getCurrentAccessToken(): Promise<string> {
    // This method might need to ensure authentication if no token is present.
    // It's called by services which should ideally ensure login first,
    // but this provides a fallback re-authentication attempt.
    if (!this.isTokenValid()) {
      try {
        if (this.currentOnBehalfOfTIN) {
          // If context suggests an intermediary login was last performed (or intended)
          await this.getIntermediaryAccessToken(this.currentOnBehalfOfTIN);
        } else {
          // Default to taxpayer login
          await this.getTaxpayerAccessToken();
        }
      } catch (error) {
        // If re-authentication fails, propagate the error.
        // The error will be one of MyInvoisAuthenticationError, MyInvoisOAuthError, or MyInvoisNetworkError.
        // Add a more specific message to indicate failure during re-authentication attempt by getCurrentAccessToken.
        if (error instanceof MyInvoisError) { // Check if it's one of our custom errors
          throw new MyInvoisAuthenticationError(`Failed to re-authenticate in getCurrentAccessToken: ${error.message}`);
        }
        // For unexpected errors
        throw new MyInvoisAuthenticationError(`An unexpected error occurred during re-authentication in getCurrentAccessToken: ${String(error)}`);
      }
    }

    // After attempting re-authentication (if needed), check token validity again.
    if (!this.accessToken) {
      // This should ideally not be reached if getTaxpayerAccessToken/getIntermediaryAccessToken
      // throw an error on failure. But as a final safeguard:
      throw new MyInvoisAuthenticationError(
        "MyInvoisClient: No valid access token available even after re-authentication attempt in getCurrentAccessToken."
      );
    }
    return this.accessToken;
  }
}
