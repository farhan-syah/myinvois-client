import { MyInvoisClient } from "../client";
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
   */
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    const accessToken =
      await this.apiClient.getTaxpayerAccessToken("InvoicingAPI");

    const response = await fetch(`${this.baseUrl}/api/v1.0/documenttypes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const responseData: DocumentType[] = await response.json();
      return responseData;
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
    }
  }

  /**
   * Retrieves the details of a single document type by its unique ID.
   * @param id The unique ID of the document type.
   * @returns A promise that resolves with the document type details.
   */
  async getDocumentTypeById(id: number): Promise<DocumentType> {
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
    if (response.status === 200) {
      const responseData: DocumentType = await response.json();
      return responseData;
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
    if (response.status === 200) {
      const responseData: DocumentTypeVersion = await response.json();
      return responseData;
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
  ): Promise<any> {
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
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
      const responseData: GetSubmissionDetailsResponse = await response.json();
      return responseData;
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
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
    } else {
      try {
        const errorBody = await response.json();
        throw errorBody;
      } catch (parsingError) {
        throw parsingError;
      }
    }
  }
}

export * from "./types";
