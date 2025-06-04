import { MyInvoisClient } from "../client";
import { MyInvoisGenericApiResponseError } from "../types";
import {
  GetAllDocumentTypesResponse,
  DocumentType,
  DocumentTypeVersion,
  SubmitDocumentsRequest,
  SubmitDocumentsResponse,
  CancelDocumentRequest,
  CancelDocumentResponse,
  RejectDocumentRequest,
  RejectDocumentResponse,
  GetRecentDocumentsRequestParams,
  GetRecentDocumentsResponse,
  GetSubmissionDetailsRequestParams,
  GetSubmissionDetailsResponse,
  GetDocumentResponse,
  DocumentDetailsResponse,
  SearchDocumentsRequestParams, // Added for new API
  SearchDocumentsResponse, // Added for new API
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
   */
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    try {
      const accessToken =
        await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

      const response = await fetch(`${this.baseUrl}/api/v1.0/documenttypes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorData: MyInvoisGenericApiResponseError | string;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
        }

        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        if (typeof errorData === "object" && errorData.error) {
          errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode})`;
          if (errorData.error.errorMS) {
            errorMessage += ` - ${errorData.error.errorMS}`;
          }
        }
        throw new Error(errorMessage);
      }

      const responseData: GetAllDocumentTypesResponse = await response.json();
      return responseData.result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the details of a single document type by its unique ID.
   * @param id The unique ID of the document type.
   * @returns A promise that resolves with the document type details.
   */
  async getDocumentTypeById(id: number): Promise<DocumentType> {
    try {
      const accessToken =
        await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

      const response = await fetch(
        `${this.baseUrl}/api/v1.0/documenttypes/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorData: MyInvoisGenericApiResponseError | string;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
        }

        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        if (typeof errorData === "object" && errorData.error) {
          errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode})`;
          if (errorData.error.errorMS) {
            errorMessage += ` - ${errorData.error.errorMS}`;
          }
        }
        throw new Error(errorMessage);
      }

      const responseData: DocumentType = await response.json();
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the details of a specific document type version.
   * @param documentTypeId The unique ID of the document type.
   * @param versionId The unique ID of the document type version.
   * @returns A promise that resolves with the document type version details.
   */
  async getDocumentTypeVersionById(
    documentTypeId: number,
    versionId: number
  ): Promise<DocumentTypeVersion> {
    try {
      const accessToken =
        await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

      const response = await fetch(
        `${this.baseUrl}/api/v1.0/documenttypes/${documentTypeId}/versions/${versionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorData: MyInvoisGenericApiResponseError | string;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
        }

        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        if (typeof errorData === "object" && errorData.error) {
          errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode})`;
          if (errorData.error.errorMS) {
            errorMessage += ` - ${errorData.error.errorMS}`;
          }
        }
        throw new Error(errorMessage);
      }

      const responseData: DocumentTypeVersion = await response.json();
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submits one or more documents to the MyInvois System.
   * @param submissionRequest The request payload containing the documents to submit.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the submission response (HTTP 202 Accepted).
   */
  async submitDocuments(
    submissionRequest: SubmitDocumentsRequest,
    onBehalfOfTIN?: string
  ): Promise<SubmitDocumentsResponse> {
    try {
      const accessToken = onBehalfOfTIN
        ? await this.apiClient.getIntermediaryAccessToken(onBehalfOfTIN)
        : await this.apiClient.getTaxpayerAccessToken();

      const response = await fetch(
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

      if (response.status === 202) {
        const responseData: SubmitDocumentsResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        let detailsMessage = "";
        if (errorData.error.details && Array.isArray(errorData.error.details)) {
          detailsMessage = errorData.error.details
            .map((detail) => detail.message)
            .join(", ");
        }
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, Details: ${detailsMessage}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancels a previously issued document.
   * @param uuid The unique ID of the document to cancel.
   * @param reason The reason for cancelling the document (max 300 characters).
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the cancellation confirmation.
   */
  async cancelDocument(
    uuid: string,
    reason: string,
    onBehalfOfTIN?: string
  ): Promise<CancelDocumentResponse> {
    try {
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

      const response = await fetch(
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

      if (response.status === 200) {
        const responseData: CancelDocumentResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rejects a previously issued document. This action is performed by the recipient (Buyer).
   * @param uuid The unique ID of the document to reject.
   * @param reason The reason for rejecting the document.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer (Buyer) if an intermediary is acting on their behalf.
   * @returns A promise that resolves with the rejection request confirmation.
   */
  async rejectDocument(
    uuid: string,
    reason: string,
    onBehalfOfTIN?: string
  ): Promise<RejectDocumentResponse> {
    try {
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

      const response = await fetch(
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

      if (response.status === 200) {
        const responseData: RejectDocumentResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a list of recent documents based on specified filters.
   * @param params The filter parameters for the document search.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the list of recent documents and pagination metadata.
   */
  async getRecentDocuments(
    params: GetRecentDocumentsRequestParams = {},
    onBehalfOfTIN?: string
  ): Promise<GetRecentDocumentsResponse> {
    try {
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

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const responseData: GetRecentDocumentsResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the details of a single submission to check its processing status.
   * @param submissionUid The unique ID of the document submission to retrieve.
   * @param params Optional pagination parameters (pageNo, pageSize).
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the submission details.
   */
  async getSubmissionDetails(
    submissionUid: string,
    params: GetSubmissionDetailsRequestParams = {},
    onBehalfOfTIN?: string
  ): Promise<GetSubmissionDetailsResponse> {
    try {
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

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const responseData: GetSubmissionDetailsResponse =
          await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the full raw document (XML or JSON) and its metadata by its unique UUID.
   * @param uuid The unique ID of the document to retrieve.
   * @param preferredFormat Optional. Specify 'JSON' or 'XML' for the desired response format.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the document details including the raw document string.
   */
  async getDocumentByUuid(
    uuid: string,
    preferredFormat?: "JSON" | "XML",
    onBehalfOfTIN?: string
  ): Promise<GetDocumentResponse> {
    try {
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
        headers.Accept = "application/json";
      }

      const url = `${this.baseUrl}/api/v1.0/documents/${uuid}/raw`;

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (response.status === 200) {
        const responseData: GetDocumentResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves full details of a document, including validation results, by its unique UUID.
   * @param uuid The unique ID of the document to retrieve details for.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the document details including validation results.
   */
  async getDocumentDetailsByUuid(
    uuid: string,
    onBehalfOfTIN?: string
  ): Promise<DocumentDetailsResponse> {
    try {
      const accessToken = onBehalfOfTIN
        ? await this.apiClient.getIntermediaryAccessToken(
            onBehalfOfTIN,
            "InvoicingAPI"
          )
        : await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

      const url = `${this.baseUrl}/api/v1.0/documents/${uuid}/details`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const responseData: DocumentDetailsResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Searches for documents based on a set of filter criteria.
   * Either submissionDateFrom/To or issueDateFrom/To must be provided.
   * @param params The search filter parameters.
   * @param onBehalfOfTIN Optional. The TIN of the taxpayer if the client is acting as an intermediary.
   * @returns A promise that resolves with the search results, including documents and pagination metadata.
   */
  async searchDocuments(
    params: SearchDocumentsRequestParams,
    onBehalfOfTIN?: string
  ): Promise<SearchDocumentsResponse> {
    if (
      !(params.submissionDateFrom && params.submissionDateTo) &&
      !(params.issueDateFrom && params.issueDateTo)
    ) {
      throw new Error(
        "Either submissionDateFrom/submissionDateTo or issueDateFrom/issueDateTo must be provided for searching documents."
      );
    }

    try {
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

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const responseData: SearchDocumentsResponse = await response.json();
        return responseData;
      }

      let errorData: MyInvoisGenericApiResponseError | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = `API Error: HTTP ${response.status} ${response.statusText}`;
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData === "object" && errorData.error) {
        errorMessage = `API Error: ${errorData.error.error} (Code: ${errorData.error.errorCode}, HTTP Status: ${response.status})`;
        if (errorData.error.errorMS) {
          errorMessage += ` - ${errorData.error.errorMS}`;
        }
      }
      throw new Error(errorMessage);
    } catch (error) {
      throw error;
    }
  }
}

export * from "./types";
