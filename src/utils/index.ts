import crypto from "crypto";
import {
  CreateCreditNoteDocumentParams,
  CreateDebitNoteDocumentParams,
  CreateInvoiceDocumentParams,
  CreateRefundNoteDocumentParams,
  CreateSelfBilledCreditNoteDocumentParams,
  CreateSelfBilledDebitNoteDocumentParams,
  CreateSelfBilledInvoiceDocumentParams,
  CreateSelfBilledRefundNoteDocumentParams,
  createUblJsonCreditNoteDocument,
  createUblJsonDebitNoteDocument,
  createUblJsonInvoiceDocument,
  createUblJsonRefundNoteDocument,
  createUblJsonSelfBilledCreditNoteDocument,
  createUblJsonSelfBilledDebitNoteDocument,
  createUblJsonSelfBilledInvoiceDocument,
  createUblJsonSelfBilledRefundNoteDocument,
  DocumentSubmissionItem,
} from "..";

export function calculateSHA256Hex(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export function encodeBase64(text: string): string {
  return Buffer.from(text, "utf8").toString("base64");
}

export function createDocumentSubmissionItemFromInvoice(
  params: CreateInvoiceDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonInvoiceDocument(params, version);
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}

export function createDocumentSubmissionItemFromCreditNote(
  params: CreateCreditNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonCreditNoteDocument(params, version);
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}

export function createDocumentSubmissionItemFromDebitNote(
  params: CreateDebitNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonDebitNoteDocument(params, version);
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}

export function createDocumentSubmissionItemFromRefundNote(
  params: CreateRefundNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonRefundNoteDocument(params, version);
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}

export function createDocumentSubmissionItemFromSelfBilledInvoice(
  params: CreateSelfBilledInvoiceDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonSelfBilledInvoiceDocument(
    params,
    version
  );
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}

export function createDocumentSubmissionItemFromSelfBilledCreditNote(
  params: CreateSelfBilledCreditNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonSelfBilledCreditNoteDocument(
    params,
    version
  );
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}

export function createDocumentSubmissionItemFromSelfBilledDebitNote(
  params: CreateSelfBilledDebitNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonSelfBilledDebitNoteDocument(
    params,
    version
  );
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}

export function createDocumentSubmissionItemFromSelfBilledRefundNote(
  params: CreateSelfBilledRefundNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): DocumentSubmissionItem {
  const fullUblDocument = createUblJsonSelfBilledRefundNoteDocument(
    params,
    version
  );
  const finalInvoiceJsonString = JSON.stringify(fullUblDocument);
  const documentHash = calculateSHA256Hex(finalInvoiceJsonString);
  const documentBase64 = encodeBase64(finalInvoiceJsonString);

  const documentToSubmit = {
    format: "JSON" as const,
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: params.id,
  };
  return documentToSubmit;
}
