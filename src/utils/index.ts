import crypto from "crypto";
import {
  CreateInvoiceDocumentParams,
  createUblJsonInvoiceDocument,
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
  version: "1.1" | "1.0" = "1.1"
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
