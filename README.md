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

- [Integration Test Example](examples/tests/integrationTest.ts) - A full end-to-end example showing authentication, document creation, and submission.
- [Manual UBL Construction Guide](examples/manualUblConstruction.md) - For advanced users needing to build UBL JSON manually from scratch.
- [Detailed Digital Signature Guide](examples/detailedDigitalSignatureGuide.md) - Explains the underlying mechanics and manual steps for creating digital signatures for UBL Invoice v1.1.
- [Invoice Submission Flow Example](examples/invoiceSubmission.md) - A step-by-step guide on the invoice submission process, including using helper functions.
- [Other examples](examples) - Additional miscellaneous examples.

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
The `MyInvoisClient` can optionally be instantiated with a Redis client to cache access tokens. This can improve performance by reducing the number of calls to the authentication server. The Redis client must implement the `MyInvoisRedisClient` interface, which includes `get` and `set` methods for interacting with the Redis server. We recommend using a library like `redis` or `ioredis` to create the Redis client.

const myInvoiceClientSandbox = new MyInvoisClient(
  CLIENT_ID,
  CLIENT_SECRET,
  "SANDBOX"
);

// Optional: Enable Redis caching (requires ioredis or similar)
import Redis from 'ioredis';

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
});

const myInvoiceClientWithCache = new MyInvoisClient(
  CLIENT_ID,
  CLIENT_SECRET,
  "SANDBOX",
  redisClient // Pass the Redis client instance
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
  "InvoicingAPI"
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
    versionId
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
  idValueForValidation
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
    JSON.stringify({ invoiceDetails: "Sample e-Invoice Content" })
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
    `Accepted: CodeNumber=${doc.invoiceCodeNumber}, UUID=${doc.uuid}`
  );
});
submissionResponse.rejectedDocuments.forEach((doc) => {
  console.log(
    `Rejected: CodeNumber=${doc.invoiceCodeNumber}, Error: ${doc.error.errorMS ?? doc.error.error}`
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
    industryClassificationName: "Wholesale of computers and software",
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

// Create a version 1.0 invoice (does not use signature)
// Note: createUblJsonInvoiceDocument is an async function
async function generateInvoices() {
  const ublInvoiceV10 = await createUblJsonInvoiceDocument(
    invoiceParams,
    "1.0"
  );
  console.log("Generated UBL Invoice v1.0:", ublInvoiceV10);

  // For UBL v1.1, a digital signature is mandatory. Provide the 'signature' parameter.
  // Ensure you have the necessary cryptographic materials (e.g., privateKey, certificate).
  const invoiceParamsWithSignature: CreateInvoiceDocumentParams = {
    ...invoiceParams, // Spread the common parameters
    // --- Signature Parameters (for UBL v1.1 only) ---
    // The 'documentToSign' property is handled internally by the builder.
    signature: {
      privateKey: {} as CryptoKey, // Replace with your actual CryptoKey object for signing
      signingCertificateBase64: "YOUR_BASE64_ENCODED_SIGNING_CERTIFICATE",
      certificateDigestBase64: "YOUR_BASE64_ENCODED_CERTIFICATE_DIGEST",
      certificateIssuerName: "CN=YourIssuer,O=YourOrg,C=MY", // Example Issuer Name
      certificateSerialNumber: "1234567890ABCDEF", // Example Serial Number
    },
  };

  // Create a version 1.1 invoice. This requires signature parameters for the embedded digital signature.
  const ublSignedInvoiceV11 = await createUblJsonInvoiceDocument(
    invoiceParamsWithSignature,
    "1.1"
  );
  console.log("Generated Signed UBL Invoice v1.1:", ublSignedInvoiceV11);
}

// Call the async function to see the output (in a real scenario)
// generateInvoices().catch(console.error);
```

The manual approach requires deep understanding of the UBL structure but offers complete flexibility for advanced scenarios.

For a complete example of how to use this client, refer to the [Examples](examples)
