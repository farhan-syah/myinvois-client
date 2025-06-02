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

// Standard error response structure for MyInvois API calls
export interface MyInvoisDetailedError {
  propertyName: string | null;
  propertyPath: string | null;
  errorCode: string;
  error: string; // Human readable error message in English
  errorMS: string; // Human readable error message in Malay
  target?: string | null; // Optional: the target/subject of the error
  details?: MyInvoisDetailedError[] | null; // Optional: list of multiple errors
  message?: string;
}

export interface MyInvoisGenericApiResponseError {
  status?: string; // Optional, e.g., "Invalid"
  error: MyInvoisDetailedError;
  name?: string; // Optional, e.g., "Step03-Duplicated Submission Validator"
}

export interface MyInvoisRedisClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    commandOptions?: { EX: number } /* TTL in seconds */,
  ): Promise<unknown>; // Return type can vary
}

// Structure of the data to be stored in Redis
export interface RedisTokenData {
  accessToken: string;
  originalExpiresIn: number; // The 'expires_in' value from the auth server (seconds)
  fetchedAt: number; // Timestamp (ms) when the token was fetched via API
}

// Standard LoginResponse your AuthService currently deals with
export interface LoginResponse {
  access_token: string;
  expires_in: number; // in seconds
}
