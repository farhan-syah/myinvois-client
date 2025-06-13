# Configuration and Constants Management Review

This document reviews how configuration, particularly API base URLs and other key constants, are managed within the MyInvois SDK.

## 1. Current Handling of Configuration and Constants

*   **API Base URLs:**
    *   The primary configuration point is the `MyInvoisEnvironment` type, which accepts `"PROD"` or `"SANDBOX"`.
    *   These environments are mapped to specific Identity and Documents API base URLs in a constant object `ENV_URLS` within `src/client.ts`:
        ```typescript
        const ENV_URLS = {
          PROD: {
            identity: "https://api.myinvois.hasil.gov.my",
            documents: "https://api.myinvois.hasil.gov.my",
          },
          SANDBOX: {
            identity: "https://preprod-api.myinvois.hasil.gov.my",
            documents: "https://preprod-api.myinvois.hasil.gov.my",
          },
        };
        ```
    *   The `MyInvoisClient` constructor accepts an `environment: MyInvoisEnvironment` parameter (defaulting to `"PROD"`) and uses it to select the appropriate URLs from `ENV_URLS`.
    *   There is currently no mechanism to provide custom base URLs directly.

*   **Other Constants:**
    *   **Default Scope:** The `AuthService` uses a default scope of `"InvoicingAPI"`. This is hardcoded but generally tied to the API's expected behavior.
    *   **API Version Path Segments:** Path segments like `/api/v1.0/` are appended in service methods (e.g., `DocumentsService`) rather than being part of the base URLs in `ENV_URLS`. This is a common and reasonable practice.
    *   **Token Expiry Buffer:** `AuthService` uses a `TOKEN_EXPIRY_BUFFER_SECONDS = 60;`. This is an internal operational constant, not a user-facing configuration.

## 2. Flexibility of API Base URLs

*   **Current Approach:**
    *   The current fixed enum (`"PROD"`, `"SANDBOX"`) is simple and covers the primary use cases of connecting to the official LHDN environments.
*   **Limitations:**
    *   **New Official Environments:** If LHDN introduces new environments (e.g., UAT, DR, specific test instances), users cannot target them without a library update.
    *   **Proxies/Gateways:** Users in enterprise settings often need to route API traffic through their own proxy servers or API gateways, which may expose the MyInvois API under a different base URL. This is not currently supported.
    *   **Local Testing/Mocks:** Developers cannot easily point the SDK to a local mock server for testing or development purposes.

## 3. Trade-offs of Configuration Approaches

### Current Approach (Fixed Environments via Enum)

*   **Pros:**
    *   **Simplicity:** Very easy for the majority of users to configure.
    *   **Reduced Misconfiguration:** Guarantees the use of correct, LHDN-provided URLs for known environments.
    *   **Clear Intent:** The `environment` parameter clearly signals the target system.
*   **Cons:**
    *   **Inflexibility:** Cannot adapt to new or custom URLs without library modification.
    *   **No Support for Proxies/Gateways:** Restricts usage in some enterprise network architectures.
    *   **Limited Local Testing:** Makes it difficult to test against mock APIs.

### Alternative (Allowing Custom URL Overrides)

*   **Pros:**
    *   **Maximum Flexibility:** Enables users to specify any base URL, supporting proxies, gateways, unlisted LHDN environments, and local mock servers.
    *   **Future-Proofing:** Can adapt to new LHDN URL structures more readily (though new API *functionality* would still require SDK updates).
*   **Cons:**
    *   **Increased Risk of User Error:** Users might provide incorrect or malformed URLs. The library has limited means to validate arbitrary custom URLs.
    *   **Slightly More Complex Configuration:** The constructor would need to accommodate additional optional parameters for URL overrides.
    *   **Support Considerations:** Debugging issues related to custom URL configurations could be more complex.

## 4. Recommendation

It is recommended to **adopt a hybrid approach** that retains the simplicity of the `MyInvoisEnvironment` enum for common use cases while providing optional overrides for advanced scenarios.

This can be achieved by modifying the `MyInvoisClient` constructor:

*   Keep the existing `environment: MyInvoisEnvironment` parameter.
*   Add optional `identityBaseUrlOverride?: string` and `documentsBaseUrlOverride?: string` parameters.

**Proposed Constructor Signature:**

```typescript
export interface MyInvoisClientOptions {
  environment?: MyInvoisEnvironment;
  identityBaseUrlOverride?: string;
  documentsBaseUrlOverride?: string;
  redisClient?: MyInvoisRedisClient;
}

export class MyInvoisClient {
  constructor(
    clientId: string,
    clientSecret: string,
    options: MyInvoisClientOptions = {} // Make options an object
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    const {
      environment = "PROD", // Default environment
      identityBaseUrlOverride,
      documentsBaseUrlOverride,
      redisClient,
    } = options;

    const effectiveIdentityBaseUrl = identityBaseUrlOverride ?? ENV_URLS[environment].identity;
    const effectiveDocumentsBaseUrl = documentsBaseUrlOverride ?? ENV_URLS[environment].documents;

    this.authServiceInstance = new AuthService(effectiveIdentityBaseUrl, redisClient);
    this.documents = new DocumentsService(this, effectiveDocumentsBaseUrl);
    this.taxpayer = new TaxpayerService(this, effectiveDocumentsBaseUrl);
    // ... rest of the constructor
  }
  // ...
}
```

**Rationale for Hybrid Approach:**

*   **Preserves Simplicity:** Most users can continue to use the simple `environment` option.
*   **Enables Advanced Use Cases:** Users needing to connect via proxies, to new/unlisted LHDN URLs, or to mock servers can use the override parameters.
*   **Clear Prioritization:** The override parameters, when provided, take precedence over the `environment` setting for URL selection.
*   **Minimal Disruption:** This is a non-breaking change if `options` defaults to an empty object and `environment` within `options` defaults to "PROD". Existing instantiations like `new MyInvoisClient(id, secret, "SANDBOX")` would need to change to `new MyInvoisClient(id, secret, { environment: "SANDBOX" })`. A constructor overload could also manage this for smoother transition.

**Implementation Notes:**

*   The JSDoc for the constructor must clearly explain the new `options` parameter, the overrides, and how they interact with the `environment` setting.
*   It should be noted that when using overrides, the user is responsible for ensuring the provided URLs are correct and point to compatible API versions.

This approach balances ease of use for the common scenarios with the flexibility required for more advanced integration patterns.
