# MyInvois SDK TODO List

This document consolidates findings and recommendations from various analysis steps to guide future development and improvements for the MyInvois SDK.

## Error Handling

*   **Utilize Custom Error Classes:**
    *   The new custom error classes are defined in `src/errors.ts`:
        *   `MyInvoisError` (base class)
        *   `MyInvoisAuthenticationError` (for client-side auth issues)
        *   `MyInvoisNetworkError` (for `fetch` level failures)
        *   `MyInvoisAPIError` (or more specific variants, see below) for errors from the MyInvois API.

*   **Important: Handling Inconsistent API Error Structures**
    *   The MyInvois API exhibits different JSON structures for errors depending on the context:
        *   **OAuth/Token Errors** (e.g., from `/connect/token` during login attempts): Typically include fields like `error` (an error code string like "invalid_request", "invalid_client", "invalid_grant") and `error_description` (a human-readable message).
        *   **General API Errors** (e.g., from document submissions, data retrieval): Typically include fields like `errorCode` (API-specific code), `error` (human-readable English message), `errorMS` (human-readable Malay message), `propertyName`, `propertyPath`, `target`, and potentially `innerError` (an array of detailed error objects for validation failures).
    *   **Robust Parsing Required:** The SDK's error parsing logic *must* be robust enough to differentiate between these formats and correctly extract all available details.
    *   **Implementation Approaches for Custom API Error Classes:**
        *   **Approach A: Separate Error Classes.** Define distinct error classes for different API error structures, e.g., `MyInvoisOAuthError` and `MyInvoisStandardAPIError`. These could inherit from a common base (e.g., a new `MyInvoisBaseAPIError` that holds the HTTP status code and raw response). Each specific class would then have properties tailored to its corresponding error structure (e.g., `MyInvoisOAuthError` would have `oauthErrorCode: string` and `errorDescription: string`, while `MyInvoisStandardAPIError` would have the detailed fields like `propertyName`, `apiErrorCode`, `errorMessageEN`, `errorMessageMS`, etc.).
        *   **Approach B: Flexible Single Error Class.** Use a single `MyInvoisAPIError` class but make its properties sufficiently flexible (e.g., many optional properties, or a generic `details: Record<string, any>`) to accommodate fields from various error structures. This would require sophisticated parsing logic within the error constructor to populate the correct fields based on the detected error type and clear JSDoc for users on how to interpret the error object.
    *   **Data Preservation is Key:** Regardless of the chosen approach (separate classes or a flexible single class), the fundamental goal is to preserve *all* information from the original API error response and make it accessible to the library user in a structured and typed manner. No information should be lost or obscured.

*   **Detailed API Error Handling (for General API Errors):**
    *   When a "General API Error" (as described above) occurs, the corresponding custom error class (e.g., `MyInvoisStandardAPIError` or the flexible `MyInvoisAPIError`) must capture and expose all relevant fields. Key fields to include are:
        *   The original HTTP status code.
        *   `error.propertyName`
        *   `error.propertyPath`
        *   `error.errorCode` (the API-specific code)
        *   `error.error` (English error message)
        *   `error.errorMS` (Malay error message)
        *   `error.target`
        *   `error.innerError` (preserving its full structure, typically an array of error objects).
    *   **Action:** Refactor service classes (`AuthService`, `MyInvoisClient`, `DocumentsService`, `TaxpayerService`) to consistently throw appropriate custom errors.
        *   `AuthService` (handling `/connect/token`): Its error handling should align with "OAuth/Token Errors", potentially throwing `MyInvoisOAuthError` or a flexibly populated `MyInvoisAPIError`. It has already been updated to use `MyInvoisAPIError`; this update should ensure it correctly maps OAuth error fields.
        *   `DocumentsService` and `TaxpayerService`: Their API call error handling needs to be updated to parse "General API Errors" and throw the corresponding custom error (e.g., `MyInvoisStandardAPIError` or a flexibly populated `MyInvoisAPIError`), ensuring all relevant fields are populated.
        *   Input validation errors (e.g., missing required params) in services should throw `MyInvoisError` or a more specific validation error type if introduced.

*   **Update JSDoc:**
    *   **Action:** Ensure all public methods that can throw these custom errors have updated JSDoc `@throws` tags (e.g., `@throws {MyInvoisOAuthError} If an OAuth authentication error occurs.`, `@throws {MyInvoisStandardAPIError} If the API returns a business logic or validation error.`).
*   **Refine `MyInvoisClient.getCurrentAccessToken`:**
    *   **Action:** Change the return type of `MyInvoisClient.getCurrentAccessToken` from `Promise<string | null>` to `Promise<string>`, as it now consistently throws an error (`MyInvoisAuthenticationError`) if a token cannot be obtained.

## UBL Builders (`src/ubl/helper/builder/invoice.ts`)

*   **Refactor `createUblJsonInvoiceDocument` for Modularity:**
    *   **Action:** Break down the `createUblJsonInvoiceDocument` function into smaller, private helper functions within the same file to improve readability and testability. Suggested helpers include:
        *   `_buildAccountingSupplierParty`
        *   `_buildAccountingCustomerParty`
        *   `_buildInvoiceLine` (for mapping `params.invoiceLines`)
        *   `_buildDocumentTaxTotal`
        *   `_buildLegalMonetaryTotal`
        *   `_buildDelivery`
*   **Modularize Signature Logic (UBL v1.1):**
    *   **Action:** Extract the complex UBL v1.1 signature generation and application logic into a dedicated private helper function, e.g., `_prepareSignatureData`. This function would handle:
        *   Creation of `tempInvoiceContentForSigning`.
        *   Construction of `documentToSign`.
        *   Calling `buildSignatureExtension`.
        *   Creating the `cac:Signature` block.
*   **Improve JSDoc for Defaults and Versioning:**
    *   **Action:** Enhance the JSDoc for `createUblJsonInvoiceDocument`:
        *   Clearly document key default values applied by the builder (e.g., `ItemClassificationCode.listID = "CLASS"`, `TaxScheme.ID = "UN/ECE 5153"` with `schemeAgencyID = "6"`).
        *   Explicitly state that UBL v1.1 features like `UBLExtensions` and `Signature` are only included when `version` is "1.1".
    *   **Action:** Review and potentially rephrase the inline comment `// UBLExtensions for signing should ONLY contain pre-existing extensions...` for better clarity regarding the enveloped signature process.

## Documentation

*   **Comprehensive JSDoc for Public APIs:**
    *   **Action:** Review and update JSDoc for all exported classes, methods, and functions. Ensure clarity for:
        *   Parameters (`@param`)
        *   Return values (`@returns`)
        *   Thrown errors (`@throws`), referencing the new custom error types.
*   **Add Usage Examples:**
    *   **Action:** Include `@example` tags in JSDoc for common service methods and client instantiation to guide users.
*   **Document Custom Error Classes:**
    *   **Action:** Add detailed JSDoc to each custom error class in `src/errors.ts` (and any new ones like `MyInvoisOAuthError`), explaining its purpose, properties, and provide a module-level example of how to catch and handle these errors.
*   **Type Definition Comments:**
    *   **Action:** Improve property-level JSDoc comments for interfaces and type aliases in all `*.types.ts` files. This is especially important for optional properties (e.g., `foo?: string | null;`) to explain their meaning or the conditions under which they might be null or absent.

## Configuration (API Base URLs)

*   **Enhance `MyInvoisClient` Constructor for URL Flexibility:**
    *   **Action:** Implement a hybrid approach for API base URL configuration in the `MyInvoisClient` constructor:
        *   Retain the existing `environment: MyInvoisEnvironment` parameter (e.g., "PROD", "SANDBOX") for simplicity.
        *   Introduce an `options` object parameter to the constructor. This object would contain the `environment` and `redisClient` (as currently) and also add:
            *   `identityBaseUrlOverride?: string`
            *   `documentsBaseUrlOverride?: string`
        *   If override URLs are provided, they will take precedence; otherwise, URLs from the selected `environment` (via `ENV_URLS`) will be used.
    *   **Action:** Update JSDoc for the `MyInvoisClient` constructor to clearly explain the new options, overrides, and their interaction.

## Dependency Management

*   **Current Status:**
    *   `npm outdated` (used as a fallback during automated review) reported no outdated packages based on the current `package.json` constraints.
*   **Recommendations:**
    *   **Action:** Regularly review dependencies for security vulnerabilities, bug fixes, and new features.
    *   **Action:** Utilize `bun outdated` as the preferred and recommended command for checking outdated dependencies, given the project's use of `bun.lock` and `bun` scripts. Other tools like `npm-check-updates` or GitHub's Dependabot can also be valuable. `npm outdated` may be used if `bun` is unavailable, but `bun` tooling should be prioritized by project maintainers.
    *   **Action:** Exercise caution when updating, especially for major versions. Review changelogs and test thoroughly to avoid introducing breaking changes.

## General Code Quality & Maintenance

*   **Review and Refine Code Comments:**
    *   Periodically review comments throughout the codebase to ensure they remain relevant and add value.
    *   Remove stale, unnecessary, or placeholder comments. This includes comments like "adopted from..." or "based on..." if they no longer provide useful context, as well as temporary development notes that have been addressed or are no longer needed.
    *   Ensure that comments which are genuine `TODO` items, explain complex or non-obvious logic, or document important decisions are retained and are clear and concise.
    *   The overall aim is to maintain a clean and understandable codebase where comments serve a clear purpose in aiding maintainability.

This TODO list should serve as a roadmap for ongoing improvements to the SDK.
