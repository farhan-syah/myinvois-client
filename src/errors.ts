// Base error class for all MyInvois client errors
export class MyInvoisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Set the prototype explicitly to allow instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// For errors related to client ID/secret, token generation, or unauthorized access.
export class MyInvoisAuthenticationError extends MyInvoisError {
  constructor(message: string) {
    super(message);
  }
}

// For issues like failed HTTP requests to the API (if distinguishable from API errors).
// This might be used if the fetch call itself fails (e.g., network down, DNS issue).
export class MyInvoisNetworkError extends MyInvoisError {
  public cause?: Error; // To store the original error if any

  constructor(message: string, cause?: Error) {
    super(message);
    if (cause) {
      this.cause = cause;
    }
  }
}

// For errors returned by the MyInvois API itself (e.g., validation errors, server-side issues from the API).
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
