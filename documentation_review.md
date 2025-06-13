# Documentation Review Findings

This document outlines findings from a review of JSDoc comments and inline documentation across key modules of the MyInvois SDK.

## General Observations

*   Many parts of the library, especially the UBL builders, have good initial JSDoc coverage.
*   The introduction of custom errors requires updating `@throws` tags across services.
*   Type definitions (`*.types.ts`) are generally clear but could benefit from more consistent property-level comments.
*   Service methods performing API calls need to consistently document that they can throw `MyInvoisAPIError`, `MyInvoisNetworkError`, and `MyInvoisAuthenticationError`.

## File-Specific Findings

### 1. `src/client.ts` (MyInvoisClient)

*   **`MyInvoisClient` Class:**
    *   JSDoc: Good. Could add a small section on typical usage or instantiation.
    *   `@example` for constructor could be beneficial.
*   **Constructor:**
    *   `@param environment`: Explain "PROD" vs "SANDBOX" effect (which URLs are chosen).
    *   `@param redisClient`: Explain its role in token caching.
*   **`auth` object methods (`loginAsTaxpayer`, `loginAsIntermediary`):**
    *   These are wrappers. The JSDoc for `MyInvoisClient.auth` itself should explain what these convenience methods do.
    *   Example for `MyInvoisClient.auth`:
        ```typescript
        /**
         * Provides direct access to authentication methods.
         * These methods handle token acquisition and storage internally.
         * @throws {MyInvoisAuthenticationError} If login fails or token cannot be retrieved.
         * @throws {MyInvoisAPIError} If the MyInvois API returns an error during authentication.
         * @throws {MyInvoisNetworkError} If a network error occurs while trying to authenticate.
         */
        public auth: { ... };
        ```
*   **`getTaxpayerAccessToken`, `getIntermediaryAccessToken` methods:**
    *   JSDoc: Add `@throws MyInvoisAuthenticationError` (already implemented).
    *   JSDoc: Add `@throws MyInvoisAPIError`, `@throws MyInvoisNetworkError` (as they call `_login...` methods which call `AuthService`).
*   **`getCurrentAccessToken` method:**
    *   JSDoc: Good explanation of its role and re-authentication logic.
    *   Inline comments like `// This case should ideally be prevented by DocumentService ensuring login first.` are good.
    *   Update JSDoc:
        ```typescript
        /**
         * Retrieves the current valid access token.
         * If the token is invalid or expired, it attempts to re-authenticate based on the last login type
         * (taxpayer or intermediary).
         * It's generally recommended that services ensure explicit login via `client.auth.loginAs...`
         * before relying heavily on automatic re-authentication by this method.
         *
         * @returns A Promise that resolves to the access token string.
         * @throws {MyInvoisAuthenticationError} If no valid token can be obtained, even after re-authentication attempts.
         * @throws {MyInvoisAPIError} If the MyInvois API returns an error during re-authentication.
         * @throws {MyInvoisNetworkError} If a network error occurs during re-authentication.
         */
        public async getCurrentAccessToken(): Promise<string | null> { // Note: current code throws if null, so Promise<string> might be more accurate. Reviewing the last change, it does throw if null. So Promise<string>.
          // ...
        }
        ```
    *   The previous version of `getCurrentAccessToken` returned `Promise<string | null>`. The new version (after error handling changes) seems to always throw if it can't get a token. The return type should be `Promise<string>`. This is a code change suggestion based on documentation review.

### 2. `src/auth/index.ts` (AuthService)

*   **`AuthService` Class:**
    *   JSDoc: Good.
*   **Constructor:**
    *   `@param baseUrl`: Clarify this is the identity base URL.
    *   `@param redisClient`: Good explanation of optionality.
*   **`loginAsTaxpayer`, `loginAsIntermediary` methods:**
    *   JSDoc:
        *   `@param clientId`, `@param clientSecret`: Clear.
        *   `@param scope`: Explain typical values or link to API docs for scopes if available. Default "InvoicingAPI" is mentioned in code.
        *   `@returns`: Clear.
        *   `@throws MyInvoisAPIError` - Add details: "if the API returns an error (e.g., invalid credentials, invalid request)."
        *   `@throws MyInvoisNetworkError` - Add details: "if a network connection issue occurs."
    *   Example `@throws` for `loginAsTaxpayer`:
        ```typescript
        /**
         * Logs in as a taxpayer to obtain an access token.
         * Uses Redis for caching if a Redis client is provided.
         * @param clientId The client ID obtained from MyInvois.
         * @param clientSecret The client secret obtained from MyInvois.
         * @param scope Optional scope for the access token. Defaults to "InvoicingAPI".
         * @returns A promise that resolves with the login response containing the access token.
         * @throws {MyInvoisAPIError} If the MyInvois API returns an error (e.g., 400, 401, 500).
         * @throws {MyInvoisNetworkError} If a network error occurs while communicating with the API.
         */
        ```
*   **Private methods (`generateRedisKey`, `getCachedToken`, `storeTokenInCache`):**
    *   Inline comments: Generally good.
    *   `getCachedToken`: The `console.error` for Redis errors is good for server-side debugging but these errors are not propagated. This is acceptable as cache failure should lead to a fresh API call.
    *   `storeTokenInCache`: Logic for `redisTTL` calculation has inline comments, which is good.

### 3. `src/documents/index.ts` (DocumentsService) & `src/taxpayer/index.ts` (TaxpayerService)

*   **General for all public methods:**
    *   **Error Handling Blocks:** The current pattern is:
        ```typescript
        // } else {
        //   try {
        //     const errorBody = await response.json();
        //     throw errorBody; // THIS IS THE PROBLEM
        //   } catch (parsingError) {
        //     throw parsingError;
        //   }
        // }
        ```
        This needs to be changed to throw `MyInvoisAPIError`, similar to `AuthService`.
        Example replacement:
        ```typescript
        // } else {
        //   let errorBody: any;
        //   let errorMessage = `MyInvois API Error: ${response.status} ${response.statusText}`;
        //   let apiErrorCode: string | undefined;
        //   try {
        //     errorBody = await response.json();
        //     errorMessage = errorBody?.error?.message || errorBody?.message || errorMessage; // Adjust based on actual error structure
        //     apiErrorCode = errorBody?.error?.code || errorBody?.code;
        //   } catch (parsingError) {
        //     errorBody = await response.text().catch(() => "Could not read error response body.");
        //   }
        //   throw new MyInvoisAPIError(errorMessage, response.status, apiErrorCode, errorBody);
        // }
        ```
        This change is crucial and should be applied to all methods in `DocumentsService` and `TaxpayerService` that make API calls.
    *   **JSDoc `@throws`:** All public methods making API calls must be updated to include:
        *   `@throws {MyInvoisAuthenticationError}` (if token acquisition via `this.apiClient.get...AccessToken()` fails)
        *   `@throws {MyInvoisAPIError}` (if the specific API endpoint returns an error)
        *   `@throws {MyInvoisNetworkError}` (if `fetch` itself fails or underlying token acquisition fails due to network issues)
    *   **JSDoc `@example`:** Add examples for common use cases.
*   **`DocumentsService.searchDocuments` & `TaxpayerService.searchTaxpayerTIN`:**
    *   The input validation `throw new Error(...)` should be changed to `throw new MyInvoisError(...)` or a more specific custom error if deemed necessary (e.g., `MyInvoisValidationError`). For now, `MyInvoisError` is fine.
*   **`DocumentsService.getDocumentByUuid`:**
    *   `@param preferredFormat`: Explain that default is JSON.
    *   Headers logic for `Accept` is good.

### 4. UBL Helpers (`src/ubl/helper/builder/`)

*   **`common.ts`:**
    *   Functions like `toUblText`, `toUblCurrencyAmount`, etc., are marked `@internal`. Their JSDoc is concise and clear for internal use.
    *   `buildCustomerParty`, `buildSupplier`, `buildPostalAddressFromAddressParam`, etc.: Also `@internal`. JSDoc explains parameters and return types well.
*   **`invoice.ts` (`createUblJsonInvoiceDocument`):**
    *   JSDoc: Already improved in the previous task's analysis.
    *   **Defaults:**
        *   `TaxScheme: [{ ID: [{ _: "UN/ECE 5153", schemeAgencyID: "6" }] }]`: Explicitly mention this common default in the main JSDoc.
        *   `ItemClassificationCode.listID ?? "CLASS"`: Mention this default too.
    *   **Versioning:** JSDoc should explicitly state that `UBLExtensions` and `Signature` are *only* for v1.1.
        ```typescript
        /**
         * ...
         * - Differentiating between Invoice v1.0 and v1.1 structures (e.g., `UBLExtensions` and `Signature` elements are only included for v1.1).
         * ...
         * Key Default Values Applied:
         * - TaxScheme ID: "UN/ECE 5153", schemeAgencyID: "6" (for tax categories)
         * - ItemCommodityClassification listID: "CLASS" (if not provided)
         * ...
         * @param version Specifies the UBL e-Invoice version. "1.1" includes UBLExtensions and Signature (if params.signature provided). "1.0" omits these.
         * ...
         */
        ```
    *   Inline comment `// UBLExtensions for signing should ONLY contain pre-existing extensions,`: Revisit this based on the previous analysis (Task: "Analyze `src/ubl/helper/builder/invoice.ts`"). Suggestion was to rephrase for clarity about the enveloped signature process.
*   **`signatureExtension.ts` (`buildSignatureExtension`):**
    *   JSDoc: Good. `@example` is helpful.
    *   `@param referencedSignatureId`: Emphasize its importance: "This ID must match the `ID` of the `cac:Signature` block in the main UBL document."
    *   `@param documentTransformationKeys`: Explain its role in the XML canonicalization and signature process (which elements to exclude like the signature itself).
    *   `@throws`: If `generateDigitalSignatureJSON` can throw specific, catchable errors, document them. Otherwise, a general `@throws Error if cryptographic operations fail.`

### 5. Type Definitions (`*.types.ts`, `src/types.ts`)

*   **`src/auth/types.ts` (`MyInvoisErrorResponse`):**
    *   `error`: The union of string literals is good. Add a comment: `/** Standard OAuth2 error codes or MyInvois specific codes. */`
    *   `error_description`: `/** Human-readable explanation of the error. */`
    *   `error_uri`: `/** A URI identifying a human-readable web page with information about the error. */`
    *   `statusCode`, `message`: These seem like they might be from a different error structure or a parsed version. Clarify their origin if they are part of the raw API error. If they are added during parsing, comments should reflect that.
*   **`src/documents/types.ts`:**
    *   Many interfaces here (e.g., `RecentDocumentInfo`, `DocumentSummary`, `DocumentDetailsResponse`) have numerous optional properties (`string | null`, `number | null`). For each optional property, a brief comment explaining *why* it might be null or under what conditions it's present would be very helpful.
    *   Example for `RecentDocumentInfo.supplierTIN`: `/** Supplier's Tax Identification Number. May differ from issuerTin in certain scenarios (e.g., self-billed invoices). */`
    *   `RecentDocumentInfo.total`: Comment like `/** Total payable amount of the document. */`
    *   `GetRecentDocumentsResponse.metadata.totalCount`: `/** Total number of documents matching the query, across all pages. */`
    *   `GetRecentDocumentsResponse.result`: The array type is anonymous. It's fine, but for very complex repeating structures, sometimes a named type helps.
*   **`src/taxpayer/types.ts` (`GetTaxpayerInfoByQRCodeResponse`):**
    *   `idType`: `/** Type of identification number (e.g., "BRN", "NRIC"). Refer to TaxpayerIdType for expected values, though API returns string. */`
    *   `country`: `/** Country code. API might return non-standard codes (e.g., "TCA"). */`
    *   `generatedTimestamp`: `/** Timestamp when the QR code information was generated, in ISO 8601 format. */`
*   **`src/types.ts`:**
    *   `MyInvoisDetailedError`: Properties are mostly self-explanatory. Add a general comment: `/** Detailed error structure often returned by MyInvois APIs within error responses. */`
    *   `MyInvoisRedisClient`: Comments are good.
    *   `RedisTokenData`: Comments are good.

### 6. `src/errors.ts`

*   **General:** Add a module-level JSDoc comment explaining the purpose of custom errors and how they inherit from `MyInvoisError`.
    ```typescript
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
     *   if (error instanceof MyInvoisAPIError) {
     *     console.error("API Error:", error.message, error.statusCode, error.errorDetails);
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
    ```
*   **`MyInvoisError`:**
    *   JSDoc: `/** Base class for all custom errors thrown by the MyInvois SDK. */`
*   **`MyInvoisAuthenticationError`:**
    *   JSDoc: `/** Thrown for errors related to client authentication, token generation, or unauthorized access attempts prior to or during API calls. */`
*   **`MyInvoisNetworkError`:**
    *   JSDoc: `/** Thrown when there's an issue with the network request itself (e.g., fetch fails, DNS resolution error, server unreachable). */`
    *   `cause`: `/** The original error that caused this network error, if available. */`
*   **`MyInvoisAPIError`:**
    *   JSDoc: `/** Thrown when the MyInvois API returns an error response (typically HTTP status codes 4xx or 5xx). */`
    *   `statusCode`: `/** The HTTP status code returned by the API. */`
    *   `errorCode`: `/** An API-specific error code, if provided in the error response. */`
    *   `errorDetails`: `/** The full, parsed error body returned by the API, if available. Structure may vary. */`

## Summary of Key Actions Needed (Code Changes)

1.  **Update error handling in `DocumentsService` and `TaxpayerService`**: Replace `throw errorBody;` with `throw new MyInvoisAPIError(...)`.
2.  **Update `@throws` tags**: Consistently add/update `@throws` for `MyInvoisAPIError`, `MyInvoisNetworkError`, `MyInvoisAuthenticationError` in all public methods of services and `MyInvoisClient`.
3.  **Refine `MyInvoisClient.getCurrentAccessToken` return type**: Change from `Promise<string | null>` to `Promise<string>` as it now throws if a token cannot be obtained.
4.  **Input validation errors**: Change `throw new Error(...)` to `throw new MyInvoisError(...)` in `DocumentsService.searchDocuments` and `TaxpayerService.searchTaxpayerTIN`.

This review should provide a good basis for improving the inline documentation and JSDoc across the library.Okay, I have performed a thorough review of the comments and documentation in the specified files and have created the `documentation_review.md` file with detailed findings and suggestions.

This includes:
*   General observations on the state of documentation.
*   Specific suggestions for JSDoc improvements, `@param`, `@returns`, `@throws` tags for classes and methods in `src/client.ts`, `src/auth/index.ts`, `src/documents/index.ts`, and `src/taxpayer/index.ts`.
*   Recommendations for clarifying comments related to default values and versioning in UBL helpers (`src/ubl/helper/builder/`).
*   Suggestions for improving comments in type definition files (`*.types.ts`) to explain properties better.
*   Proposed JSDoc for the new custom error classes in `src/errors.ts`, including examples of how to catch them.
*   Highlighted necessary code changes, primarily standardizing API error throwing in `DocumentsService` and `TaxpayerService` to use `MyInvoisAPIError`, and updating `@throws` tags accordingly.
*   A note on changing the return type of `MyInvoisClient.getCurrentAccessToken` to `Promise<string>` as it no longer returns `null`.

All tasks for this sub-objective are complete. I can now submit the report.
