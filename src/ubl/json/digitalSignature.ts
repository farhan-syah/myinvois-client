// einvoice/src/security/digitalSignature.ts

// This helper function provides simple JSON minification as described by MyInvois:
// "minify the document by removing following elements from it: Whitespaces, Line breaks, Comments"
// JSON.stringify achieves whitespace/line break removal. Standard JSON parsing handles comments.
/**
 * Minifies a JSON object into a string by removing non-essential whitespaces and line breaks.
 * This function is typically used to prepare JSON for cryptographic operations where a canonical form is required.
 * @param obj The JSON object to minify.
 * @returns A minified JSON string.
 * @internal
 */
function jsonMinify(obj: any): string {
  return JSON.stringify(obj);
}

/**
 * Minifies a JSON object and then encodes it into a Uint8Array using UTF-8 encoding.
 * This is a common step before performing cryptographic hashing or signing operations on JSON data.
 * @param obj The JSON object to minify and encode.
 * @returns A Uint8Array representing the minified and UTF-8 encoded JSON.
 * @internal
 */
function jsonMinifyAndEncode(obj: any): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj));
}

// --- Certificate Profile Details (Informational) ---
/**
 * Describes the distinguished name (DN) components of an X.509 certificate.
 * This interface is primarily for informational or helper purposes when dealing with certificate data.
 */
export interface CertificateDistinguishedName {
  /** Common Name (CN) - e.g., domain name or individual's name. */
  commonName: string;
  /** Country (C) - two-letter country code. */
  country: string;
  /** Email address component of the DN. Optional. */
  emailAddress?: string;
  /** Organization (O) - legal name of the organization. */
  organization: string;
  /** Organization Identifier - specific identifier for the organization. */
  organizationIdentifier: string;
  /** Organizational Unit (OU) - division within the organization. Optional. */
  organizationalUnit?: string;
  /** Serial number component of the DN (distinct from certificate serial number). */
  serialNumber: string;
}

/**
 * Describes key usage extensions of an X.509 certificate.
 * Informational interface.
 */
export interface CertificateKeyUsage {
  /** Indicates if the certificate can be used for non-repudiation. */
  nonRepudiation: boolean;
}

/**
 * Describes enhanced key usage (EKU) extensions of an X.509 certificate.
 * Informational interface.
 */
export interface CertificateEnhancedKeyUsage {
  /** Indicates if the certificate can be used for document signing. */
  documentSigning: boolean;
}

// --- JSON Digital Signature Structures (Aligned with MyInvois observations) ---
// Attributes are direct properties. Complex elements are often wrapped in arrays.

// Helper interfaces for common MyInvois JSON value wrapping patterns
/** 
 * @internal
 * Helper for elements that are simple string values in JSON, wrapped as `{"_": "value"}`. 
 */
export interface StringValueWrapper {
  _: string;
}

/** 
 * @internal
 * Helper for algorithm identifier elements, often structured as `{"_": "", "Algorithm": "uri"}`.
 */
export interface AlgorithmWrapper {
  /** Typically an empty string in the MyInvois JSON examples. */
  _: string;
  /** The URI identifying the algorithm. */
  Algorithm: string;
}

export interface Transform {
  Algorithm: string; // Algorithm URI for the transform
  JSONPath?: string; // Placeholder for JSON-equivalent of XPath for more complex transforms
}

export interface Transforms {
  Transform: [Transform] | Transform[]; // Array of Transform objects
}

export interface Reference {
  Id?: string;
  URI: string;
  Type?: string; // Added: As per example (e.g., "http://uri.etsi.org/01903/v1.3.2#SignedProperties" or "")
  DigestMethod: [AlgorithmWrapper]; // Changed
  DigestValue: [StringValueWrapper]; // Changed: base64 encoded digest
}

export interface SignedInformation {
  SignatureMethod: [AlgorithmWrapper]; // Changed
  Reference: [Reference] | Reference[]; // Typically two
}

export interface SignatureValue {
  Id?: string;
  Value: string; // base64 encoded signature value ("Sig")
}

export interface XadesIssuerSerial {
  X509IssuerName: [StringValueWrapper]; // Changed
  X509SerialNumber: [StringValueWrapper]; // Changed
}

export interface X509Data {
  X509Certificate: [StringValueWrapper]; // Changed: base64 encoded X.509 certificate
  X509SubjectName?: [StringValueWrapper]; // Added: To align with PHP SDK's JSON output for KeyInfoX509Data
  X509IssuerSerial?: [XadesIssuerSerial]; // Added: To align with PHP SDK's JSON output for KeyInfoX509Data
}

export interface KeyInformation {
  X509Data: [X509Data];
}

export interface XadesCertDigest {
  DigestMethod: [AlgorithmWrapper]; // Changed
  DigestValue: [StringValueWrapper]; // Changed: base64 encoded cert digest ("CertDigest")
}

export interface XadesCert {
  CertDigest: [XadesCertDigest];
  IssuerSerial: [XadesIssuerSerial];
}

export interface XadesSigningCertificate {
  Cert: [XadesCert] | XadesCert[];
}

export interface XadesSignedSignatureProperties {
  SigningTime: [StringValueWrapper]; // Changed: ISO 8601 UTC DateTime
  SigningCertificate: [XadesSigningCertificate];
}

export interface XadesSignedProperties {
  Id: string; // e.g., "id-xades-signed-props"
  SignedSignatureProperties: [XadesSignedSignatureProperties];
}

export interface XadesQualifyingProperties {
  Target: string; // Reference to the Signature ID (ds:Signature/@Id)
  SignedProperties: [XadesSignedProperties];
}

export interface SignatureObject {
  XadesQualifyingProperties: [XadesQualifyingProperties];
}

export interface DigitalSignature {
  Id: string; // e.g., "DocSig"
  SignedInfo: [SignedInformation];
  SignatureValue: [SignatureValue];
  KeyInfo: [KeyInformation];
  Object?: [SignatureObject];
}

export interface UBLDocumentSignatureExtension {
  UBLDocumentSignatures: [
    {
      SignatureInformation: [
        {
          ID?: [StringValueWrapper]; // Added for UBL alignment
          ReferencedSignatureID?: [StringValueWrapper]; // Added for UBL alignment
          Signature: [DigitalSignature];
        },
      ];
    },
  ];
}

/**
 * Step 2 & 3 (partially): Apply transformations and canonicalize JSON document for hashing.
 * Removes specified keys and minifies the JSON.
 * @param originalDocument The full JSON document.
 * @param keysToExclude Top-level keys to remove (e.g., "UBLExtensions", "Signature" as per MyInvois Step 2).
 * @returns The minified JSON as a Uint8Array (this is the input for DocDigest generation).
 */
export async function prepareDocumentForHashing<T extends object>(
  originalDocument: T,
  keysToExclude: string[] = [],
): Promise<Uint8Array> {
  const documentCopy = JSON.parse(JSON.stringify(originalDocument)); // Deep clone

  // Step 2: Remove specified elements (simplified for top-level keys)
  for (const key of keysToExclude) {
    if (key in documentCopy) {
      delete (documentCopy as any)[key];
    }
  }

  // Step 3 (JSON part): Minify (removes whitespaces, line breaks; comments handled by JSON parsing)
  const minifiedDocumentJsonString = jsonMinify(documentCopy);
  return new TextEncoder().encode(minifiedDocumentJsonString);
}

/**
 * Step 6 (partially): Creates the XadesSignedProperties structure.
 * @param certificateDigestBase64 Base64 encoded digest of the signing certificate ("CertDigest").
 * @param issuerName Issuer name from the signing certificate.
 * @param serialNumber Serial number of the signing certificate.
 * @param id The ID for this XadesSignedProperties structure.
 * @param signingTime The UTC time of signing.
 * @returns The XadesSignedProperties structure.
 */
export function createSignedProperties(
  certificateDigestBase64: string, // CertDigest
  issuerName: string,
  serialNumber: string,
  id: string,
  signingTime: Date = new Date(),
): XadesSignedProperties {
  return {
    Id: id,
    SignedSignatureProperties: [
      {
        SigningTime: [{ _: signingTime.toISOString() }],
        SigningCertificate: [
          {
            Cert: [
              {
                CertDigest: [
                  {
                    DigestMethod: [
                      {
                        _: "",
                        Algorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
                      },
                    ],
                    DigestValue: [{ _: certificateDigestBase64 }],
                  },
                ],
                IssuerSerial: [
                  {
                    X509IssuerName: [{ _: issuerName }],
                    X509SerialNumber: [{ _: serialNumber }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Generates the full DigitalSignature structure according to MyInvois specifications.
 *
 * @param documentToSign The JSON document (e.g., UBL Invoice) - output of Step 1.
 * @param privateKey The signer's private key as a CryptoKey object.
 * @param signingCertificateBase64 The signer\'s X.509 certificate, base64 encoded (for KeyInfo).
 * @param certDigestBase64 Base64 SHA-256 digest of the signing certificate ("CertDigest" - Step 5 output).
 * @param certIssuerName Issuer name from the signing certificate.
 * @param certSerialNumber Serial number of the signing certificate.
 * @param documentTransformationKeys Keys to exclude from documentToSign (Step 2, e.g., ["UBLExtensions", "Signature"]).
 * @returns The DigitalSignature structure.
 */
export async function generateDigitalSignatureJSON<T extends object>(
  documentToSign: T, // Input for Step 2
  privateKey: CryptoKey,
  signingCertificateBase64: string, // For Step 8 (X509Certificate)
  certDigestBase64: string, // Input from Step 5 (CertDigest)
  certIssuerName: string, // For Step 6 & X509Data
  certSerialNumber: string, // For Step 6 & X509Data
  documentTransformationKeys: string[] = ["UBLExtensions", "Signature"], // Default exclusions for Step 2
): Promise<DigitalSignature> {
  const signatureId = `DocSig-${Date.now()}`;
  const signedPropertiesId = `id-xades-signed-props-${Date.now()}`;
  const documentReferenceId = `id-doc-signed-data-${Date.now()}`; // As per Step 8 UBL path
  const signatureValueId = `DocSigValue-${Date.now()}`;

  // Step 2 & 3 (JSON parts): Apply transformations, canonicalize (minify), and hash document
  const documentBytesToHash = await prepareDocumentForHashing(
    documentToSign,
    documentTransformationKeys,
  );
  const documentDigestSha256 = await crypto.subtle.digest(
    "SHA-256",
    documentBytesToHash,
  );
  const documentDigestBase64 = btoa(
    String.fromCharCode(...new Uint8Array(documentDigestSha256)),
  ); // "DocDigest"

  // Step 6: Populate the signed properties section
  const signedPropertiesObject = createSignedProperties(
    certDigestBase64, // CertDigest from Step 5
    certIssuerName,
    certSerialNumber,
    signedPropertiesId, // ID for this XadesSignedProperties block
    new Date(), // SigningTime
  );

  // Step 7: Generate Signed Properties Hash ("PropsDigest")
  const signedPropertiesBytes = jsonMinifyAndEncode(signedPropertiesObject); // Minify SignedProperties
  const signedPropertiesHashSha256 = await crypto.subtle.digest(
    "SHA-256",
    signedPropertiesBytes,
  );
  const signedPropertiesDigestBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signedPropertiesHashSha256)),
  ); // "PropsDigest"

  // Construct SignedInfo (part of Step 8 assembly)
  const signedInfo: SignedInformation = {
    SignatureMethod: [
      { _: "", Algorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" },
    ],
    Reference: [
      {
        // Reference to the main document
        URI: "",
        Id: documentReferenceId, // Matches Id in Step 8 UBL Path
        Type: "", // As per example for document reference
        DigestMethod: [
          { _: "", Algorithm: "http://www.w3.org/2001/04/xmlenc#sha256" },
        ],
        DigestValue: [{ _: documentDigestBase64 }], // "DocDigest" from Step 3
      },
      {
        // Reference to SignedProperties
        URI: `#${signedPropertiesId}`, // Matches URI in Step 8 UBL Path (suffix is the Id)
        Type: "http://uri.etsi.org/01903/v1.3.2#SignedProperties", // As per example for SignedProperties reference
        DigestMethod: [
          { _: "", Algorithm: "http://www.w3.org/2001/04/xmlenc#sha256" },
        ],
        DigestValue: [{ _: signedPropertiesDigestBase64 }], // "PropsDigest" from Step 7
      },
    ],
  };

  // Step 4: Sign the document digest (actually, sign the canonicalized document bytes)
  // "Sig = Sign the generated invoice hash (DocDigest) with RSA-SHA256"
  // crypto.subtle.sign with RSASSA-PKCS1-v1_5 and hash:"SHA-256" expects the *data to be hashed*,
  // so we provide documentBytesToHash (output of Step 2/3 before final hashing for DocDigest).
  const signatureValueArrayBuffer = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    privateKey,
    documentBytesToHash, // This is the (transformed + minified) document data
  );
  const signatureValueBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signatureValueArrayBuffer)),
  ); // "Sig"

  // Step 8: Populate the information in the document to create the signed document structure
  const digitalSignature: DigitalSignature = {
    Id: signatureId,
    SignedInfo: [signedInfo],
    SignatureValue: [
      {
        Id: signatureValueId,
        Value: signatureValueBase64, // "Sig"
      },
    ],
    KeyInfo: [
      {
        X509Data: [
          {
            X509Certificate: [{ _: signingCertificateBase64 }], // "Certificate"
            // Adding X509SubjectName and X509IssuerSerial as per PHP SDK's KeyInfoX509Data structure
            // Assuming certIssuerName can be used for X509SubjectName for this example
            X509SubjectName: [{ _: certIssuerName }],
            X509IssuerSerial: [
              {
                X509IssuerName: [{ _: certIssuerName }],
                X509SerialNumber: [{ _: certSerialNumber }],
              },
            ],
          },
        ],
      },
    ],
    Object: [
      {
        XadesQualifyingProperties: [
          {
            Target: `#${signatureId}`, // Target is ds:Signature/@Id (prefix with #)
            SignedProperties: [signedPropertiesObject], // Contains CertDigest, SigningTime etc. from Step 6
          },
        ],
      },
    ],
  };

  return digitalSignature;
}
