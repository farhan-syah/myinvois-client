import { MyInvoisRedisClient, RedisTokenData } from "../types";
import {
  MyInvoisLoginRequest,
  MyInvoisLoginResponse,
  MyInvoisErrorResponse,
} from "./types";

export class AuthService {
  private baseUrl: string;
  private redisClient?: MyInvoisRedisClient; // Optional Redis client
  private readonly REDIS_KEY_PREFIX = "myinvois:token:";
  // Refresh token a bit before it strictly expires to avoid race conditions or clock skew issues
  private readonly TOKEN_EXPIRY_BUFFER_SECONDS = 60;

  constructor(baseUrl: string, redisClient?: MyInvoisRedisClient) {
    this.baseUrl = baseUrl;
    this.redisClient = redisClient;
  }

  private generateRedisKey(clientId: string, onBehalfOfTIN?: string): string {
    let key = `${this.REDIS_KEY_PREFIX}clientId:${clientId}`;
    if (onBehalfOfTIN) {
      // Normalize TIN if it can have variations, e.g., tolowercase, remove special chars if not significant
      key += `:tin:${onBehalfOfTIN}`;
    } else {
      key += ":type:taxpayer";
    }
    return key;
  }

  private async getCachedToken(
    key: string
  ): Promise<MyInvoisLoginResponse | null> {
    if (!this.redisClient) {
      return null;
    }

    try {
      const cachedDataString = await this.redisClient.get(key);
      if (!cachedDataString) {
        // console.debug(`AuthService: Cache miss for key ${key}`);
        return null;
      }

      const tokenData: RedisTokenData = JSON.parse(cachedDataString);

      // Calculate remaining validity
      const currentTimeSeconds = Math.floor(Date.now() / 1000);
      const tokenFetchedAtSeconds = Math.floor(tokenData.fetchedAt / 1000);
      const elapsedSeconds = currentTimeSeconds - tokenFetchedAtSeconds;
      const remainingExpiresIn = tokenData.originalExpiresIn - elapsedSeconds;

      if (remainingExpiresIn > this.TOKEN_EXPIRY_BUFFER_SECONDS) {
        // console.debug(`AuthService: Serving token from Redis for key ${key}. Remaining effective: ${remainingExpiresIn}s`);
        return {
          access_token: tokenData.accessToken,
          expires_in: remainingExpiresIn, // Return the *remaining* lifespan
          token_type: "Bearer", // Assuming Bearer, or get this from API if it varies and cache it too
          scope: "", // Assuming default/any scope, or get this from API if it varies and cache it too
        };
      }
      // console.debug(`AuthService: Token in Redis for key ${key} expired or nearing expiry (remaining: ${remainingExpiresIn}s).`);
    } catch (error) {
      console.error(
        `AuthService: Error getting/parsing token from Redis for key ${key}. Error: ${error instanceof Error ? error.message : String(error)}`
      );
      // Optional: delete the invalid cache entry: await this.redisClient.del(key);
    }
    return null;
  }

  private async storeTokenInCache(
    key: string,
    loginResponse: MyInvoisLoginResponse
  ): Promise<void> {
    if (
      !this.redisClient ||
      !loginResponse.access_token ||
      loginResponse.expires_in <= 0
    ) {
      return;
    }

    const tokenDataToCache: RedisTokenData = {
      accessToken: loginResponse.access_token,
      originalExpiresIn: loginResponse.expires_in, // Store the original full duration from the API response
      fetchedAt: Date.now(), // Timestamp (ms) of when we got this token from the API
    };

    // Set Redis TTL to be the token's original expiry minus a buffer,
    // ensuring it's not less than a minimal sensible TTL.
    let redisTTL = loginResponse.expires_in - this.TOKEN_EXPIRY_BUFFER_SECONDS;
    if (redisTTL <= 0) {
      // If buffer makes TTL non-positive, cache for a very short "just fetched" period, or don't cache.
      // Caching for original_expires_in is also an option if buffer is an issue.
      // For now, if buffer makes it non-positive, use a minimal positive TTL or original.
      redisTTL = Math.max(10, loginResponse.expires_in); // Cache for at least 10s or its full original duration
    }

    try {
      await this.redisClient.set(key, JSON.stringify(tokenDataToCache), {
        EX: redisTTL,
      });
      // console.debug(`AuthService: Token stored/updated in Redis for key ${key} with TTL ${redisTTL}s`);
    } catch (error) {
      console.error(
        `AuthService: Error storing token in Redis for key ${key}. Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async loginAsTaxpayer(
    clientId: string,
    clientSecret: string,
    scope?: string
  ): Promise<MyInvoisLoginResponse> {
    const redisKey = this.generateRedisKey(clientId);
    if (this.redisClient) {
      // Only try cache if redisClient is configured
      const cachedResponse = await this.getCachedToken(redisKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // If not in cache or Redis not used, proceed with API call
    const requestBody: MyInvoisLoginRequest = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials", // Correct grant_type for taxpayer
      scope: scope ?? "InvoicingAPI",
    };

    try {
      // console.debug(`AuthService: loginAsTaxpayer - Performing API call for clientId: ${clientId}`);
      const response = await fetch(`${this.baseUrl}/connect/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(
          Object.fromEntries(
            Object.entries(requestBody).filter(([_, v]) => v !== undefined)
          ) as Record<string, string>
        ).toString(),
      });

      if (!response.ok) {
        // Existing error handling logic...
        let errorData: MyInvoisErrorResponse;
        try {
          errorData = await response.json();
        } catch (e) {
          // console.error(e);
          throw e;
        }
        throw new Error(
          `API Error: ${errorData.error ?? errorData.statusCode ?? ""} - ${errorData.error_description ?? errorData.message ?? response.statusText ?? "Unknown error"}`
        );
      }
      const responseData: MyInvoisLoginResponse = await response.json();
      // console.debug(`AuthService: loginAsTaxpayer - API call successful for clientId: ${clientId}`);

      if (this.redisClient) {
        // Store in cache if redisClient is configured
        await this.storeTokenInCache(redisKey, responseData);
      }
      return responseData;
    } catch (error) {
      // console.error(`AuthService: loginAsTaxpayer error for clientId ${clientId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async loginAsIntermediary(
    clientId: string,
    clientSecret: string,
    onBehalfOfTIN: string,
    scope?: string
  ): Promise<MyInvoisLoginResponse> {
    const redisKey = this.generateRedisKey(clientId, onBehalfOfTIN);
    if (this.redisClient) {
      // Only try cache if redisClient is configured
      const cachedResponse = await this.getCachedToken(redisKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // If not in cache or Redis not used, proceed with API call
    // Your existing logic uses grant_type: "client_credentials" and an "onbehalfof" header.
    const requestBody: MyInvoisLoginRequest = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials", // As per your original code
      scope: scope ?? "InvoicingAPI",
    };

    try {
      // console.debug(`AuthService: loginAsIntermediary - Performing API call for clientId: ${clientId}, TIN: ${onBehalfOfTIN}`);
      const response = await fetch(`${this.baseUrl}/connect/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          onbehalfof: onBehalfOfTIN, // Header for intermediary
        },
        body: new URLSearchParams(
          Object.fromEntries(
            Object.entries(requestBody).filter(([_, v]) => v !== undefined)
          ) as Record<string, string>
        ).toString(),
      });

      if (!response.ok) {
        // Existing error handling logic...
        let errorData: MyInvoisErrorResponse;
        try {
          errorData = await response.json();
        } catch (e) {
          throw e;
        }
        throw new Error(
          `API Error: ${errorData.error ?? errorData.statusCode ?? ""} - ${errorData.error_description ?? errorData.message ?? response.statusText ?? "Unknown error"}`
        );
      }
      const responseData: MyInvoisLoginResponse = await response.json();
      // console.debug(`AuthService: loginAsIntermediary - API call successful for clientId: ${clientId}, TIN: ${onBehalfOfTIN}`);

      if (this.redisClient) {
        // Store in cache if redisClient is configured
        await this.storeTokenInCache(redisKey, responseData);
      }
      return responseData;
    } catch (error) {
      // console.error(`AuthService: loginAsIntermediary error for clientId ${clientId}, TIN ${onBehalfOfTIN}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
