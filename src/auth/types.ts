export interface MyInvoisLoginRequest {
  client_id: string;
  client_secret: string;
  grant_type: "client_credentials";
  scope?: string;
}

export interface MyInvoisLoginResponse {
  access_token: string; // JWT token
  token_type: "Bearer";
  expires_in: number; // Lifetime in seconds
  scope?: string;
}

export interface MyInvoisErrorResponse {
  error?:
    | "invalid_request"
    | "invalid_client"
    | "invalid_grant"
    | "unauthorised_client"
    | "unsupported_grant_type"
    | "invalid_scope";
  error_description?: string;
  error_uri?: string; // URI
  statusCode?: number;
  message?: string;
}
