import {
  UBLJsonExtension,
  UBLJsonExtensionContentData,
} from "../../json/ubl_json";
import {
  DigitalSignature,
  generateDigitalSignatureJSON,
  UBLDocumentSignatureExtension,
} from "../../json/digitalSignature";
import { SignatureParams } from "../params/signature";
import { toUblIdentifier, toUblText } from "./common";

/**
 * Builds a single UBLJsonExtension object representing a digital signature extension.
 * This object can then be included in the UBLExtensions array of a UBL document.
 *
 * @param params The {@link SignatureParams} object containing all necessary data for signature generation.
 * @returns A Promise that resolves to a {@link UBLJsonExtension} object for the signature.
 * @example
 * ```typescript
 * // Assuming 'invoiceDocument' is the UBL JSON Invoice object (prior to adding UBLExtensions)
 * // and other signature-related parameters (privateKey, certs, etc.) are available.
 *
 * const signatureParams: SignatureExtensionParams = {
 *   documentToSign: invoiceDocument,
 *   privateKey: cryptoPrivateKey, // CryptoKey
 *   signingCertificateBase64: "base64CertString...",
 *   certificateDigestBase64: "base64CertDigestString...",
 *   certificateIssuerName: "CN=Issuer...",
 *   certificateSerialNumber: "123456789",
 *   referencedSignatureId: "urn:oasis:names:specification:ubl:signature:Invoice" // Match main doc's Signature ID
 * };
 *
 * const signatureExtension = await buildSignatureExtension(signatureParams);
 * // Now, 'signatureExtension' can be part of an array passed to a general UBLExtensions builder.
 * ```
 */
export async function buildSignatureExtension(
  params: SignatureParams
): Promise<UBLJsonExtension> {
  const {
    documentToSign,
    privateKey,
    signingCertificateBase64,
    certificateDigestBase64,
    certificateIssuerName,
    certificateSerialNumber,
    extensionUri = "urn:oasis:names:specification:ubl:dsig:enveloped:xades",
    signatureInformationId = "urn:oasis:names:specification:ubl:signature:1",
    signatureId:
      referencedSignatureId = "urn:oasis:names:specification:ubl:signature:Invoice", // Important: This should match the main document's Signature ID.
    documentTransformationKeys = ["UBLExtensions", "Signature"],
  } = params;

  // 1. Generate the core DigitalSignature object using the existing helper
  const digitalSignature: DigitalSignature = await generateDigitalSignatureJSON(
    documentToSign,
    privateKey,
    signingCertificateBase64,
    certificateDigestBase64,
    certificateIssuerName,
    certificateSerialNumber,
    documentTransformationKeys
  );

  // 2. Construct the ExtensionContent part, which wraps the DigitalSignature
  const ublDocumentSignatureExtension: UBLDocumentSignatureExtension = {
    UBLDocumentSignatures: [
      {
        SignatureInformation: [
          {
            ID: toUblIdentifier(signatureInformationId), // ID for the signature info block
            ReferencedSignatureID: toUblIdentifier(referencedSignatureId), // Links to cac:Signature in main doc
            Signature: [digitalSignature], // Embed the generated DigitalSignature
          },
        ],
      },
    ],
  };

  // 3. Construct the UBLExtension object
  const ublExtension: UBLJsonExtension = {
    ExtensionURI: toUblText(extensionUri),
    ExtensionContent: [
      ublDocumentSignatureExtension as unknown as UBLJsonExtensionContentData, // Cast because UBLDocumentSignatureExtension is a specific shape
    ],
  };

  return ublExtension;
}
