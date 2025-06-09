# Detailed Guide: Digital Signatures for UBL Invoice v1.1

For UBL Invoice v1.1, digital signatures (specifically XAdES enveloped signatures) are a mandatory component. This document outlines the conceptual steps and library helpers involved in constructing the necessary JSON structures for such a signature.

**Note:** While this guide details the underlying components, the recommended way to create a signed UBL v1.1 invoice is to use the `createUblJsonInvoiceDocument` helper function and provide the necessary `SignatureParams`. The builder function (`createUblJsonInvoiceDocument`) internally uses a similar process to what's described below, including calling `buildSignatureExtension` which in turn uses `generateDigitalSignatureJSON`. This guide is primarily for understanding the mechanics or for advanced scenarios requiring more direct control.

You will need to provide your own cryptographic functions for hashing (e.g., SHA-256) and signing (e.g., RSA-SHA256), as well as your X.509 certificate details and private key.

## Overview of the Process

Creating an enveloped digital signature for a UBL JSON document involves several steps:

1.  **Prepare the Document for Hashing**: The UBL document (without the signature elements themselves) is canonicalized and then hashed.
2.  **Create SignedProperties**: A separate XML (or JSON representation of XML structure) fragment containing metadata about the signature (signing time, certificate digest, etc.) is created and hashed.
3.  **Generate the Signature Value**: The hash of the `SignedProperties` is signed using your private key.
4.  **Construct the Full `ds:Signature` Structure**: This structure includes:
    - The digest of the original document.
    - The `SignedProperties` themselves.
    - The signature value (from step 3).
    - Information about the signing key and certificate.
5.  **Embed the Signature**: The complete `ds:Signature` structure is embedded within the `cac:UBLExtensions` of the UBL document, and a corresponding `cac:Signature` block is added to the main invoice structure.

The following sections detail how parts of this process can be achieved using helpers from this library.

### 1. Prepare Document for Hashing (Conceptual)

Before generating the main signature, the UBL document to be signed needs to be prepared. For an enveloped signature, this typically means serializing the document _without_ the `UBLExtensions` that will hold the signature and without the main `cac:Signature` block. The exact canonicalization and hashing process is crucial for interoperability.

The `myinvois-client` library's `generateDigitalSignatureJSON` (used internally by `buildSignatureExtension`) handles the creation of the document digest based on the provided `documentToSign` object and `documentTransformationKeys` (which defaults to exclude `UBLExtensions` and `Signature` from the top-level `Invoice` object for hashing).

```typescript
// Conceptual - this step is handled internally by generateDigitalSignatureJSON
// when you provide the 'documentToSign' parameter.

// import { prepareDocumentForHashing } from 'myinvois-client/ubl/json/digitalSignature'; // Adjust path as needed
// import { UBLJsonInvoiceDocumentV1_1 } from 'myinvois-client/ubl/json/invoice'; // Adjust path as needed

// async function getDocumentDigestBase64(invoiceDocument: UBLJsonInvoiceDocumentV1_1): Promise<string> {
//   // Keys to exclude as per MyInvois specification for document hashing
//   // For enveloped signatures, the Signature and UBLExtensions holding the signature are excluded.
//   const keysToExclude = ["UBLExtensions", "Signature"];
//   const documentBytes = await prepareDocumentForHashing(invoiceDocument, keysToExclude);

//   // 'yourHashingFunction' would be an implementation (e.g., using Web Crypto API for SHA-256)
//   // const digestBuffer = await crypto.subtle.digest('SHA-256', documentBytes);
//   // const digestBase64 = bufferToBase64(digestBuffer); // Implement bufferToBase64
//   // return digestBase64;
//   return "base64EncodedDocumentDigest"; // Placeholder
// }

// Usage:
// const documentToSign: UBLJsonInvoiceDocumentV1_1 = /* Your fully constructed V1.1 invoice, without the new signature yet */;
// const documentDigestBase64 = await getDocumentDigestBase64(documentToSign);
```

### 2. Create SignedProperties (Conceptual)

The `SignedProperties` (part of XAdES) contains metadata about the signature, such as signing time and a digest of the signing certificate. This structure is then itself hashed, and that hash is signed.

The `createSignedProperties` helper can construct this object.

```typescript
import {
  createSignedProperties,
  XadesSignedProperties,
} from "myinvois-client/ubl/json/digitalSignature"; // Adjust path as needed

// Assume you have these values:
const certificateDigestBase64 = "your_certificate_digest_base64"; // e.g., SHA-256 digest of your X.509 cert, then Base64
const issuerName = "CN=Your CA, O=Your Org, C=MY"; // From your certificate's Issuer field
const serialNumber = "1234567890ABCDEF"; // From your certificate's Serial Number
const signedPropsId = "xades-signed-props-id-123"; // A unique ID for this XML element

const signedProperties: XadesSignedProperties = createSignedProperties(
  certificateDigestBase64,
  issuerName,
  serialNumber,
  signedPropsId,
  new Date() // Signing time, defaults to now if omitted
);

// The string representation of these signedProperties (after canonical XML serialization)
// would then be hashed (e.g., SHA-256).
// const signedPropertiesXmlString = convertJsonToCanonicalXml(signedProperties); // Conceptual
// const signedPropertiesDigestBase64 = yourHashingFunction(new TextEncoder().encode(signedPropertiesXmlString));
// console.log("Signed Properties:", JSON.stringify(signedProperties, null, 2));
// console.log("Signed Properties Digest (Base64):", signedPropertiesDigestBase64); // This digest is what gets signed
```

### 3. Generate the Full DigitalSignature Structure

This step involves creating the complete `DigitalSignature` JSON object which includes the document digest (from step 1), the signed properties digest (from step 2), the actual signature value (result of signing the signed properties digest), and key/certificate information.

The `generateDigitalSignatureJSON` helper function orchestrates this. It takes the document to be signed, your private key, and certificate details, and performs the necessary hashing, signing, and structuring.

```typescript
import {
  generateDigitalSignatureJSON,
  DigitalSignature,
} from "myinvois-client/ubl/json/digitalSignature"; // Adjust path as needed
import { UBLJsonInvoiceDocumentV1_1 } from "myinvois-client/ubl/json/invoice"; // Adjust path as needed

// Assume you have these values from previous steps and your environment:
// const documentToSign: UBLJsonInvoiceDocumentV1_1 = /* Your V1.1 UBL Invoice object, prepared for signing */;
// const privateKey: CryptoKey = /* Your private signing key (e.g., from Web Crypto API or node:crypto) */;
// const signingCertificateBase64: string = /* Your X.509 certificate, PEM or DER, Base64 encoded */;
// const certDigestBase64: string = /* certificateDigestBase64 from Step 2 */;
// const certIssuerName: string = /* issuerName from Step 2 */;
// const certSerialNumber: string = /* serialNumber from Step 2 */;

async function getFullDigitalSignatureStructure(
  documentToSign: UBLJsonInvoiceDocumentV1_1,
  privateKey: CryptoKey,
  signingCertificateBase64: string,
  certDigestBase64: string,
  certIssuerName: string,
  certSerialNumber: string,
  documentTransformationKeys?: string[] // Optional: defaults to ["UBLExtensions", "Signature"]
): Promise<DigitalSignature> {
  const digitalSignatureObject = await generateDigitalSignatureJSON(
    documentToSign,
    privateKey,
    signingCertificateBase64,
    certDigestBase64,
    certIssuerName,
    certSerialNumber,
    documentTransformationKeys
  );
  return digitalSignatureObject;
}

// Example Usage (conceptual, assuming variables are populated):
// const digitalSignature = await getFullDigitalSignatureStructure(
//   documentToSign,
//   privateKey,
//   signingCertificateBase64,
//   certDigestBase64,
//   certIssuerName,
//   certSerialNumber
// );
// console.log("Full DigitalSignature JSON:", JSON.stringify(digitalSignature, null, 2));

// This 'digitalSignature' object is then wrapped into a UBLExtension
// by the buildSignatureExtension helper, which is used by createUblJsonInvoiceDocument.
```

### Summary

This detailed guide provides insight into the components and steps involved in creating a XAdES signature for UBL JSON documents. The `myinvois-client` library aims to simplify this by providing higher-level helpers:

- `createSignedProperties`: Helps create the `SignedProperties` structure.
- `generateDigitalSignatureJSON`: Orchestrates the creation of the full `ds:Signature` JSON structure, including performing cryptographic operations (hashing of document and signed properties, signing the signed properties digest).
- `buildSignatureExtension` (used by `createUblJsonInvoiceDocument`): Takes the output of `generateDigitalSignatureJSON` and wraps it into the required `UBLExtension` format.

For most use cases, providing `SignatureParams` to `createUblJsonInvoiceDocument` for UBL v1.1 invoices is the recommended and simplest approach.
