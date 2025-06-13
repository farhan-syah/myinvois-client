import { MyInvoisClient } from "../client";
import { MyInvoisNetworkError, MyInvoisStandardAPIError, MyInvoisError } from "../errors";
import {
  CancelDocumentRequest,
  CancelDocumentResponse,
  DocumentDetailsResponse,
  DocumentType,
  DocumentTypeVersion,
  GetDocumentResponse,
  GetRecentDocumentsRequestParams,
  GetRecentDocumentsResponse,
  GetSubmissionDetailsRequestParams,
  GetSubmissionDetailsResponse,
  RejectDocumentRequest,
  RejectDocumentResponse,
  SearchDocumentsRequestParams, // Added for new API
  SearchDocumentsResponse,
  SubmitDocumentsRequest,
  SubmitDocumentsResponse,
} from "./types";

export class DocumentsService {
  private apiClient: MyInvoisClient;
  private baseUrl: string;

  constructor(apiClient: MyInvoisClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves a list of all document types from the MyInvois System.
   * @returns A promise that resolves with the list of document types.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    const accessToken =
      await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/v1.0/documenttypes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getAllDocumentTypes: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: DocumentType[] = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}` // 'error' property often holds the main message
          }
        });
      }
      // Ensure errorBody is wrapped in { error: ... } if it's not already
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Retrieves the details of a single document type by its unique ID.
   * @param id The unique ID of the document type.
   * @returns A promise that resolves with the document type details.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getDocumentTypeById(id: number): Promise<DocumentType> {
    const accessToken =
      await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}/api/v1.0/documenttypes/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getDocumentTypeById: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: DocumentType = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Retrieves the details of a specific document type version.
   * @param documentTypeId The unique ID of the document type.
   * @param versionId The unique ID of the document type version.
   * @returns A promise that resolves with the document type version details.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getDocumentTypeVersionById(
    documentTypeId: number,
    versionId: number
  ): Promise<DocumentTypeVersion> {
    const accessToken =
      await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}/api/v1.0/documenttypes/${documentTypeId}/versions/${versionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getDocumentTypeVersionById: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: DocumentTypeVersion = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Submits one or more documents to the MyInvois System.
   * @param submissionRequest The request payload containing the documents to submit.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the submission response (HTTP 202 Accepted).
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async submitDocuments(
    submissionRequest: SubmitDocumentsRequest,
    onBehalfOfTIN?: string
  ): Promise<SubmitDocumentsResponse> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(onBehalfOfTIN)
      : await this.apiClient.getTaxpayerAccessToken();

    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}/api/v1.0/documentsubmissions/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionRequest),
        }
      );
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in submitDocuments: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.status === 202) { // HTTP 202 Accepted
      const responseData: SubmitDocumentsResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
         error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Cancels a previously issued document.
   * @param uuid The unique ID of the document to cancel.
   * @param reason The reason for cancelling the document (max 300 characters).
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the cancellation confirmation.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async cancelDocument(
    uuid: string,
    reason: string,
    onBehalfOfTIN?: string
  ): Promise<CancelDocumentResponse> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const requestBody: CancelDocumentRequest = {
      status: "cancelled",
      reason: reason,
    };

    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}/api/v1.0/documents/state/${uuid}/state`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in cancelDocument: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: CancelDocumentResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Rejects a previously issued document. This action is performed by the recipient (Buyer).
   * @param uuid The unique ID of the document to reject.
   * @param reason The reason for rejecting the document.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer (Buyer) if an intermediary is acting on their behalf.
   * @returns A promise that resolves with the rejection request confirmation.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async rejectDocument(
    uuid: string,
    reason: string,
    onBehalfOfTIN?: string
  ): Promise<RejectDocumentResponse> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const requestBody: RejectDocumentRequest = {
      status: "rejected",
      reason: reason,
    };

    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}/api/v1.0/documents/state/${uuid}/state`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in rejectDocument: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: RejectDocumentResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Retrieves a list of recent documents based on specified filters.
   * @param params The filter parameters for the document search.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the list of recent documents and pagination metadata.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getRecentDocuments(
    params: GetRecentDocumentsRequestParams = {},
    onBehalfOfTIN?: string
  ): Promise<GetRecentDocumentsResponse> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const queryParameters = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParameters.append(key, String(value));
      }
    });

    const url = `${this.baseUrl}/api/v1.0/documents/recent?${queryParameters.toString()}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getRecentDocuments: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: GetRecentDocumentsResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Retrieves the details of a single submission to check its processing status.
   * @param submissionUid The unique ID of the document submission to retrieve.
   * @param params Optional pagination parameters (pageNo, pageSize).
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the submission details.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getSubmissionDetails(
    submissionUid: string,
    params: GetSubmissionDetailsRequestParams = {},
    onBehalfOfTIN?: string
  ): Promise<GetSubmissionDetailsResponse> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const queryParameters = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParameters.append(key, String(value));
      }
    });

    const url = `${this.baseUrl}/api/v1.0/documentsubmissions/${submissionUid}?${queryParameters.toString()}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getSubmissionDetails: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: GetSubmissionDetailsResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Retrieves the full raw document (XML or JSON) and its metadata by its unique UUID.
   * @param uuid The unique ID of the document to retrieve.
   * @param preferredFormat Optional. Specify 'JSON' or 'XML' for the desired response format.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the document details including the raw document string.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getDocumentByUuid(
    uuid: string,
    preferredFormat?: "JSON" | "XML",
    onBehalfOfTIN?: string
  ): Promise<GetDocumentResponse> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const headers: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
    };
    if (preferredFormat === "JSON") {
      headers.Accept = "application/json";
    } else if (preferredFormat === "XML") {
      headers.Accept = "application/xml";
    } else {
      headers.Accept = "application/json"; // Default to JSON if not specified or invalid
    }

    const url = `${this.baseUrl}/api/v1.0/documents/${uuid}/raw`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: headers,
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getDocumentByUuid: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      // Assuming the response will be JSON even if XML was requested,
      // as the type GetDocumentResponse suggests a JSON structure.
      // If XML can actually be returned as raw text, this part needs adjustment.
      const responseData: GetDocumentResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json(); // Try to parse error as JSON first
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
         error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Retrieves full details of a document, including validation results, by its unique UUID.
   * @param uuid The unique ID of the document to retrieve details for.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the document details including validation results.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async getDocumentDetailsByUuid(
    uuid: string,
    onBehalfOfTIN?: string
  ): Promise<DocumentDetailsResponse> {
    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const url = `${this.baseUrl}/api/v1.0/documents/${uuid}/details`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in getDocumentDetailsByUuid: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: DocumentDetailsResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }

  /**
   * Searches for documents based on a set of filter criteria.
   * Either submissionDateFrom/To or issueDateFrom/To must be provided.
   * @param params The search filter parameters.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the search results, including documents and pagination metadata.
   * @throws {MyInvoisError} If required date parameters are missing.
   * @throws {MyInvoisAuthenticationError} If token acquisition fails.
   * @throws {MyInvoisNetworkError} If a network error occurs during the API call.
   * @throws {MyInvoisStandardAPIError} If the API returns an error response.
   */
  async searchDocuments(
    params: SearchDocumentsRequestParams,
    onBehalfOfTIN?: string
  ): Promise<SearchDocumentsResponse> {
    if (
      !(params.submissionDateFrom && params.submissionDateTo) &&
      !(params.issueDateFrom && params.issueDateTo)
    ) {
      // Use MyInvoisError for client-side validation issues
      throw new MyInvoisError(
        "Search criteria incomplete: Either submissionDateFrom/To or issueDateFrom/To must be provided."
      );
    }

    const accessToken = onBehalfOfTIN
      ? await this.apiClient.getIntermediaryAccessToken(
          onBehalfOfTIN,
          "InvoicingAPI"
        )
      : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const queryParameters = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParameters.append(key, String(value));
      }
    });

    const url = `${this.baseUrl}/api/v1.0/documents/search?${queryParameters.toString()}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      throw new MyInvoisNetworkError(
        `Network error in searchDocuments: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        fetchError instanceof Error ? fetchError : undefined
      );
    }

    if (response.ok) { // HTTP 200
      const responseData: SearchDocumentsResponse = await response.json();
      return responseData;
    } else {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (parsingError) {
        const rawText = await response.text().catch(() => "Could not read error response body.");
        throw new MyInvoisStandardAPIError(response.status, {
          error: {
            message: `API Error: ${response.status} ${response.statusText}. Failed to parse error response as JSON.`,
            error: `Failed to parse error response as JSON. Raw body: ${rawText}`
          }
        });
      }
      const apiResponse = errorBody.error ? errorBody : { error: errorBody };
      throw new MyInvoisStandardAPIError(response.status, apiResponse);
    }
  }
}

export * from "./types";
