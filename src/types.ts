export interface Einvoice {
  id: string;
  name: string;
  items: EinvoiceItem[];
  total: number;
  status: EinvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EinvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export enum EinvoiceStatus {
  Pending = "pending",
  Paid = "paid",
  Overdue = "overdue",
}

/**
 * Represents a detailed error object, often part of a larger error response from the MyInvois API.
 * It can be nested in the `details` property or appear as the `error` property in `MyInvoisGenericApiResponseError`.
 */
export interface MyInvoisDetailedError {
  /** The name of the property that caused the error, if applicable. Nullable. */
  propertyName: string | null;
  /** The JSON path to the property that caused the error, if applicable. Nullable. */
  propertyPath: string | null;
  /** API-specific error code. */
  errorCode: string;
  /** Human-readable error message in English. This is often the primary message. */
  error: string;
  /** Human-readable error message in Malay. */
  errorMS: string;
  /** Optional: the target or subject of the error. Nullable. */
  target?: string | null;
  /** Optional: list of multiple nested detailed errors. Nullable. */
  details?: MyInvoisDetailedError[] | null;
  /**
   * Fallback or alternative message field. Note: The `error` field is typically the primary human-readable message.
   * This field might be redundant or used in specific contexts.
   */
  message?: string;
}

/**
 * Represents a common wrapper structure for some API error responses,
 * often containing a nested {@link MyInvoisDetailedError}.
 */
export interface MyInvoisGenericApiResponseError {
  /** Optional overall status, e.g., "Invalid". */
  status?: string;
  /** The detailed error object. */
  error: MyInvoisDetailedError;
  /** Optional name of the component that reported the error, e.g., a specific validator. */
  name?: string;
}

/**
 * Interface for a Redis client compatible with the SDK's token caching.
 * Supports basic get/set operations with TTL.
 * Compatible with ioredis and node-redis (v4+).
 */
export interface MyInvoisRedisClient {
  /**
   * Retrieves a value from Redis by key.
   * @param key The key to retrieve.
   * @returns A promise that resolves to the string value or null if the key does not exist.
   */
  get(key: string): Promise<string | null>;
  /**
   * Sets a value in Redis with an optional Time To Live (TTL).
   * @param key The key to set.
   * @param value The value to store.
   * @param commandOptions Optional command options.
   * @param commandOptions.EX Optional TTL in seconds.
   * @returns A promise that resolves when the operation is complete. Return type can vary by Redis client library.
   */
  set(
    key: string,
    value: string,
    commandOptions?: { EX: number }
  ): Promise<unknown>;
}

/**
 * Structure of the data to be stored in Redis for caching access tokens.
 */
export interface RedisTokenData {
  /** The access token string. */
  accessToken: string;
  /** The original 'expires_in' value (lifetime in seconds) from the authentication server. */
  originalExpiresIn: number;
  /** Timestamp (in milliseconds) when the token was fetched from the API. */
  fetchedAt: number;
}

/**
 * Represents the basic structure of a successful response from an OAuth2 token endpoint.
 * Note: For MyInvois specific requests/responses, refer to `MyInvoisLoginRequest` and `MyInvoisLoginResponse` in `src/auth/types.ts`.
 */
export interface LoginResponse {
  /** The JWT access token. */
  access_token: string;
  /** The lifetime of the access token in seconds. */
  expires_in: number;
}

/**
 * Options for configuring the MyInvoisClient instance.
 */
export interface MyInvoisClientOptions {
  /**
   * Specifies the MyInvois API environment.
   * Valid values are "PROD" or "SANDBOX".
   * Defaults to 'PROD' if not provided.
   */
  environment?: "PROD" | "SANDBOX"; // This should ideally use the MyInvoisEnvironment type from client.ts
  /**
   * Optional. An instance of a Redis client (compatible with `ioredis` or `node-redis` v4+)
   * for caching access tokens. If provided, the SDK will attempt to cache tokens
   * to reduce redundant login calls.
   */
  redisClient?: MyInvoisRedisClient;
  /**
   * Optional. Allows overriding the base URL for identity and authentication-related API calls.
   * If provided, this URL will be used instead of the default URL for the selected `environment`.
   * Useful for proxies or custom LHDN-provided endpoints. E.g., "https://my-proxy.com/identity".
   */
  identityBaseUrlOverride?: string;
  /**
   * Optional. Allows overriding the base URL for document and taxpayer-related API calls.
   * If provided, this URL will be used instead of the default URL for the selected `environment`.
   * Useful for proxies or custom LHDN-provided endpoints. E.g., "https://my-proxy.com/documents".
   */
  documentsBaseUrlOverride?: string;
}
