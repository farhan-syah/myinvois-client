import { InvoiceTypeCode, TaxpayerIdType } from "../codes";
import { MyInvoisDetailedError } from "../types";

/**
 * Represents a specific version of a document type in the MyInvois system.
 */
export interface DocumentTypeVersion {
  /** Unique identifier for the document type version. */
  id: number;
  /** The type code of the invoice, e.g., "01" for Invoice. See {@link InvoiceTypeCode}. */
  invoiceTypeCode?: InvoiceTypeCode;
  /** Name of the document type version. */
  name: string;
  /** Description of the document type version. */
  description: string;
  /** Date from which this version is active (ISO 8601 format, e.g., "YYYY-MM-DD"). */
  activeFrom: string;
  /** Optional: Date until which this version is active (ISO 8601 format). Null or absent if indefinitely active. */
  activeTo?: string;
  /** Version number. */
  versionNumber: number;
  /** Status of the document type version. */
  status: "draft" | "published" | "deactivated";
}

/**
 * Represents a workflow parameter associated with a document type.
 */
export interface WorkflowParameter {
  /** Unique identifier for the workflow parameter. */
  id: number;
  /** Name of the parameter. */
  parameter: string;
  /** Value of the parameter. */
  value: number;
  /** Date from which this parameter is active (ISO 8601 format). */
  activeFrom: string;
  /** Optional: Date until which this parameter is active (ISO 8601 format). Null or absent if indefinitely active. */
  activeTo?: string;
}

/**
 * Represents a type of document supported by the MyInvois system (e.g., Invoice, Credit Note).
 */
export interface DocumentType {
  /** Unique identifier for the document type. */
  id: number;
  /** The type code of the invoice. See {@link InvoiceTypeCode}. */
  invoiceTypeCode: InvoiceTypeCode;
  /** Description of the document type. */
  description: string;
  /** Date from which this document type is active (ISO 8601 format). */
  activeFrom: string;
  /** Optional: Date until which this document type is active (ISO 8601 format). Null or absent if indefinitely active. */
  activeTo?: string;
  /** Array of versions for this document type. */
  documentTypeVersions: DocumentTypeVersion[];
  /** Optional array of workflow parameters for this document type. */
  workflowParameters?: WorkflowParameter[];
}

/**
 * Response structure for retrieving all document types.
 */
export interface GetAllDocumentTypesResponse {
  /** Array of document types. */
  result: DocumentType[];
}

/**
 * Represents a single document to be submitted to the MyInvois API.
 */
export interface DocumentSubmissionItem {
  /** Format of the document string. */
  format: "XML" | "JSON";
  /** The UBL document content as a string (either XML or JSON). */
  document: string;
  /** Hash of the document content. */
  documentHash: string;
  /** Unique code number for the invoice/document. */
  codeNumber: string;
}

/**
 * Request payload for submitting documents.
 */
export interface SubmitDocumentsRequest {
  /** Array of documents to be submitted. */
  documents: DocumentSubmissionItem[];
}

/**
 * Information about a document that was successfully accepted by the system.
 */
export interface AcceptedDocumentInfo {
  /** Unique identifier (UUID) assigned by MyInvois to the accepted document. */
  uuid: string;
  /** The original invoice code number provided by the submitter. */
  invoiceCodeNumber: string;
}

/**
 * Information about a document that was rejected by the system during submission.
 */
export interface RejectedDocumentInfo {
  /** The original invoice code number of the rejected document. */
  invoiceCodeNumber: string;
  /** Detailed error information for the rejection. See {@link MyInvoisDetailedError}. */
  error: MyInvoisDetailedError;
}

/**
 * Response from the document submission API.
 */
export interface SubmitDocumentsResponse {
  /** Unique identifier for the submission batch. */
  submissionUID: string;
  /** Array of documents accepted in this submission. */
  acceptedDocuments: AcceptedDocumentInfo[];
  /** Array of documents rejected in this submission. */
  rejectedDocuments: RejectedDocumentInfo[];
}

/**
 * Request payload for cancelling a document.
 */
export interface CancelDocumentRequest {
  /** Status must be "cancelled". */
  status: "cancelled";
  /** Reason for cancellation (max 300 characters). */
  reason: string;
}

/**
 * Response confirming a document cancellation.
 */
export interface CancelDocumentResponse {
  /** UUID of the cancelled document. */
  uuid: string;
  /** Final status of the document, should be "Cancelled". */
  status: "Cancelled"; // API specific fixed string
}

/**
 * Request payload for rejecting a document.
 */
export interface RejectDocumentRequest {
  /** Status must be "rejected". */
  status: "rejected";
  /** Reason for rejection. */
  reason: string;
}

/**
 * Response confirming a document rejection request.
 */
export interface RejectDocumentResponse {
  /** UUID of the document for which rejection was requested. */
  uuid: string;
  /** Status of the document, typically "Requested for Rejection". */
  status: "Requested for Rejection"; // API specific fixed string
}

/**
 * Parameters for querying recent documents.
 */
export interface GetRecentDocumentsRequestParams {
  /** Page number for pagination (e.g., 1, 2, ...). */
  pageNo?: number;
  /** Number of documents per page. */
  pageSize?: number;
  /** Start date for submission date range filter (ISO 8601 format, e.g., "YYYY-MM-DD"). */
  submissionDateFrom?: string;
  /** End date for submission date range filter (ISO 8601 format). */
  submissionDateTo?: string;
  /** Start date for issue date range filter (ISO 8601 format). */
  issueDateFrom?: string;
  /** End date for issue date range filter (ISO 8601 format). */
  issueDateTo?: string;
  /** Direction of the invoice ("Sent" by the taxpayer, or "Received" by the taxpayer). */
  InvoiceDirection?: "Sent" | "Received";
  /** Current status of the document. */
  status?: "Valid" | "Invalid" | "Cancelled" | "Submitted";
  /** Type of document to filter by. See {@link InvoiceTypeCode}. */
  documentType?: InvoiceTypeCode;
  /** Type of receiver's ID. See {@link TaxpayerIdType}. */
  receiverIdType?: TaxpayerIdType;
  /** Value of the receiver's ID. */
  receiverId?: string;
  /** Type of issuer's ID. See {@link TaxpayerIdType}. */
  issuerIdType?: TaxpayerIdType;
  /** Value of the issuer's ID. */
  issuerId?: string;
  /** Receiver's Tax Identification Number. */
  receiverTin?: string;
  /** Issuer's Tax Identification Number. */
  issuerTin?: string;
}

/**
 * Detailed information about a recently processed document.
 */
export interface RecentDocumentInfo {
  /** Unique identifier (UUID) of the document. */
  uuid: string;
  /** Unique identifier of the submission batch this document was part of. */
  submissionUID: string;
  /** A long identifier for the document. */
  longId: string;
  /** An internal identifier for the document. */
  internalId: string;
  /** Name of the document type (e.g., "Invoice", "Credit Note"). */
  typeName: string;
  /** Version name of the document type. */
  typeVersionName: string;
  /** Issuer's Tax Identification Number. */
  issuerTin: string;
  /** Optional: Issuer's registered name. */
  issuerName?: string;
  /** Optional: Receiver's Tax Identification Number. */
  receiverTin?: string;
  /** Optional: Receiver's other identification number (if TIN is not used). */
  receiverId?: string;
  /** Optional: Receiver's registered name. */
  receiverName?: string;
  /** Date and time the document was issued (ISO 8601 format, e.g., "YYYY-MM-DDTHH:mm:ssZ"). */
  dateTimeIssued: string;
  /** Date and time the document was received by MyInvois (ISO 8601 format). */
  dateTimeReceived: string;
  /** Optional: Date and time the document was validated (ISO 8601 format). */
  dateTimeValidated?: string;
  /** Optional: Total sales amount (sum of line subtotals, excluding tax). */
  totalSales?: number;
  /** Optional: Total discount amount across all items. */
  totalDiscount?: number;
  /** Optional: Net amount after discounts, before tax. */
  netAmount?: number;
  /** Total payable amount, inclusive of tax and after allowances/charges. */
  total: number;
  /** Current status of the document within the MyInvois system. */
  status:
    | "Submitted"
    | "Valid"
    | "Invalid"
    | "Cancelled"
    | "Requested for Rejection";
  /** Optional: Date and time of cancellation (ISO 8601 format). */
  cancelDateTime?: string;
  /** Optional: Date and time rejection was requested (ISO 8601 format). */
  rejectRequestDateTime?: string;
  /** Optional: Reason for the current document status if not 'Valid'. */
  documentStatusReason?: string;
  /** Optional: User ID of the creator. */
  createdByUserId?: string;
  /** Optional: Supplier's Tax Identification Number (may differ from issuerTin in specific scenarios like self-billed invoices). */
  supplierTin?: string;
  /** Optional: Supplier's registered name. */
  supplierName?: string;
  /** Channel through which the document was submitted (e.g., "ERP", "Invoicing Portal"). Can be other string values. */
  submissionChannel?:
    | "ERP"
    | "Invoicing Portal"
    | "InvoicingMobileApp"
    | string;
  /** Optional: Name of the intermediary if one was involved. */
  intermediaryName?: string;
  /** Optional: TIN of the intermediary. */
  intermediaryTin?: string;
  /** Optional: Business registration number (ROB) of the intermediary. */
  intermediaryRob?: string;
  /** Optional: Buyer's registered name. */
  buyerName?: string;
  /** Optional: Buyer's Tax Identification Number. */
  buyerTin?: string;
}

/**
 * Metadata associated with a paginated list of documents (e.g., from GetRecentDocuments or SearchDocuments).
 */
export interface RecentDocumentsMetadata {
  /** Total number of pages available. */
  totalPages: number;
  /** Total count of documents matching the query across all pages. */
  totalCount: number;
  /** Number of documents per page in the current response. */
  pageSize: number;
  /** Current page number. */
  pageNo: number;
}

/**
 * Parameters for requesting submission details.
 */
export interface GetSubmissionDetailsRequestParams {
  /** Optional: Page number for paginating through documents within the submission (if applicable). */
  pageNo?: number;
  /** Optional: Page size for paginating through documents within the submission. */
  pageSize?: number;
}

/**
 * Summary information for a document within a submission batch.
 */
export interface DocumentSummary {
  /** Unique identifier (UUID) of the document. */
  uuid: string;
  /** Unique identifier of the submission batch this document was part of. */
  submissionUid: string;
  /** Optional: A long identifier for the document. */
  longId?: string;
  /** An internal identifier for the document. */
  internalId: string;
  /** Name of the document type. */
  typeName: string;
  /** Version name of the document type. */
  typeVersionName: string;
  /** Issuer's Tax Identification Number. */
  issuerTin: string;
  /** Issuer's registered name. */
  issuerName: string;
  /** Optional: Receiver's other identification number. */
  receiverId?: string;
  /** Optional: Receiver's registered name. */
  receiverName?: string;
  /** Date and time the document was issued (ISO 8601 format). */
  dateTimeIssued: string;
  /** Date and time the document was received by MyInvois (ISO 8601 format). */
  dateTimeReceived: string;
  /** Optional: Date and time the document was validated (ISO 8601 format). */
  dateTimeValidated?: string;
  /** Total amount excluding tax. */
  totalExcludingTax: number;
  /** Total discount amount. */
  totalDiscount: number;
  /** Total net amount (after discount, before tax). */
  totalNetAmount: number;
  /** Total payable amount (inclusive of tax, after allowances/charges). */
  totalPayableAmount: number;
  /** Status of the document within the submission. */
  status: "Submitted" | "Valid" | "Invalid" | "Cancelled";
  /** Optional: Date and time of cancellation (ISO 8601 format). */
  cancelDateTime?: string;
  /** Optional: Date and time rejection was requested (ISO 8601 format). */
  rejectRequestDateTime?: string;
  /** Optional: Reason for the current document status if not 'Valid'. */
  documentStatusReason?: string;
  /** Optional: User ID of the creator. */
  createdByUserId?: string;
}

/**
 * Response structure for retrieving details of a document submission.
 */
export interface GetSubmissionDetailsResponse {
  /** Unique identifier of the submission batch. */
  submissionUid: string;
  /** Number of documents in this submission. */
  documentCount: number;
  /** Date and time the submission was received by MyInvois (ISO 8601 format). */
  dateTimeReceived: string;
  /** Overall status of the submission processing. */
  overallStatus: "in progress" | "valid" | "partially valid" | "invalid";
  /** Array of summaries for documents included in this submission. */
  documentSummary: DocumentSummary[];
}

/**
 * Response structure for retrieving a raw document by its UUID.
 * Contains metadata similar to {@link DocumentDetailsResponse} plus the raw document string.
 */
export interface GetDocumentResponse {
  /** Unique identifier (UUID) of the document. */
  uuid: string;
  /** Unique identifier of the submission batch. */
  submissionUid: string;
  /** Optional: A long identifier for the document. */
  longId?: string;
  /** An internal identifier for the document. */
  internalId: string;
  /** Name of the document type. */
  typeName: string;
  /** Version name of the document type. */
  typeVersionName: string;
  /** Issuer's Tax Identification Number. */
  issuerTin: string;
  /** Issuer's registered name. */
  issuerName: string;
  /** Optional: Receiver's other identification number. */
  receiverId?: string;
  /** Optional: Receiver's registered name. */
  receiverName?: string;
  /** Date and time the document was issued (ISO 8601 format). */
  dateTimeIssued: string;
  /** Date and time the document was received by MyInvois (ISO 8601 format). */
  dateTimeReceived: string;
  /** Optional: Date and time the document was validated (ISO 8601 format). */
  dateTimeValidated?: string;
  /** Total amount excluding tax. */
  totalExcludingTax: number;
  /** Total discount amount. */
  totalDiscount: number;
  /** Total net amount. */
  totalNetAmount: number;
  /** Total payable amount. */
  totalPayableAmount: number;
  /** Current status of the document. */
  status: "Submitted" | "Valid" | "Cancelled"; // Note: 'Invalid' might also be possible here.
  /** Optional: Date and time of cancellation (ISO 8601 format). */
  cancelDateTime?: string;
  /** Optional: Date and time rejection was requested (ISO 8601 format). */
  rejectRequestDateTime?: string;
  /** Optional: Reason for the document status. */
  documentStatusReason?: string;
  /** Optional: User ID of the creator. */
  createdByUserId?: string;
  /** The raw document content as a string (XML or JSON). */
  document: string;
}

/**
 * Result of a single validation step performed on a document.
 */
export interface ValidationStepResult {
  /** Name of the validation step. */
  name: string;
  /** Status of this validation step. */
  status: "Submitted" | "Valid" | "Invalid";
  /** Optional: Detailed error if this validation step resulted in an 'Invalid' status. See {@link MyInvoisDetailedError}. */
  error?: MyInvoisDetailedError;
}

/**
 * Overall validation results for a document.
 */
export interface DocumentValidationResults {
  /** Overall validation status of the document. */
  status: "Submitted" | "Valid" | "Invalid";
  /** Array of results from individual validation steps. */
  validationSteps: ValidationStepResult[];
}

/**
 * Response structure for retrieving detailed information about a document, including validation results.
 */
export interface DocumentDetailsResponse {
  /** Unique identifier (UUID) of the document. */
  uuid: string;
  /** Unique identifier of the submission batch. */
  submissionUid: string;
  /** Optional: A long identifier for the document. */
  longId?: string;
  /** An internal identifier for the document. */
  internalId: string;
  /** Name of the document type. */
  typeName: string;
  /** Version name of the document type. */
  typeVersionName: string;
  /** Issuer's Tax Identification Number. */
  issuerTin: string;
  /** Issuer's registered name. */
  issuerName: string;
  /** Optional: Receiver's other identification number. */
  receiverId?: string;
  /** Optional: Receiver's registered name. */
  receiverName?: string;
  /** Date and time the document was issued (ISO 8601 format). */
  dateTimeIssued: string;
  /** Date and time the document was received by MyInvois (ISO 8601 format). */
  dateTimeReceived: string;
  /** Optional: Date and time the document was validated (ISO 8601 format). */
  dateTimeValidated?: string;
  /** Total amount excluding tax. */
  totalExcludingTax: number;
  /** Total discount amount. */
  totalDiscount: number;
  /** Total net amount. */
  totalNetAmount: number;
  /** Total payable amount. */
  totalPayableAmount: number;
  /** Current status of the document. */
  status: "Submitted" | "Valid" | "Invalid" | "Cancelled";
  /** Optional: Date and time of cancellation (ISO 8601 format). */
  cancelDateTime?: string;
  /** Optional: Date and time rejection was requested (ISO 8601 format). */
  rejectRequestDateTime?: string;
  /** Optional: Reason for the document status. */
  documentStatusReason?: string;
  /** Optional: User ID of the creator. */
  createdByUserId?: string;
  /** Optional: Detailed validation results for the document. */
  validationResults?: DocumentValidationResults;
}

/**
 * Parameters for searching documents in the MyInvois system.
 * Either submissionDateFrom/To or issueDateFrom/To must be provided.
 */
export interface SearchDocumentsRequestParams {
  /** Optional: Specific UUID of the document to search for. */
  uuid?: string;
  /** Optional: Start date for submission date range (YYYY-MM-DD). Mandatory if issueDateFrom/To not used. */
  submissionDateFrom?: string;
  /** Optional: End date for submission date range (YYYY-MM-DD). Mandatory if issueDateFrom/To not used. */
  submissionDateTo?: string;
  /** Optional: Number of documents per page. Defaults to 100, max 100. */
  pageSize?: number;
  /** Optional: Page number for pagination. */
  pageNo?: number;
  /** Optional: Start date for issue date range (YYYY-MM-DD). Mandatory if submissionDateFrom/To not used. */
  issueDateFrom?: string;
  /** Optional: End date for issue date range (YYYY-MM-DD). Mandatory if submissionDateFrom/To not used. */
  issueDateTo?: string;
  /** Optional: Direction of the invoice ("Sent" or "Received"). */
  invoiceDirection?: "Sent" | "Received";
  /** Optional: Status of the documents to filter by. */
  status?: "Valid" | "Invalid" | "Cancelled" | "Submitted";
  /** Optional: Type of document to filter by. See {@link InvoiceTypeCode}. */
  documentType?: InvoiceTypeCode;
  /** Optional: Free text search query against specific fields (e.g., document number, supplier/buyer name). */
  searchQuery?: string;
}

/**
 * Response structure for document search operations.
 * Contains an array of document information and pagination metadata.
 */
export interface SearchDocumentsResponse {
  /** Array of documents matching the search criteria. See {@link RecentDocumentInfo}. */
  result: RecentDocumentInfo[];
  /** Pagination metadata for the search results. See {@link RecentDocumentsMetadata}. */
  metadata: RecentDocumentsMetadata;
}

/**
 * Response structure for retrieving recent documents.
 * Contains an array of document information and pagination metadata.
 */
export interface GetRecentDocumentsResponse {
  /** Array of recent documents. Note: The structure of objects in this array is based on observed API responses and might be identical or very similar to {@link RecentDocumentInfo}. */
  result: { // This inline type definition should ideally be replaced by RecentDocumentInfo if the structures are confirmed to be identical or compatible.
    uuid: string;
    submissionUid: string;
    longId: string;
    internalId: string;
    typeName: string;
    typeVersionName: string;
    issuerTIN: string;
    issuerName?: string;
    receiverTIN: string | null;
    receiverId?: string;
    receiverName: string | null;
    dateTimeIssued: string;
    dateTimeReceived: string;
    dateTimeValidated: string | null;
    totalSales: number | null;
    totalDiscount: number | null;
    netAmount: number | null;
    total: number;
    status:
      | "Submitted"
      | "Valid"
      | "Invalid"
      | "Cancelled"
      | "Requested for Rejection";
    cancelDateTime: string | null;
    rejectRequestDateTime: string | null;
    documentStatusReason: string | null;
    createdByUserId: string | null;
    supplierTIN: string | null;
    supplierName: string | null;
    submissionChannel: string | null;
    intermediaryName: string | null;
    intermediaryTIN: string | null;
    intermediaryROB: string | null;
    buyerName: string | null;
    buyerTIN: string | null;
  }[];
  metadata: {
    totalPages: number;
    totalCount: number;
  };
}
