# Example: Get Document Details by UUID

This document provides an example of how to use the `myinvois-client` library to fetch the full details of a specific document, including its validation results, using the document's unique UUID.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.
- A `uuid` of a document available on the MyInvois system.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in (as Taxpayer or Intermediary).
2.  **Identify Document**: Have the `uuid` of the document for which you want to retrieve details.
3.  **Call Get Document Details by UUID API**: Use `client.documents.getDocumentDetailsByUuid()`.
4.  **Handling the Response**: Process the document metadata and its validation results.

---

## Step 1: Client Setup and Authentication

This step is similar to other examples.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
import {
  DocumentDetailsResponse,
  ValidationStepResult,
} from "myinvois-client/documents/types"; // Adjust path

async function getDocumentDetailsExample() {
  const CLIENT_ID = "your_client_id";
  const CLIENT_SECRET = "your_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  // **IMPORTANT**: Replace with an actual Document UUID
  const DOCUMENT_UUID_TO_QUERY = "REPLACE_WITH_ACTUAL_DOCUMENT_UUID";

  if (
    CLIENT_ID === "your_client_id" ||
    CLIENT_SECRET === "your_client_secret"
  ) {
    console.warn("Please replace with actual API credentials.");
    // return; // Optional: exit if credentials are not set
  }

  if (DOCUMENT_UUID_TO_QUERY === "REPLACE_WITH_ACTUAL_DOCUMENT_UUID") {
    console.warn("Please specify the Document UUID to query.");
    return;
  }

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT
  );

  try {
    console.log("Authenticating for Get Document Details by UUID...");
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    // Or, for intermediary acting on behalf of a taxpayer:
    // const ON_BEHALF_OF_TIN = "TIN_OF_TAXPAYER";
    // const accessToken = await myInvoiceClient.auth.loginAsIntermediary(ON_BEHALF_OF_TIN, "InvoicingAPI");

    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    await fetchAndDisplayDocumentDetails(
      myInvoiceClient,
      DOCUMENT_UUID_TO_QUERY /*, ON_BEHALF_OF_TIN */
    );
  } catch (error) {
    console.error("Error during Get Document Details by UUID flow:", error);
  }
}

// getDocumentDetailsExample(); // Call the main function
```

## Step 2: Fetching and Handling Document Details

Use the `client.documents.getDocumentDetailsByUuid()` method.

```typescript
// Continued in fetchAndDisplayDocumentDetails function...

async function fetchAndDisplayDocumentDetails(
  client: MyInvoisClient,
  documentUuid: string,
  onBehalfOfTIN?: string
) {
  console.log(`\nFetching details for document UUID: ${documentUuid}`);
  if (onBehalfOfTIN) {
    console.log(`As intermediary for TIN: ${onBehalfOfTIN}`);
  }

  try {
    const response: DocumentDetailsResponse =
      await client.documents.getDocumentDetailsByUuid(
        documentUuid,
        onBehalfOfTIN
      );

    console.log("--- Document Full Details Response ---");
    console.log(`UUID: ${response.uuid}`);
    console.log(`Submission UID: ${response.submissionUid}`);
    console.log(`Internal ID: ${response.internalId}`);
    console.log(
      `Type: ${response.typeName} (Version: ${response.typeVersionName})`
    );
    console.log(`Status: ${response.status}`);
    console.log(
      `Issued: ${response.dateTimeIssued}, Received by API: ${response.dateTimeReceived}`
    );
    if (response.dateTimeValidated) {
      console.log(`Validated: ${response.dateTimeValidated}`);
    }
    console.log(`Issuer: ${response.issuerName} (TIN: ${response.issuerTin})`);
    if (response.receiverName) {
      console.log(
        `Receiver: ${response.receiverName} (ID: ${response.receiverId || "N/A"}, TIN: ${response.receiverTin || "N/A"})`
      );
    }
    console.log(`Total Payable: ${response.totalPayableAmount}`);
    if (response.longId) {
      console.log(`Long ID: ${response.longId.substring(0, 20)}...`);
    }
    if (response.documentStatusReason) {
      console.log(`Status Reason: ${response.documentStatusReason}`);
    }

    if (response.validationResults) {
      console.log("\nValidation Results:");
      console.log(
        `  Overall Validation Status: ${response.validationResults.status}`
      );
      if (
        response.validationResults.validationSteps &&
        response.validationResults.validationSteps.length > 0
      ) {
        console.log("  Validation Steps:");
        response.validationResults.validationSteps.forEach(
          (step: ValidationStepResult) => {
            console.log(
              `    - Step Name: ${step.name}, Status: ${step.status}`
            );
            if (step.error && step.status === "Invalid") {
              console.log(`      Error Code: ${step.error.errorCode}`);
              console.log(`      Error Message (EN): ${step.error.error}`);
              if (step.error.errorMS) {
                console.log(`      Error Message (MS): ${step.error.errorMS}`);
              }
              if (step.error.propertyPath) {
                console.log(`      Property Path: ${step.error.propertyPath}`);
              }
            }
          }
        );
      } else {
        console.log("  No individual validation steps reported.");
      }
    } else {
      console.log(
        "\nNo validation results reported for this document (it might be pre-validation or details not applicable)."
      );
    }
    console.log("--- End of Document Full Details Response ---");
  } catch (error) {
    console.error(
      `Error fetching details for document ${documentUuid}:`,
      error
    );
    // Handle specific errors, e.g., document not found (404)
  }
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID`, `CLIENT_SECRET`, and `DOCUMENT_UUID_TO_QUERY`.
3.  If acting as an intermediary, set `ON_BEHALF_OF_TIN` and adjust authentication and the `fetchAndDisplayDocumentDetails` call.
4.  Call the main function: `getDocumentDetailsExample();`

```typescript
// To run (after setting up credentials and Document UUID):
// getDocumentDetailsExample();
```

---

This example provides a template for fetching comprehensive details of a document, including any validation errors. This can be particularly useful for diagnosing issues with document submissions.
