/**
 * This module defines custom error classes for the MyInvois SDK.
 * All custom errors inherit from {@link MyInvoisError}.
 * These errors provide more specific information about issues encountered during API interactions
 * or client operations, allowing for more targeted error handling.
 *
 * @example Catching specific errors
 * ```typescript
 * try {
 *   const client = new MyInvoisClient("id", "secret");
 *   const token = await client.auth.loginAsTaxpayer();
 *   // ... use token or client methods
 * } catch (error) {
 *   if (error instanceof MyInvoisOAuthError) {
 *     console.error("OAuth API Error:", error.message, error.httpStatusCode, error.oauthErrorCode, error.errorDescription, error.rawResponse);
 *   } else if (error instanceof MyInvoisStandardAPIError) {
 *     console.error("Standard API Error:", error.message, error.httpStatusCode, error.apiErrorCode, error.errorMS, error.rawResponse);
 *   } else if (error instanceof MyInvoisNetworkError) {
 *     console.error("Network Error:", error.message, error.cause);
 *   } else if (error instanceof MyInvoisAuthenticationError) {
 *     console.error("Authentication Error:", error.message);
 *   } else if (error instanceof MyInvoisError) {
 *     console.error("MyInvois SDK Error:", error.message);
 *   } else {
 *     console.error("Unknown error:", error);
 *   }
 * }
 * ```
 */

/**
 * Base class for all custom errors thrown by the MyInvois SDK.
 */
export class MyInvoisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Set the prototype explicitly to allow instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown for errors related to client-side authentication logic,
 * such as failure to obtain a token after successful login response processing,
 * or issues preparing authentication headers.
 */
export class MyInvoisAuthenticationError extends MyInvoisError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when there's an issue with the network request itself
 * (e.g., `fetch` fails, DNS resolution error, server unreachable)
 * before a response is received from the API.
 */
export class MyInvoisNetworkError extends MyInvoisError {
  /** The original error that caused this network error, if available. */
  public cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Base class for errors that originate from an API response (HTTP 4xx or 5xx).
 * It holds common properties like the HTTP status code and the raw response body.
 */
export class MyInvoisBaseAPIError extends MyInvoisError {
  /** The HTTP status code returned by the API. */
  public httpStatusCode: number;
  /** The raw, parsed JSON response body from the API, if available. */
  public rawResponse?: any;

  constructor(message: string, httpStatusCode: number, rawResponse?: any) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.rawResponse = rawResponse;
  }
}

/**
 * Represents an error returned by the OAuth2 token endpoint (e.g., /connect/token).
 * These errors typically include fields like `error` and `error_description`.
 */
export class MyInvoisOAuthError extends MyInvoisBaseAPIError {
  /** The OAuth error code (e.g., "invalid_grant", "invalid_client"). */
  public oauthErrorCode?: string;
  /** A human-readable description of the OAuth error. */
  public errorDescription?: string;
  /** A URI identifying a human-readable web page with information about the error, if provided. */
  public errorUri?: string;

  constructor(
    message: string,
    httpStatusCode: number,
    oauthErrorCode?: string,
    errorDescription?: string,
    errorUri?: string,
    rawResponse?: any
  ) {
    super(message, httpStatusCode, rawResponse);
    this.oauthErrorCode = oauthErrorCode;
    this.errorDescription = errorDescription;
    this.errorUri = errorUri;
  }
}

/**
 * Represents a standard error returned by most MyInvois API endpoints
 * (e.g., for document submission, data retrieval).
 * These errors typically have a nested structure with fields like `errorCode`, `error` (message), `innerError`, etc.
 */
export class MyInvoisStandardAPIError extends MyInvoisBaseAPIError {
  /** An API-specific error code provided by MyInvois. */
  public apiErrorCode?: string; // Corresponds to 'errorCode' in the API response
  /** The English error message from the API. */
  public messageEN: string; // Corresponds to 'error' in the API response
  /** The Malay error message from the API, if available. */
  public messageMS?: string; // Corresponds to 'errorMS' in the API response
  /** The name of the property that caused the error, if applicable. */
  public propertyName?: string;
  /** The JSON path to the property that caused the error, if applicable. */
  public propertyPath?: string;
  /** The target or subject of the error, if applicable. */
  public target?: string;
  /** Detailed inner errors, often an array, providing more specific validation issues. */
  public innerError?: any; // Preserves the full structure of innerError

  constructor(
    httpStatusCode: number,
    apiResponse: {
      error: { // Assuming the structure is { error: { errorCode: ..., error: ..., ... } }
        errorCode?: string;
        error?: string; // English message
        errorMS?: string;
        propertyName?: string;
        propertyPath?: string;
        target?: string;
        innerError?: any;
        message?: string; // Fallback if 'error.error' is not present
      };
    }
  ) {
    // Use a primary message, fallback if necessary.
    const primaryErrorMessage = apiResponse?.error?.error || apiResponse?.error?.message || "An unknown API error occurred.";
    super(primaryErrorMessage, httpStatusCode, apiResponse);

    this.apiErrorCode = apiResponse?.error?.errorCode;
    this.messageEN = apiResponse?.error?.error || primaryErrorMessage; // Ensure messageEN is set
    this.messageMS = apiResponse?.error?.errorMS;
    this.propertyName = apiResponse?.error?.propertyName;
    this.propertyPath = apiResponse?.error?.propertyPath;
    this.target = apiResponse?.error?.target;
    this.innerError = apiResponse?.error?.innerError;
  }
}
