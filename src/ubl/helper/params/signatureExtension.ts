/**
 * Parameters for building the UBL Extensions, specifically for embedding a digital signature.
 * This interface collects the necessary data to generate the <UBLExtensions> block
 * containing the digital signature information as per MyInvois requirements.
 */
export interface SignatureExtensionParams {
  /**
   * The main UBL document object (e.g., Invoice, CreditNote JSON object) that needs to be signed.
   * This document will be processed (minified, parts excluded) to generate the document digest.
   */
  documentToSign: any; // Ideally, this would be a generic type representing any UBL document.

  /**
   * The signer's private key as a CryptoKey object, used for signing the document digest.
   */
  privateKey: CryptoKey;

  /**
   * The signer's X.509 certificate, base64 encoded. This certificate is included in the signature.
   */
  signingCertificateBase64: string;

  /**
   * Base64 encoded SHA-256 digest of the signing certificate (also known as "CertDigest").
   * This is required for the XAdES properties within the signature.
   */
  certificateDigestBase64: string;

  /**
   * Issuer name extracted from the signing certificate.
   */
  certificateIssuerName: string;

  /**
   * Serial number extracted from the signing certificate.
   */
  certificateSerialNumber: string;

  /**
   * Optional. URI for the UBL extension that identifies the type of extension.
   * For enveloped XAdES signatures, this is typically "urn:oasis:names:specification:ubl:dsig:enveloped:xades".
   * @default "urn:oasis:names:specification:ubl:dsig:enveloped:xades"
   */
  extensionUri?: string;

  /**
   * Optional. ID for the SignatureInformation block within the UBLExtensions.
   * Example: "urn:oasis:names:specification:ubl:signature:1"
   * @default "urn:oasis:names:specification:ubl:signature:1"
   */
  signatureInformationId?: string;

  /**
   * Optional. This ID should match the ID of the <cac:Signature> element in the main UBL document
   * (e.g., Invoice.Signature[0].ID[0]._). It links the extension to that specific signature placeholder.
   * Example: "urn:oasis:names:specification:ubl:signature:Invoice" for an Invoice document.
   * @default "urn:oasis:names:specification:ubl:signature:Invoice"
   */
  referencedSignatureId?: string;

  /**
   * Optional. An array of top-level keys to exclude from the `documentToSign` object before generating its digest.
   * These keys typically include "UBLExtensions" and "Signature" itself.
   * @default ["UBLExtensions", "Signature"]
   */
  documentTransformationKeys?: string[];
}
