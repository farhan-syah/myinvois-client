import { InvoiceTypeCode } from "../codes";
import { MyInvoisDetailedError } from "../types";

export interface DocumentTypeVersion {
  id: number;
  invoiceTypeCode?: InvoiceTypeCode;
  name: string;
  description: string;
  activeFrom: string; 
  activeTo?: string; 
  versionNumber: number; 
  status: "draft" | "published" | "deactivated";
}

export interface WorkflowParameter {
  id: number;
  parameter: string; 
  value: number;
  activeFrom: string; 
  activeTo?: string; 
}

export interface DocumentType {
  id: number;
  invoiceTypeCode: InvoiceTypeCode;
  description: string;
  activeFrom: string; 
  activeTo?: string; 
  documentTypeVersions: DocumentTypeVersion[];
  workflowParameters?: WorkflowParameter[]; 
}

export interface GetAllDocumentTypesResponse {
  result: DocumentType[];
}

export interface DocumentSubmissionItem {
  format: "XML" | "JSON";
  document: string; 
  documentHash: string; 
  codeNumber: string; 
}

export interface SubmitDocumentsRequest {
  documents: DocumentSubmissionItem[];
}

export interface AcceptedDocumentInfo {
  uuid: string; 
  invoiceCodeNumber: string; 
}

export interface RejectedDocumentInfo {
  invoiceCodeNumber: string; 
  error: MyInvoisDetailedError; 
}

export interface SubmitDocumentsResponse {
  submissionUID: string; 
  acceptedDocuments: AcceptedDocumentInfo[];
  rejectedDocuments: RejectedDocumentInfo[];
}

export interface CancelDocumentRequest {
  status: "cancelled"; 
  reason: string; 
}

export interface CancelDocumentResponse {
  uuid: string; 
  status: "Cancelled"; 
}

export interface RejectDocumentRequest {
  status: "rejected"; 
  reason: string;    
}

export interface RejectDocumentResponse {
  uuid: string; 
  status: "Requested for Rejection"; 
}

// Types for Get Recent Documents API
export interface GetRecentDocumentsRequestParams {
  pageNo?: number;
  pageSize?: number;
  submissionDateFrom?: string; 
  submissionDateTo?: string;   
  issueDateFrom?: string;      
  issueDateTo?: string;        
  InvoiceDirection?: "Sent" | "Received";
  status?: "Valid" | "Invalid" | "Cancelled" | "Submitted";
  documentType?: InvoiceTypeCode; 
  receiverIdType?: "BRN" | "PASSPORT" | "NRIC" | "ARMY";
  receiverId?: string;
  issuerIdType?: "BRN" | "PASSPORT" | "NRIC" | "ARMY";
  issuerId?: string;
  receiverTin?: string;
  issuerTin?: string;
}

export interface RecentDocumentInfo {
  uuid: string;
  submissionUID: string;
  longId: string;
  internalId: string; 
  typeName: string; 
  typeVersionName: string; 
  issuerTin: string;
  issuerName?: string; 
  receiverTin?: string; // Added this based on typical search results, aligns with supplier/buyer TIN
  receiverId?: string;
  receiverName?: string;
  dateTimeIssued: string; 
  dateTimeReceived: string; 
  dateTimeValidated?: string; 
  totalSales?: number; // Changed from totalExcludingTax to align with RecentDocumentInfo output field name
  totalDiscount?: number;
  netAmount?: number; // Changed from totalNetAmount to align with RecentDocumentInfo output field name
  total: number; // This is totalPayableAmount in some contexts, ensuring consistency or using a more generic term
  status: "Submitted" | "Valid" | "Invalid" | "Cancelled" | "Requested for Rejection"; 
  cancelDateTime?: string; 
  rejectRequestDateTime?: string; 
  documentStatusReason?: string;
  createdByUserId?: string;
  supplierTin?: string; // Explicitly keeping as per doc output which differentiates issuer/supplier sometimes
  supplierName?: string; 
  submissionChannel?: "ERP" | "Invoicing Portal" | "InvoicingMobileApp" | string; 
  intermediaryName?: string;
  intermediaryTin?: string;
  intermediaryRob?: string;
  buyerName?: string; 
  buyerTin?: string; // Explicitly keeping as per doc output
}

export interface RecentDocumentsMetadata {
  totalPages: number;
  totalCount: number;
  pageSize: number; 
  pageNo: number;   
}

export interface GetRecentDocumentsResponse {
  result: RecentDocumentInfo[];
  metadata: RecentDocumentsMetadata;
}

// Types for Get Submission Details API
export interface GetSubmissionDetailsRequestParams {
  pageNo?: number;
  pageSize?: number;
}

export interface DocumentSummary {
  uuid: string;
  submissionUid: string; 
  longId?: string; 
  internalId: string;
  typeName: string;
  typeVersionName: string;
  issuerTin: string;
  issuerName: string;
  receiverId?: string;
  receiverName?: string;
  dateTimeIssued: string; 
  dateTimeReceived: string; 
  dateTimeValidated?: string; 
  totalExcludingTax: number; 
  totalDiscount: number;
  totalNetAmount: number;
  totalPayableAmount: number;
  status: "Submitted" | "Valid" | "Invalid" | "Cancelled"; 
  cancelDateTime?: string; 
  rejectRequestDateTime?: string; 
  documentStatusReason?: string;
  createdByUserId?: string;
}

export interface GetSubmissionDetailsResponse {
  submissionUid: string; 
  documentCount: number;
  dateTimeReceived: string; 
  overallStatus: "in progress" | "valid" | "partially valid" | "invalid";
  documentSummary: DocumentSummary[]; 
}

// Types for Get Document By UUID API (RAW Document)
export interface GetDocumentResponse {
  uuid: string;
  submissionUid: string;
  longId?: string; 
  internalId: string;
  typeName: string;
  typeVersionName: string;
  issuerTin: string;
  issuerName: string;
  receiverId?: string;
  receiverName?: string;
  dateTimeIssued: string; 
  dateTimeReceived: string; 
  dateTimeValidated?: string; 
  totalExcludingTax: number; 
  totalDiscount: number;
  totalNetAmount: number;
  totalPayableAmount: number;
  status: "Submitted" | "Valid" | "Cancelled"; 
  cancelDateTime?: string; 
  rejectRequestDateTime?: string; 
  documentStatusReason?: string;
  createdByUserId?: string;
  document: string; 
}

// Types for Get Document Details By UUID API
export interface ValidationStepResult {
  name: string;
  status: "Submitted" | "Valid" | "Invalid";
  error?: MyInvoisDetailedError; 
}

export interface DocumentValidationResults {
  status: "Submitted" | "Valid" | "Invalid";
  validationSteps: ValidationStepResult[];
}

export interface DocumentDetailsResponse {
  uuid: string;
  submissionUid: string;
  longId?: string; 
  internalId: string;
  typeName: string;
  typeVersionName: string;
  issuerTin: string;
  issuerName: string;
  receiverId?: string;
  receiverName?: string;
  dateTimeIssued: string; 
  dateTimeReceived: string; 
  dateTimeValidated?: string; 
  totalExcludingTax: number; 
  totalDiscount: number;
  totalNetAmount: number;
  totalPayableAmount: number;
  status: "Submitted" | "Valid" | "Invalid" | "Cancelled"; 
  cancelDateTime?: string; 
  rejectRequestDateTime?: string; 
  documentStatusReason?: string;
  createdByUserId?: string;
  validationResults?: DocumentValidationResults; 
}

// Types for Search Documents API
export interface SearchDocumentsRequestParams {
  uuid?: string;
  submissionDateFrom?: string; // Mandatory if issueDateFrom/To not used
  submissionDateTo?: string;   // Mandatory if issueDateFrom/To not used
  pageSize?: number;           // Default 100, max 100
  pageNo?: number;
  issueDateFrom?: string;      // Mandatory if submissionDateFrom/To not used
  issueDateTo?: string;        // Mandatory if submissionDateFrom/To not used
  invoiceDirection?: "Sent" | "Received";
  status?: "Valid" | "Invalid" | "Cancelled" | "Submitted";
  documentType?: InvoiceTypeCode; // Using existing InvoiceTypeCode
  searchQuery?: string; // Free text search for specific fields
}

// The output structure for Search Documents is very similar to GetRecentDocuments
// It has a 'result' array and 'metadata'. We can reuse RecentDocumentInfo and RecentDocumentsMetadata.
export interface SearchDocumentsResponse {
  result: RecentDocumentInfo[];
  metadata: RecentDocumentsMetadata;
}
