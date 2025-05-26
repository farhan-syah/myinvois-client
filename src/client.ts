import { AuthService } from "./auth";
import { DocumentsService } from "./documents";
import { TaxpayerService } from "./taxpayer"; // Added import

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
  private tokenExpiryTime: number | null = null;
  private currentOnBehalfOfTIN: string | null = null;

  private authServiceInstance: AuthService;
  public documents: DocumentsService;
  public taxpayer: TaxpayerService; // Added TaxpayerService instance

  private identityBaseUrl: string;

  public auth: {
    loginAsTaxpayer: (scope?: string) => Promise<string>;
    loginAsIntermediary: (
      onBehalfOfTIN: string,
      scope?: string,
    ) => Promise<string>;
  };

  constructor(
    clientId: string,
    clientSecret: string,
    environment: MyInvoisEnvironment = "PROD",
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.identityBaseUrl = ENV_URLS[environment].identity;
    const documentsBaseUrl = ENV_URLS[environment].documents; // This URL is used for documents and taxpayer APIs

    this.authServiceInstance = new AuthService(this.identityBaseUrl);
    this.documents = new DocumentsService(this, documentsBaseUrl);
    this.taxpayer = new TaxpayerService(this, documentsBaseUrl); // Instantiate TaxpayerService

    this.auth = {
      loginAsTaxpayer: (scope?: string) => this.getTaxpayerAccessToken(scope),
      loginAsIntermediary: (onBehalfOfTIN: string, scope?: string) =>
        this.getIntermediaryAccessToken(onBehalfOfTIN, scope),
    };
  }

  /**
   * Performs taxpayer login, stores token.
   * @param scope Optional scope for access.
   */
  private async _loginAsTaxpayerAndStoreToken(scope?: string): Promise<void> {
    try {
      const loginResponse = await this.authServiceInstance.loginAsTaxpayer(
        this.clientId,
        this.clientSecret,
        scope,
      );
      this.accessToken = loginResponse.access_token;
      this.tokenExpiryTime = Date.now() + loginResponse.expires_in * 1000;
      this.currentOnBehalfOfTIN = null; // Reset for taxpayer login
      // console.log("Login successful. Token stored in MyInvoisClient."); // Removed
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiryTime = null;
      this.currentOnBehalfOfTIN = null;
      // console.error("MyInvoisClient: Failed to perform login:", error); // Removed
      throw error;
    }
  }

  private isTokenValid(): boolean {
    return (
      this.accessToken !== null &&
      this.tokenExpiryTime !== null &&
      Date.now() < this.tokenExpiryTime
    );
  }

  async getTaxpayerAccessToken(scope?: string): Promise<string> {
    if (!this.isTokenValid()) {
      // console.log(
      //   "Access token is invalid, expired, or not yet fetched. Performing login.",
      // ); // Removed
      await this._loginAsTaxpayerAndStoreToken(scope);
    }
    if (!this.accessToken) {
      // This case should ideally be handled by _loginAsTaxpayerAndStoreToken throwing an error
      throw new Error(
        "MyInvoisClient: Unable to retrieve access token after login attempt.",
      );
    }
    return this.accessToken;
  }

  /**
   * Performs intermediary login, stores token.
   * @param onBehalfOfTIN The Tax Identification Number (TIN) of the taxpayer the intermediary is representing.
   * @param scope Optional scope for access.
   */
  private async _performIntermediaryLoginAndStoreToken(
    onBehalfOfTIN: string,
    scope?: string,
  ): Promise<void> {
    try {
      const loginResponse = await this.authServiceInstance.loginAsIntermediary(
        this.clientId,
        this.clientSecret,
        onBehalfOfTIN,
        scope,
      );
      this.accessToken = loginResponse.access_token;
      this.tokenExpiryTime = Date.now() + loginResponse.expires_in * 1000;
      this.currentOnBehalfOfTIN = onBehalfOfTIN; // Store TIN for intermediary token
      // console.log(
      //   "Intermediary login successful. Token stored in MyInvoisClient.",
      // ); // Removed
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiryTime = null;
      this.currentOnBehalfOfTIN = null;
      // console.error(
      //   "MyInvoisClient: Failed to perform intermediary login:",
      //   error,
      // ); // Removed
      throw error;
    }
  }

  async getIntermediaryAccessToken(
    onBehalfOfTIN: string,
    scope?: string,
  ): Promise<string> {
    // Check if the current token is valid AND for the correct onBehalfOfTIN
    if (!this.isTokenValid() || this.currentOnBehalfOfTIN !== onBehalfOfTIN) {
      // console.log(
      //   `Access token is invalid, expired, not for the correct TIN (${onBehalfOfTIN}), or not yet fetched. Performing intermediary login.`,
      // ); // Removed
      await this._performIntermediaryLoginAndStoreToken(onBehalfOfTIN, scope);
    } else {
      // console.log(
      //   `Using cached access token for TIN: ${onBehalfOfTIN}.`,
      // ); // Removed
    }

    if (!this.accessToken) {
      // This case should ideally be handled by _performIntermediaryLoginAndStoreToken throwing an error
      throw new Error(
        "MyInvoisClient: Unable to retrieve access token after intermediary login attempt.",
      );
    }
    return this.accessToken;
  }

  // getAllDocumentTypes() is removed. It will be accessed via client.documents.getAllDocumentTypes()
  // getDocumentsService() is removed as DocumentsService is instantiated in constructor.
}
