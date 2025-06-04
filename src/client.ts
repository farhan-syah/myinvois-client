import { AuthService } from "./auth";
import { DocumentsService } from "./documents";
import { TaxpayerService } from "./taxpayer"; // Added import
import { LoginResponse, MyInvoisRedisClient } from "./types";

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
    loginAsTaxpayer: (scope?: string) => Promise<string>; // Returns access token string
    loginAsIntermediary: (
      onBehalfOfTIN: string,
      scope?: string
    ) => Promise<string>;
  };

  constructor(
    clientId: string,
    clientSecret: string,
    environment: MyInvoisEnvironment = "PROD",
    redisClient?: MyInvoisRedisClient // Optional: User provides their Redis client instance
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    const identityBaseUrl = ENV_URLS[environment].identity;
    const documentsBaseUrl = ENV_URLS[environment].documents;

    // Pass the redisClient to the AuthService
    this.authServiceInstance = new AuthService(identityBaseUrl, redisClient);
    this.documents = new DocumentsService(this, documentsBaseUrl);
    this.taxpayer = new TaxpayerService(this, documentsBaseUrl); // Assuming TaxpayerService exists

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
      throw new Error(
        "MyInvoisClient: Unable to retrieve taxpayer access token."
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
      throw new Error(
        "MyInvoisClient: Unable to retrieve intermediary access token."
      );
    }
    return this.accessToken;
  }

  // Expose a way to get the current token for external use if needed, e.g., for DocumentsService
  public async getCurrentAccessToken(): Promise<string | null> {
    // This method might need to ensure authentication if no token is present,
    // but it depends on how DocumentsService is intended to work.
    // For now, just return the current token.
    // If this.currentOnBehalfOfTIN is set, it implies an intermediary login was last.
    // Otherwise, a taxpayer login was last (or no login yet).
    // This method is called by DocumentsService, which should have already ensured
    // that the MyInvoisClient is properly authenticated by calling one of the
    // client.auth.loginAs... methods.
    if (!this.isTokenValid()) {
      // This case should ideally be prevented by DocumentService ensuring login first.
      // Or, you could trigger a default login type if appropriate, but that's complex.
      // For now, erroring out if no valid token is available seems safest if DocumentService
      // relies on this method *after* authentication.
      if (this.currentOnBehalfOfTIN) {
        await this.getIntermediaryAccessToken(this.currentOnBehalfOfTIN);
      } else {
        await this.getTaxpayerAccessToken();
      }
    }
    return this.accessToken;
  }
}
