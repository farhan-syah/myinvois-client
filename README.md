# myinvois-client

[![NPM Version](https://img.shields.io/npm/v/myinvois-client)
](https://www.npmjs.com/package/myinvois-client)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Publish Package to npm](https://github.com/farhan-syah/myinvois-client/actions/workflows/publish-npm.yml/badge.svg)](https://github.com/farhan-syah/myinvois-client/actions/workflows/publish-npm.yml)

A TypeScript client library for interacting with the MyInvois REST API. This package aims to provide an easy way to integrate MyInvois services into your Node.js or TypeScript projects.

## Installation

```bash
bun install myinvois-client
# or
npm install myinvois-client
```

## Understanding E-Invoicing in Malaysia and MyInvois

### What is MyInvois?

MyInvois is an electronic invoicing system implemented by the Inland Revenue Board of Malaysia (LHDN) to replace traditional paper or PDF invoices. It requires that nearly all business transactions be reported to LHDN through the MyInvois system for validation.

### Regulations Overview

The mandatory implementation of e-invoicing in Malaysia begins in stages from August 2024, based on business size. It applies to all types of businesses and transactions within Malaysia, including those by foreign entities with a local presence. The system requires electronic issuance, reception, and storage of invoices.

### How to Use MyInvois

Businesses can interact with the MyInvois system via three primary methods:

1.  **MyInvois Portal (Manual):** Suitable for small businesses or low-volume transactions, involving manual data entry via LHDN's portal.
2.  **API Integration (Direct):** Designed for larger businesses with existing IT infrastructure, allowing direct, automated submission and retrieval of e-invoices via API calls. This method requires technical development.
3.  **Through 3rd Party ERP or Accounting Software:** The most common method for businesses already using accounting or ERP software, where the software handles the e-invoicing submission process automatically.

### Why Use This Library?

This `myinvois-client` library is specifically for businesses and developers choosing the **API Integration (Direct)** method. It provides a robust, TypeScript-first SDK that abstracts away the complexities of interacting with the MyInvois REST API. Instead of building the API communication, authentication, UBL document structure handling, and digital signature preparation logic from scratch, developers can leverage this library. This significantly reduces development time and effort, offering a reliable alternative to relying solely on third-party ERP vendors or middleware services for direct API integration.

## Features

- TypeScript-first: Written in TypeScript for strong typing and better developer experience.
- Provides convenient methods for accessing MyInvois API endpoints via `client.auth` and `client.documents`.
- Includes UBL JSON document builders with strong typing and validation.
- Easy-to-use helper functions for creating UBL invoices and managing digital signatures.
- Support for both UBL Invoice v1.0 and v1.1 formats.
- Easy to integrate and use.
- Supports PROD and SANDBOX environments.

## Example Projects and Resources

For complete, working examples of using this library, check out:

- [Integration Test Example](examples/tests/integrationTest.ts) - A full end-to-end example showing authentication, document creation, and submission
- [Other examples](examples) - Other examples

## Usage

### 1. Instantiate the Client

First, import and instantiate the `MyInvoisClient` with your client ID, client secret. You can also specify the environment (`PROD` or `SANDBOX`). If no environment is specified, it defaults to `PROD`.

```typescript
import { MyInvoisClient } from "myinvois-client";

// Replace with your actual client ID and client secret
const CLIENT_ID = "your_client_id";
const CLIENT_SECRET = "your_client_secret";

if (CLIENT_ID === "your_client_id" ?? CLIENT_SECRET === "your_client_secret") {
  console.warn(
    "Please replace 'your_client_id' and 'your_client_secret' with your actual credentials.",
  );
  // process.exit(1); // Consider exiting if credentials are not set
}

// Instantiate for PROD environment (default)
const myInvoiceClientProd = new MyInvoisClient(CLIENT_ID, CLIENT_SECRET);

// Or, explicitly for PROD:
// const myInvoiceClientProd = new MyInvoisClient(CLIENT_ID, CLIENT_SECRET, "PROD");

// Instantiate for SANDBOX environment
const myInvoiceClientSandbox = new MyInvoisClient(
  CLIENT_ID,
  CLIENT_SECRET,
  "SANDBOX",
);
```

Make sure to replace `"your_client_id"` and `"your_client_secret"` with your actual credentials provided by MyInvois.

**Note on Client Instantiation for Intermediaries:**
When acting as an intermediary for multiple taxpayers, it is a best practice to instantiate a new `MyInvoisClient` for each taxpayer session or ensure that the client's internal state (specifically the `onBehalfOfTIN` associated with the current token) is correctly managed if a single client instance is reused. The client has been updated to re-authenticate if the `onBehalfOfTIN` changes for `loginAsIntermediary` calls, but creating separate instances can provide clearer separation of concerns in complex applications.

### 2. Authenticate and Get Access Token

#### Taxpayer Login

To authenticate as a taxpayer and retrieve an access token:

```typescript
// Assuming myInvoiceClient is already instantiated as shown above

const token = await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
```

#### Intermediary Login

To authenticate as an intermediary system on behalf of a taxpayer:

```typescript
// Assuming myInvoiceClient is already instantiated with intermediary credentials

const token = await myInvoiceClient.auth.loginAsIntermediary(
  ON_BEHALF_OF_TIN,
  "InvoicingAPI",
);
```

**Note:** For intermediary login, ensure you instantiate `MyInvoisClient` with the intermediary system's client ID and secret.

### 3. Access API Endpoints

Once the client is instantiated (and authentication has occurred for the first operation or explicitly called), you can access other API methods.
The client will automatically manage the access token (requesting or refreshing it as needed).

#### 3.1 Get All Document Types

This functionality allows you to retrieve a list of all available document types.

```typescript
// Assuming myInvoiceClient is already instantiated
const documentTypes = await myInvoiceClient.documents.getAllDocumentTypes();
```

#### 3.2 Get Document Type By ID

This functionality allows you to retrieve the details of a single document type by its unique ID.

```typescript
// Assuming myInvoiceClient is already instantiated
const documentTypeId = 45; // Replace with an actual document type ID
const documentType =
  await myInvoiceClient.documents.getDocumentTypeById(documentTypeId);
```

#### 3.3 Get Document Type Version By ID

This functionality allows you to retrieve the details of a specific version of a document type.

```typescript
// Assuming myInvoiceClient is already instantiated
const docTypeId = 45; // Replace with an actual document type ID
const versionId = 41235; // Replace with an actual version ID for the document type
const documentTypeVersion =
  await myInvoiceClient.documents.getDocumentTypeVersionById(
    docTypeId,
    versionId,
  );
```

#### 3.4 Validate Taxpayer TIN

This API allows you to validate a taxpayer's Tax Identification Number (TIN) along with their ID Type (NRIC, Passport, BRN, Army) and ID value. It returns `true` if the combination is valid and found, and throws an error otherwise (e.g., for HTTP 400 BadArgument or 404 Not Found).

```typescript
// Assuming myInvoiceClient is already instantiated
const tinToValidate = "C25845632020";
const idTypeForValidation = "BRN"; // Can be "NRIC", "PASSPORT", "BRN", or "ARMY"
const idValueForValidation = "201901234567";
const isValid = await myInvoiceClient.taxpayer.validateTaxpayerTIN(
  tinToValidate,
  idTypeForValidation,
  idValueForValidation,
);
```

#### 3.5 Submit Documents

This functionality allows you to submit one or more documents (e.g., Invoices, Credit Notes, Debit Notes) to the MyInvois system. Documents are grouped into a submission, and each document must adhere to the defined structure for its type and version.

```typescript
// Assuming myInvoiceClient is already instantiated

// Example: Submitting a single JSON document as a taxpayer
const documentToSubmit = {
  format: "JSON" as "JSON", // or "XML"
  // For a real implementation, you would generate the base64 document string and its hash
  document: btoa(
    JSON.stringify({ invoiceDetails: "Sample e-Invoice Content" }),
  ),
  documentHash:
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // Placeholder hash for example
  codeNumber: "ERP-INV-12345",
};

const submissionRequest = {
  documents: [documentToSubmit],
};

// For taxpayer submission:
const submissionResponse =
  await myInvoiceClient.documents.submitDocuments(submissionRequest);

submissionResponse.acceptedDocuments.forEach((doc) => {
  console.log(
    `Accepted: CodeNumber=${doc.invoiceCodeNumber}, UUID=${doc.uuid}`,
  );
});
submissionResponse.rejectedDocuments.forEach((doc) => {
  console.log(
    `Rejected: CodeNumber=${doc.invoiceCodeNumber}, Error: ${doc.error.errorMS ?? doc.error.error}`,
  );
});
```

## Creating UBL Documents

This library provides two approaches for creating UBL JSON documents:

### 1. Using the Helper Functions (Recommended)

The helper functions provide a simplified interface for creating UBL documents with proper structure and validation:

```typescript
import { createUblJsonInvoiceDocument } from "myinvois-client/ubl/helper/builder";
import { CreateInvoiceDocumentParams } from "myinvois-client/ubl/helper/params";

// Define your invoice parameters using the strongly-typed interface
const invoiceParams: CreateInvoiceDocumentParams = {
  id: "INV-2023-001",
  issueDate: "2023-10-15",
  issueTime: "14:30:00Z",
  invoiceTypeCode: "01", // Standard Invoice
  documentCurrencyCode: "MYR",

  // Supplier information
  supplier: {
    TIN: "C1234567890",
    identificationNumber: "201901234567",
    identificationScheme: "BRN",
    legalName: "ABC Trading Sdn. Bhd.",
    telephone: "+60123456789",
    address: {
      addressLines: ["123, Jalan Business", "Taman Enterprise"],
      cityName: "Kuala Lumpur",
      postalZone: "50000",
      countrySubentityCode: "14", // W.P. Kuala Lumpur
      countryCode: "MYS",
    },
    industryClassificationCode: "46510",
    industryClassficationName: "Wholesale of computers and software",
  },

  // Customer information
  customer: {
    TIN: "C0987654321",
    identificationNumber: "202001234567",
    identificationScheme: "BRN",
    legalName: "XYZ Corporation Bhd.",
    telephone: "+60198765432",
    address: {
      addressLines: ["456, Jalan Corporate", "Business Park"],
      cityName: "Petaling Jaya",
      postalZone: "47800",
      countrySubentityCode: "10", // Selangor
      countryCode: "MYS",
    },
  },

  // Invoice lines
  invoiceLines: [
    {
      id: "1",
      quantity: 5,
      unitCode: "UNT",
      unitPrice: 100.0,
      subtotal: 500.0,
      itemDescription: "Laptop Model X1",
      itemCommodityClassification: {
        code: "001", // Product code
        listID: "CLASS",
      },
    },
  ],

  // Tax information
  taxTotal: {
    totalTaxAmount: 30.0,
    taxSubtotals: [
      {
        taxableAmount: 500.0,
        taxAmount: 30.0,
        taxCategoryCode: "01", // Sales Tax
        percent: 6,
      },
    ],
  },

  // Monetary totals
  legalMonetaryTotal: {
    lineExtensionAmount: 500.0,
    taxExclusiveAmount: 500.0,
    taxInclusiveAmount: 530.0,
    payableAmount: 530.0,
  },
};

// Create a version 1.0 invoice
const ublInvoiceV10 = createUblJsonInvoiceDocument(invoiceParams, "1.0");

// Create a version 1.1 invoice
const ublInvoiceV11 = createUblJsonInvoiceDocument(invoiceParams, "1.1");
```

### 2. Manual Construction (Advanced)

For more complex scenarios or when you need full control over the UBL structure:

```typescript
import { UBLJsonInvoiceDocumentV1_1 } from "myinvois-client/ubl/json/invoice";

// Create the UBL document structure manually
const manualUblInvoice: UBLJsonInvoiceDocumentV1_1 = {
  _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
  _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
  Invoice: [
    {
      ID: [{ _: "INV-2023-001" }],
      IssueDate: [{ _: "2023-10-15" }],
      IssueTime: [{ _: "14:30:00Z" }],
      InvoiceTypeCode: [{ _: "01", listVersionID: "1.1" }],
      DocumentCurrencyCode: [{ _: "MYR" }],

      // You'll need to define all the nested structures manually
      AccountingSupplierParty: [
        {
          Party: [
            {
              IndustryClassificationCode: [
                { _: "46510", name: "Wholesale of computers and software" },
              ],
              PartyLegalEntity: [
                {
                  RegistrationName: [{ _: "ABC Trading Sdn. Bhd." }],
                },
              ],
              // ... more supplier details
            },
          ],
        },
      ],

      // ... remaining invoice structure

      // For v1.1, you need to include UBLExtensions and Signature
      UBLExtensions: [],
      Signature: [
        {
          ID: [{ _: "urn:oasis:names:specification:ubl:signature:Invoice" }],
          SignatureMethod: [
            { _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades" },
          ],
        },
      ],
    },
  ],
};
```

The manual approach requires deep understanding of the UBL structure but offers complete flexibility for advanced scenarios.

## Digital Signatures (for UBL Invoice v1.1)

For UBL Invoice v1.1, digital signatures are required. This library provides helpers to create the necessary signature structures. You will need to provide your own cryptographic functions for hashing and signing, as well as your X.509 certificate details.

### 1. Prepare Document for Hashing

Before generating the main signature, the document needs to be prepared by removing specific fields (like `UBLExtensions` and `Signature` itself) and then minified.

```typescript
import { prepareDocumentForHashing } from 'myinvois-client/ubl/json/digitalSignature';
import { UBLJsonInvoiceDocumentV1_1 } from 'myinvois-client/ubl/json/invoice'; // Your full invoice object

async function getDocumentBytesToHash(invoiceDocument: UBLJsonInvoiceDocumentV1_1): Promise<Uint8Array> {
  // Keys to exclude as per MyInvois specification for document hashing
  const keysToExclude = ["UBLExtensions", "Signature"];
  const documentBytes = await prepareDocumentForHashing(invoiceDocument, keysToExclude);
  return documentBytes;
}

// Usage:
const documentToSign: UBLJsonInvoiceDocumentV1_1 = ...; // Your fully constructed V1.1 invoice
const documentBytes = await getDocumentBytesToHash(documentToSign);
const documentDigestBase64 = yourHashingFunction(documentBytes); // e.g., SHA-256 then Base64
```

### 2. Create SignedProperties

The `SignedProperties` object contains metadata about the signature, such as signing time and a digest of the signing certificate.

```typescript
import {
  createSignedProperties,
  XadesSignedProperties,
} from "myinvois-client/ubl/json/digitalSignature";

// Assume you have these values:
const certificateDigestBase64 = "your_certificate_digest_base64"; // SHA-256 digest of your X.509 cert, then Base64
const issuerName = "CN=Your CA, O=Your Org, C=MY"; // From your certificate
const serialNumber = "1234567890ABCDEF"; // From your certificate
const signedPropsId = "xades-signed-props-123"; // A unique ID for this element

const signedProperties: XadesSignedProperties = createSignedProperties(
  certificateDigestBase64,
  issuerName,
  serialNumber,
  signedPropsId,
  new Date(), // Signing time, defaults to now if omitted
);

// const signedPropertiesBytes = new TextEncoder().encode(JSON.stringify(signedProperties));
// const signedPropertiesDigestBase64 = yourHashingFunction(signedPropertiesBytes); // e.g., SHA-256 then Base64
```

### 3. Generate the Full DigitalSignature Structure

This involves creating the complete `DigitalSignature` JSON object which includes the document digest, signed properties digest, the signature value, and key information.

```typescript
import {
  generateDigitalSignatureJSON,
  DigitalSignature,
} from "myinvois-client/ubl/json/digitalSignature";
import { UBLJsonInvoiceDocumentV1_1 } from "myinvois-client/ubl/json/invoice";

// Assume you have these values from previous steps and your environment:
const documentToSign: UBLJsonInvoiceDocumentV1_1 = ...; // Your V1.1 UBL Invoice object
const privateKey: CryptoKey = ...; // Your private signing key (e.g., from Web Crypto API)
const signingCertificateBase64: string = ...; // Your X.509 certificate, Base64 encoded
const certDigestBase64: string = ...; // Output from hashing your certificate (Step 5 in MyInvois docs)
const certIssuerName: string = ...; // Issuer name from your certificate
const certSerialNumber: string = ...; // Serial number from your certificate

async function getFullDigitalSignature(
  documentToSign: UBLJsonInvoiceDocumentV1_1,
  privateKey: CryptoKey,
  signingCertificateBase64: string,
  certDigestBase64: string,
  certIssuerName: string,
  certSerialNumber: string,
): Promise<DigitalSignature> {
  const digitalSignature = await generateDigitalSignatureJSON(
    documentToSign,
    privateKey,
    signingCertificateBase64,
    certDigestBase64,
    certIssuerName,
    certSerialNumber,
  );
  return digitalSignature;
}

// Once you have the digitalSignature object, you would typically embed it into the
// UBLExtensions section of your UBLJsonInvoiceDocumentV1_1 object.
```

For a complete example of how to use this client, refer to the [Examples](examples)
