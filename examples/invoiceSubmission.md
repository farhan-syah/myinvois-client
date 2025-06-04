# Example: Invoice Submission Flow

This document provides a comprehensive example of how to use the `myinvois-client` library to construct an e-Invoice, (conceptually) sign it, and submit it to the MyInvois system. This flow assumes you are submitting as a taxpayer.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.
- A way to generate a digital signature for your invoice JSON (this example will show where this step fits but will not perform actual cryptographic signing).
- Utility functions for Base64 encoding and SHA256 hashing appropriate for your environment (Node.js or browser).

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in.
2.  **Constructing the Invoice**: Create a JSON object representing the invoice according to the UBL v1.1 standard (as defined in `einvoice/src/ubl/invoice.v1_1.types.ts`).
3.  **Digital Signature (Conceptual)**: Generate a digital signature for the invoice JSON and embed it within the `ext:UBLExtensions` element.
4.  **Preparing for Submission**:
    - Convert the complete invoice JSON (with signature) to a UTF-8 string.
    - Calculate the SHA256 hash of this JSON string.
    - Base64 encode the JSON string.
5.  **Submitting the Document**: Use `client.documents.submitDocuments()` to send the prepared document.
6.  **Handling the Response**: Process the submission acknowledgment from the API.

---

## Step 1: Client Setup and Authentication

First, import and instantiate the `MyInvoisClient`. Then, authenticate to get an access token.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path as needed
// For UBL types:
import { UBLInvoiceV1_1 } from "myinvois-client/ubl/invoice.v1_1.types"; // Adjust path
import { UBLDocumentSignatureExtension } from "myinvois-client/security/digitalSignature"; // Adjust path

// --- Helper function implementations for Node.js environment ---

import * as crypto from "crypto"; // Import Node.js crypto module

function calculateSHA256(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function encodeBase64(text: string): string {
  return Buffer.from(text, "utf8").toString("base64");
}

async function submitInvoiceExample() {
  // Replace with your actual credentials and environment
  const CLIENT_ID = "your_client_id";
  const CLIENT_SECRET = "your_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX"; // or "PROD"

  if (
    CLIENT_ID === "your_client_id" ||
    CLIENT_SECRET === "your_client_secret"
  ) {
    console.warn(
      "Please replace 'your_client_id' and 'your_client_secret' with your actual credentials."
    );
    // return; // Optional: exit if credentials are not set
  }

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT
  );

  try {
    console.log("Authenticating as taxpayer...");
    // Scope "InvoicingAPI" is typically needed for document operations.
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    // Proceed to Step 2: Constructing the Invoice
    // Example using helperInvoiceV1_1
    await constructAndSubmitInvoice(myInvoiceClient, helperInvoiceV1_1, "1.1");

    // Example using helperInvoiceV1_0
    // await constructAndSubmitInvoice(myInvoiceClient, helperInvoiceV1_0, "1.0");

    // Example using manualInvoiceV1_1
    // await constructAndSubmitInvoice(myInvoiceClient, manualInvoiceV1_1, "1.1");

    // Example using manualInvoiceV1_0
    // await constructAndSubmitInvoice(myInvoiceClient, manualInvoiceV1_0, "1.0");
  } catch (error) {
    console.error("Error during client setup or authentication:", error);
  }
}

// We will define constructAndSubmitInvoice next.
// submitInvoiceExample(); // Call the main function
```

## Step 2: Constructing the Invoice (JSON UBL v1.1)

There are multiple ways to construct the invoice JSON:

1.  **Manual Construction (Advanced)**: You create the JSON object directly, ensuring it conforms to the UBL v1.1 or v1.0 standard.
2.  **Using the Helper Functions (Recommended)**: The `myinvois-client` library provides helper functions to simplify the creation of UBL documents with proper structure and validation.

### Manual Construction (UBL v1.1)

```typescript
// Example of manual construction of UBL v1.1 invoice
import { UBLJsonInvoiceDocumentV1_1 } from "myinvois-client/ubl/json/invoice";

const manualInvoiceV1_1: UBLJsonInvoiceDocumentV1_1 = {
  _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
  _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
  Invoice: [
    {
      // ... (rest of the UBL v1.1 invoice content - see einvoice/src/ubl/json/invoice.ts)
      ID: [{ _: "INV-2024-MANUAL-001" }],
      IssueDate: [{ _: "2024-08-01" }],
      IssueTime: [{ _: "12:00:00Z" }],
      InvoiceTypeCode: [{ _: "01", listVersionID: "1.1" }],
      DocumentCurrencyCode: [{ _: "MYR" }],
      AccountingSupplierParty: [], // Add supplier details
      AccountingCustomerParty: [], // Add customer details
      InvoiceLine: [], // Add invoice lines
      TaxTotal: [], // Add tax totals
      LegalMonetaryTotal: [], // Add monetary totals
      UBLExtensions: [], // Add UBL extensions
      Signature: [], // Add signature
    },
  ],
};
```

### Manual Construction (UBL v1.0)

```typescript
// Example of manual construction of UBL v1.0 invoice
import { UBLJsonInvoiceDocumentV1_0 } from "myinvois-client/ubl/json/invoice";

const manualInvoiceV1_0: UBLJsonInvoiceDocumentV1_0 = {
  _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
  _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
  Invoice: [
    {
      // ... (rest of the UBL v1.0 invoice content - see einvoice/src/ubl/json/invoice.ts)
      ID: [{ _: "INV-2024-MANUAL-001" }],
      IssueDate: [{ _: "2024-08-01" }],
      IssueTime: [{ _: "12:00:00Z" }],
      InvoiceTypeCode: [{ _: "01", listVersionID: "1.0" }],
      DocumentCurrencyCode: [{ _: "MYR" }],
      AccountingSupplierParty: [], // Add supplier details
      AccountingCustomerParty: [], // Add customer details
      InvoiceLine: [], // Add invoice lines
      TaxTotal: [], // Add tax totals
      LegalMonetaryTotal: [], // Add monetary totals
    },
  ],
};
```

### Using the Helper Functions (UBL v1.0)

```typescript
import { createUblJsonInvoiceDocument } from "myinvois-client/ubl/helper/builder";
import { CreateInvoiceDocumentParams } from "myinvois-client/ubl/helper/params";

const invoiceParamsV1_0: CreateInvoiceDocumentParams = {
  id: "INV-2024-HELPER-001",
  issueDate: "2024-08-01",
  issueTime: "12:00:00Z",
  invoiceTypeCode: "01",
  documentCurrencyCode: "MYR",
  supplier: {
    TIN: "C12345678900",
    identificationNumber: "202001000001",
    identificationScheme: "BRN",
    legalName: "Supplier Alpha Sdn. Bhd.",
    telephone: "+60312345678",
    address: {
      addressLines: ["Level 10, Tower A, Dataran Alpha"],
      cityName: "Kuala Lumpur",
      postalZone: "50000",
      countrySubentityCode: "14",
      countryCode: "MYS",
    },
    industryClassificationCode: "62010",
    industryClassificationName: "Computer programming activities",
  },
  customer: {
    TIN: "C98765432100",
    identificationNumber: "202101000002",
    identificationScheme: "BRN",
    legalName: "Buyer Beta Bhd.",
    telephone: "+60398765432",
    address: {
      addressLines: ["No. 123, Jalan Beta 1"],
      cityName: "Petaling Jaya",
      postalZone: "46000",
      countrySubentityCode: "10",
      countryCode: "MYS",
    },
  },
  invoiceLines: [], // Add invoice lines
  taxTotal: {
    totalTaxAmount: 10.0,
    taxSubtotals: [], // Add tax subtotals
  },
  legalMonetaryTotal: {
    lineExtensionAmount: 100.0,
    taxExclusiveAmount: 100.0,
    taxInclusiveAmount: 110.0,
    payableAmount: 110.0,
  },
};

const helperInvoiceV1_0 = createUblJsonInvoiceDocument(
  invoiceParamsV1_0,
  "1.0"
);

const invoiceParamsV1_1: CreateInvoiceDocumentParams = {
  id: "INV-2024-HELPER-001",
  issueDate: "2024-08-01",
  issueTime: "12:00:00Z",
  invoiceTypeCode: "01",
  documentCurrencyCode: "MYR",
  supplier: {
    TIN: "C12345678900",
    identificationNumber: "202001000001",
    identificationScheme: "BRN",
    legalName: "Supplier Alpha Sdn. Bhd.",
    telephone: "+60312345678",
    address: {
      addressLines: ["Level 10, Tower A, Dataran Alpha"],
      cityName: "Kuala Lumpur",
      postalZone: "50000",
      countrySubentityCode: "14",
      countryCode: "MYS",
    },
    industryClassificationCode: "62010",
    industryClassificationName: "Computer programming activities",
  },
  customer: {
    TIN: "C98765432100",
    identificationNumber: "202101000002",
    identificationScheme: "BRN",
    legalName: "Buyer Beta Bhd.",
    telephone: "+60398765432",
    address: {
      addressLines: ["No. 123, Jalan Beta 1"],
      cityName: "Petaling Jaya",
      postalZone: "46000",
      countrySubentityCode: "10",
      countryCode: "MYS",
    },
  },
  invoiceLines: [], // Add invoice lines
  taxTotal: {
    totalTaxAmount: 10.0,
    taxSubtotals: [], // Add tax subtotals
  },
  legalMonetaryTotal: {
    lineExtensionAmount: 100.0,
    taxExclusiveAmount: 100.0,
    taxInclusiveAmount: 110.0,
    payableAmount: 110.0,
  },
};

const helperInvoiceV1_1 = createUblJsonInvoiceDocument(
  invoiceParamsV1_1,
  "1.1"
);

async function constructAndSubmitInvoice(
  client: MyInvoisClient,
  invoiceData: any,
  version: "1.1" | "1.0"
) {
  // Now proceed to Step 3: Digital Signature
  if (version === "1.1") {
    await signAndPrepareForSubmission(client, invoiceData);
  } else {
    await prepareAndSubmit(client, invoiceData);
  }
}
```

## Step 3: Digital Signature (Conceptual)

In a real-world scenario, before submitting the invoice, you must digitally sign it. The MyInvois system expects the signature to be embedded within the `"ext:UBLExtensions"` element of the JSON invoice.

The process would involve:

1.  Using a cryptographic library and your private key to sign a canonicalized form of the invoice data (excluding the signature block itself).
2.  The `einvoice/src/security/digitalSignature.ts` file in this library provides interfaces (`DigitalSignature`, `UBLDocumentSignatureExtension`) and a conceptual function `generateDigitalSignatureJSON` that outlines the creation of this signature structure.
3.  The resulting signature object would be embedded into the `sampleInvoice` object.

For this example, we'll simulate adding a placeholder signature extension.

```typescript
// Continued in signAndPrepareForSubmission function...

async function signAndPrepareForSubmission(
  client: MyInvoisClient,
  invoiceData: UBLInvoiceV1_1
) {
  // --- Conceptual Digital Signature Step ---
  console.log("Conceptual Step: Performing digital signature...");
  // In a real implementation:
  // 1. Obtain your private key and certificate.
  // 2. Use a function like the conceptual `generateDigitalSignatureJSON`
  //    (from einvoice/src/security/digitalSignature.ts) which would use
  //    cryptographic libraries to create the signature.
  //
  const privateKey = loadPrivateKey(); // Your private key
  const certificate = loadCertificate(); // Your certificate
  const digitalSignatureObject = await generateDigitalSignatureJSON(
    invoiceData,
    privateKey,
    certificate
  );
  //
  // Embed the signature into the invoice
  if (
    invoiceData["ext:UBLExtensions"] &&
    invoiceData["ext:UBLExtensions"].UBLExtension
  ) {
    invoiceData["ext:UBLExtensions"].UBLExtension.push({
      ExtensionURI: {
        _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades",
      }, // Example URI
      ExtensionContent: {
        "sig:UBLDocumentSignatures": {
          // This is where the actual UBLDocumentSignatureExtension containing the DigitalSignature goes
          // For example: digitalSignatureObject derived from generateDigitalSignatureJSON
        },
      },
    });
  }

  // For this example, we'll add a minimal placeholder to represent a signed invoice.
  // A real signature block is complex and generated cryptographically.
  const conceptualSignatureExtension: UBLDocumentSignatureExtension = {
    UBLDocumentSignatures: {
      SignatureInformation: {
        // @ts-ignore
        Signature: {
          // This would be the complex DigitalSignature object
          "@Id": "DocSig-Placeholder",
          SignedInfo: "CONTAINS_HASHES_AND_REFERENCES_PLACEHOLDER",
          SignatureValue: "BASE64_ENCODED_SIGNATURE_PLACEHOLDER",
          KeyInfo: "CONTAINS_CERTIFICATE_INFO_PLACEHOLDER",
          Object: "CONTAINS_SIGNED_PROPERTIES_PLACEHOLDER",
        },
      },
    },
  };

  if (invoiceData["ext:UBLExtensions"]?.UBLExtension) {
    invoiceData["ext:UBLExtensions"].UBLExtension.push({
      ExtensionURI: {
        _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades",
      }, // Example URI for XAdES enveloped
      ExtensionContent: {
        "sig:UBLDocumentSignatures": conceptualSignatureExtension,
      },
    });
  }
  console.log("Conceptual signature added to invoice data.");

  // Now proceed to Step 4: Preparing for Submission
  await prepareAndSubmit(client, invoiceData);
}
```

## Step 4: Preparing the Document for Submission

The API expects each document to be:

- A JSON string.
- This JSON string then needs to be Base64 encoded.
- A SHA256 hash of the original JSON string (UTF-8 bytes, before Base64 encoding) is also required.

```typescript
// Continued in prepareAndSubmit function...

async function prepareAndSubmit(
  client: MyInvoisClient,
  signedInvoiceData: any
) {
  console.log("Preparing document for submission...");

  // 1. Convert the final invoice JSON (with conceptual signature) to a string.
  //    In a real scenario, ensure canonical JSON stringification if required by the signing process.
  const invoiceJsonString = JSON.stringify(signedInvoiceData);

  // 2. Calculate SHA256 hash of the JSON string (UTF-8 bytes).
  const documentHash = calculateSHA256(invoiceJsonString);
  console.log("Document Hash (SHA256):", documentHash);

  // 3. Base64 encode the JSON string.
  const documentBase64 = encodeBase64(invoiceJsonString);
  console.log(
    "Document Base64 (first 50 chars):",
    documentBase64.substring(0, 50) + "..."
  );

  // 4. Create the submission request payload.
  const documentToSubmit = {
    format: "JSON" as "JSON",
    document: documentBase64,
    documentHash: documentHash,
    codeNumber: signedInvoiceData["cbc:ID"]._!, // Use the invoice ID as the codeNumber
  };

  const submissionRequest = {
    documents: [documentToSubmit],
    // onBehalfOfTIN is not used for taxpayer direct submission
  };

  // Now proceed to Step 5: Submitting the Document
  await submitToApi(client, submissionRequest);
}
```

## Step 5: Submitting the Document

Use the `client.documents.submitDocuments()` method.

```typescript
// Continued in submitToApi function...
import {
  SubmitDocumentsRequest,
  SubmitDocumentsResponse,
} from "myinvois-client/documents/types"; // Adjust path

async function submitToApi(
  client: MyInvoisClient,
  submissionPayload: SubmitDocumentsRequest
) {
  console.log("Submitting documents to MyInvois API...");
  try {
    const submissionResponse: SubmitDocumentsResponse =
      await client.documents.submitDocuments(submissionPayload);

    console.log("Submission successfully sent to API.");
    // Proceed to Step 6: Handling the Response
    handleApiResponse(submissionResponse);
  } catch (error) {
    console.error("Error submitting documents:", error);
  }
}
```

## Step 6: Handling the Response

The API returns an HTTP 202 (Accepted) status code for successful submissions. The response body includes a `submissionUID` and lists of accepted and rejected documents.

```typescript
// Function to handle API response

function handleApiResponse(response: SubmitDocumentsResponse) {
  console.log("--- Submission Response ---");
  console.log("Submission UID:", response.submissionUID);

  if (response.acceptedDocuments && response.acceptedDocuments.length > 0) {
    console.log("\nAccepted Documents:");
    response.acceptedDocuments.forEach((doc) => {
      console.log(
        `  - Code Number: ${doc.invoiceCodeNumber}, Assigned UUID: ${doc.uuid}`
      );
    });
  } else {
    console.log("\nNo documents were accepted in this submission.");
  }

  if (response.rejectedDocuments && response.rejectedDocuments.length > 0) {
    console.log("\nRejected Documents:");
    response.rejectedDocuments.forEach((doc) => {
      console.log(`  - Code Number: ${doc.invoiceCodeNumber}`);
      console.log(`    Error Code: ${doc.error.errorCode}`);
      console.log(`    Error Message (EN): ${doc.error.error}`);
      if (doc.error.errorMS) {
        console.log(`    Error Message (MS): ${doc.error.errorMS}`);
      }
      if (doc.error.propertyPath) {
        console.log(`    Property Path: ${doc.error.propertyPath}`);
      }
    });
  } else {
    console.log("\nNo documents were rejected in this submission.");
  }
  console.log("--- End of Response ---");
}
```

## Running the Example

To run this full flow:

1.  Ensure you have a TypeScript environment set up.
2.  Replace placeholders for `CLIENT_ID`, `CLIENT_SECRET`, and helper functions (`calculateSHA256`, `encodeBase64`) with actual implementations.
3.  Implement the actual digital signature logic in place of the conceptual step.
4.  Call the main function: `submitInvoiceExample();`

```typescript
// To make the example runnable, you would call the initial function:
submitInvoiceExample();
```

---

This example provides a template for integrating with the MyInvois API for invoice submission. Remember that the digital signature step is critical for production use and requires careful implementation with appropriate cryptographic tools and key management practices.
