import { UBLJsonExtensions } from "../../json/ubl_json";
import { UblExtensionsParams } from "../params/ublExtensions";

/**
 * Builds the generic UBLJsonExtensions structure, which acts as a container for
 * one or more individual UBL extensions (like a signature extension).
 *
 * This function takes an array of pre-built `UBLJsonExtension` objects and wraps
 * them in the required MyInvois UBL JSON format for `<UBLExtensions>`.
 *
 * @param params The {@link UblExtensionsParams} object containing an array of `UBLJsonExtension` objects.
 * @returns The constructed {@link UBLJsonExtensions} object.
 * @example
 * ```typescript
 * import { buildSignatureExtension } from "./signatureExtension"; // Assuming this exists
 * import { buildUblExtensions } from "./ublExtensions";
 * import { SignatureExtensionParams } from "../params/signatureExtension";
 * import { UblExtensionsParams } from "../params/ublExtensions";
 *
 * // 1. Prepare parameters for a specific extension (e.g., signature)
 * const signatureParams: SignatureExtensionParams = {
 *   documentToSign: {}, // your UBL document
 *   privateKey: {} as CryptoKey, // your CryptoKey
 *   signingCertificateBase64: "certBase64",
 *   certificateDigestBase64: "certDigestBase64",
 *   certificateIssuerName: "Issuer",
 *   certificateSerialNumber: "123",
 * };
 *
 * async function generateExtensions() {
 *   // 2. Build the specific extension object
 *   const signatureExtensionObject = await buildSignatureExtension(signatureParams);
 *
 *   // 3. Prepare parameters for the UBLExtensions wrapper
 *   const ublExtensionsParams: UblExtensionsParams = {
 *     extensions: [signatureExtensionObject], // Pass an array of all extensions
 *   };
 *
 *   // 4. Build the final UBLExtensions structure
 *   const ublExtensionsContainer = buildUblExtensions(ublExtensionsParams);
 *
 *   // Now, 'ublExtensionsContainer' can be assigned to the UBLExtensions property
 *   // of your main UBL document (e.g., Invoice, CreditNote).
 *   // invoiceDocument.UBLExtensions = ublExtensionsContainer;
 * }
 * ```
 */
export function buildUblExtensions(
  params: UblExtensionsParams
): UBLJsonExtensions {
  if (!params?.extensions || params.extensions.length === 0) {
    // Or handle this case as per your library's error handling strategy
    // For now, returning an empty structure if no extensions are provided.
    // However, MyInvois typically expects the UBLExtension array to exist.
    // Consider if an empty array should result in `undefined` or an error.
    // For signature, it's usually mandatory for v1.1, so this case might be rare.
    return [{ UBLExtension: [] }];
  }

  const ublExtensionsContainer: UBLJsonExtensions = [
    {
      UBLExtension: params.extensions,
    },
  ];

  return ublExtensionsContainer;
}
