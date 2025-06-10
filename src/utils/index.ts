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

export async function createDocumentSubmissionItemFromInvoice(
  params: CreateInvoiceDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonInvoiceDocument(params, version);
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

export async function createDocumentSubmissionItemFromCreditNote(
  params: CreateCreditNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonCreditNoteDocument(
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

export async function createDocumentSubmissionItemFromDebitNote(
  params: CreateDebitNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonDebitNoteDocument(params, version);
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

export async function createDocumentSubmissionItemFromRefundNote(
  params: CreateRefundNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonRefundNoteDocument(
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

export async function createDocumentSubmissionItemFromSelfBilledInvoice(
  params: CreateSelfBilledInvoiceDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonSelfBilledInvoiceDocument(
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

export async function createDocumentSubmissionItemFromSelfBilledCreditNote(
  params: CreateSelfBilledCreditNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonSelfBilledCreditNoteDocument(
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

export async function createDocumentSubmissionItemFromSelfBilledDebitNote(
  params: CreateSelfBilledDebitNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonSelfBilledDebitNoteDocument(
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

export async function createDocumentSubmissionItemFromSelfBilledRefundNote(
  params: CreateSelfBilledRefundNoteDocumentParams,
  version: "1.1" | "1.0" = "1.0"
): Promise<DocumentSubmissionItem> {
  const fullUblDocument = await createUblJsonSelfBilledRefundNoteDocument(
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
