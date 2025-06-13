# Error Handling Analysis and Improvements in MyInvoisClient

This document outlines the analysis of the existing error handling mechanisms in `MyInvoisClient` and `AuthService`, and the implementation of custom error classes to provide more specific and actionable error information to the library users.

## 1. Previous Error Handling

*   **`AuthService`:**
    *   API errors during login (`/connect/token` calls) resulted in the raw JSON error response from the API being thrown.
    *   If parsing this JSON error response failed, a `SyntaxError` (or similar parsing error) would be thrown.
    *   Network-level errors during `fetch` (e.g., DNS failure, no connectivity) would also result in generic errors.
    *   Redis caching errors were logged but did not interrupt the authentication flow (which is generally acceptable).
*   **`MyInvoisClient`:**
    *   The private methods `_loginAsTaxpayerAndStoreToken` and `_performIntermediaryLoginAndStoreToken` would catch errors from `AuthService` and re-throw them. This meant consumers of the client often received raw API JSON errors or parsing errors.
    *   Public methods `getTaxpayerAccessToken` and `getIntermediaryAccessToken` had a fallback to throw a generic `Error` if `this.accessToken` was null after a login attempt, though this path was less likely if `AuthService` always threw on failure.
    *   `getCurrentAccessToken` would attempt re-login if the token was invalid. Errors during this re-login would propagate from the underlying login methods.

This approach made it difficult for library users to:
*   Programmatically distinguish between different types of errors (e.g., network issue vs. API validation error vs. authentication credential error).
*   Reliably access error details like HTTP status codes or API-specific error codes without manual parsing of potentially varied error structures.

## 2. Introduction of Custom Error Classes

To address these limitations, the following custom error classes were defined in `src/errors.ts`:

*   **`MyInvoisError`**: A base class for all custom errors originating from this library.
    ```typescript
    export class MyInvoisError extends Error {
      constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
      }
    }
    ```

*   **`MyInvoisAuthenticationError extends MyInvoisError`**: For errors specifically related to client authentication, such as invalid client ID/secret, issues with token generation not covered by API errors, or failure to secure a token.
    ```typescript
    export class MyInvoisAuthenticationError extends MyInvoisError {
      constructor(message: string) {
        super(message);
      }
    }
    ```

*   **`MyInvoisNetworkError extends MyInvoisError`**: For issues where the HTTP request to the MyInvois API failed at a network level (e.g., `fetch` itself throws an error due to DNS problems, server unreachable, CORS issues not originating from the API's 4xx/5xx response).
    ```typescript
    export class MyInvoisNetworkError extends MyInvoisError {
      public cause?: Error; // To store the original error if any

      constructor(message: string, cause?: Error) {
        super(message);
        if (cause) {
          this.cause = cause;
        }
      }
    }
    ```

*   **`MyInvoisAPIError extends MyInvoisError`**: For errors explicitly returned by the MyInvois API (typically HTTP 4xx or 5xx responses). This class includes properties for `statusCode`, an optional `errorCode` from the API's response body, and the full `errorDetails`.
    ```typescript
    export class MyInvoisAPIError extends MyInvoisError {
      public statusCode: number;
      public errorCode?: string; // API-specific error code, if available
      public errorDetails?: any; // To store the full error body from the API

      constructor(
        message: string,
        statusCode: number,
        errorCode?: string,
        errorDetails?: any
      ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.errorDetails = errorDetails;
      }
    }
    ```

## 3. Implementation of Custom Errors

### 3.1. `AuthService` (`src/auth/index.ts`)

The `loginAsTaxpayer` and `loginAsIntermediary` methods in `AuthService` were modified to throw these custom errors:

*   If `fetch` fails due to a network issue:
    ```typescript
    // Snippet from AuthService login method
    try {
      response = await fetch(...);
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Failed to connect to MyInvois API: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }
    ```

*   If the API returns a non-successful HTTP status code (e.g., 400, 401, 500):
    ```typescript
    // Snippet from AuthService login method, error handling block
    if (!response.ok) {
      let errorBody: any;
      let errorMessage = `MyInvois API Error: ${response.status} ${response.statusText}`;
      let apiErrorCode: string | undefined;

      try {
        errorBody = await response.json();
        errorMessage = errorBody?.error_description || errorBody?.error || errorBody?.message || errorMessage;
        apiErrorCode = errorBody?.error || errorBody?.code;
      } catch (parsingError) {
        errorBody = await response.text().catch(() => "Could not read error response body.");
      }
      throw new MyInvoisAPIError(
        errorMessage,
        response.status,
        apiErrorCode,
        errorBody
      );
    }
    ```

### 3.2. `MyInvoisClient` (`src/client.ts`)

*   **Error Propagation:** The `catch` blocks in `_loginAsTaxpayerAndStoreToken` and `_performIntermediaryLoginAndStoreToken` already re-throw errors from `AuthService`. They now seamlessly propagate the `MyInvoisAPIError` or `MyInvoisNetworkError`.
    ```typescript
    // Snippet from _loginAsTaxpayerAndStoreToken
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiryTime = null;
      this.currentOnBehalfOfTIN = null;
      throw error; // Propagates MyInvoisAPIError or MyInvoisNetworkError
    }
    ```

*   **Specific Authentication Errors:** The generic `Error` previously thrown in `getTaxpayerAccessToken` and `getIntermediaryAccessToken` (if `accessToken` was null after login attempt) has been replaced by `MyInvoisAuthenticationError`.
    ```typescript
    // Snippet from getTaxpayerAccessToken
    if (!this.accessToken) {
      throw new MyInvoisAuthenticationError(
        "MyInvoisClient: Unable to retrieve taxpayer access token after login attempt."
      );
    }
    ```

## 4. Analysis of `getCurrentAccessToken` Behavior

The `getCurrentAccessToken` method is called by services like `DocumentsService` and `TaxpayerService` to obtain a valid token. Its error handling has been clarified:

*   **Re-authentication:** If the current token is invalid or expired, `getCurrentAccessToken` attempts to re-authenticate (either as taxpayer or intermediary, based on previous context).
*   **Error Propagation during Re-authentication:** If this re-authentication attempt fails, the error from the underlying login methods (`getTaxpayerAccessToken` or `getIntermediaryAccessToken` – which in turn call `AuthService`) will propagate. These errors will be instances of `MyInvoisAPIError`, `MyInvoisNetworkError`, or `MyInvoisAuthenticationError`.
    ```typescript
    // Snippet from getCurrentAccessToken
    if (!this.isTokenValid()) {
      try {
        if (this.currentOnBehalfOfTIN) {
          await this.getIntermediaryAccessToken(this.currentOnBehalfOfTIN);
        } else {
          await this.getTaxpayerAccessToken();
        }
      } catch (error) {
        // If re-authentication fails, propagate the error.
        throw error;
      }
    }
    ```
*   **Final Safeguard:** If, after any re-authentication attempt, `this.accessToken` is still not available, `getCurrentAccessToken` will throw a `MyInvoisAuthenticationError`.
    ```typescript
    // Snippet from getCurrentAccessToken (end of method)
    if (!this.accessToken) {
      throw new MyInvoisAuthenticationError(
        "MyInvoisClient: No valid access token available even after re-authentication attempt."
      );
    }
    return this.accessToken;
    ```
This ensures that `getCurrentAccessToken` either returns a valid token string or throws a clearly defined custom error, preventing it from returning `null` in a scenario where a token was expected but could not be obtained.

It is generally recommended that services like `DocumentsService` ensure login (`client.auth.loginAs...`) *before* making calls that rely on `getCurrentAccessToken`. However, the re-authentication logic in `getCurrentAccessToken` provides a degree of resilience.

## 5. Rationale for Changes

*   **Improved Debuggability:** Custom errors with distinct types make it easier to identify the source and nature of a problem.
*   **Clearer Error Information for Library Users:** Consumers of the SDK can now use `instanceof` checks to handle different error scenarios programmatically (e.g., retry on network error, display specific message for API error, or flag authentication issues).
*   **Structured Error Data:** `MyInvoisAPIError` provides `statusCode`, `errorCode`, and `errorDetails`, allowing for more sophisticated error handling and reporting.
*   **Reduced Ambiguity:** Replacing generic `Error` instances with specific custom errors makes the library's behavior more predictable and easier to understand.

These changes lead to a more robust and developer-friendly error handling strategy for the MyInvois SDK.
