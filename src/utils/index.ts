import crypto from "crypto";
import {
  CreateCreditNoteDocumentParams,
  CreateInvoiceDocumentParams,
  createUblJsonCreditNoteDocument,
  createUblJsonInvoiceDocument,
  DocumentSubmissionItem,
} from "..";
import { CreateDebitNoteDocumentParams } from "myinvois-client/ubl/helper/params/debitNote";
import { createUblJsonDebitNoteDocument } from "myinvois-client/ubl/helper/builder/debitNote";
import { createUblJsonRefundNoteDocument } from "myinvois-client/ubl/helper/builder/refundNote";
import { CreateRefundNoteDocumentParams } from "myinvois-client/ubl/helper/params/refundNote";
import { CreateSelfBilledInvoiceDocumentParams } from "myinvois-client/ubl/helper/params/selfBilledInvoice";
import { createUblJsonSelfBilledInvoiceDocument } from "myinvois-client/ubl/helper/builder/selfBilledInvoice";
import { CreateSelfBilledCreditNoteDocumentParams } from "myinvois-client/ubl/helper/params/selfBilledCreditNote";
import { createUblJsonSelfBilledCreditNoteDocument } from "myinvois-client/ubl/helper/builder/selfBilledCreditNote";
import { CreateSelfBilledDebitNoteDocumentParams } from "myinvois-client/ubl/helper/params/selfBilledDebitNote";
import { createUblJsonSelfBilledDebitNoteDocument } from "myinvois-client/ubl/helper/builder/selfBilledDebitNote";
import { CreateSelfBilledRefundNoteDocumentParams } from "myinvois-client/ubl/helper/params/selfBilledRefundNote";
import { createUblJsonSelfBilledRefundNoteDocument } from "myinvois-client/ubl/helper/builder/selfBilledRefundNote";

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
