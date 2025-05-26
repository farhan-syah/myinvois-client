# Example: Search Documents Flow

This document provides an example of how to use the `myinvois-client` library to search for documents on the MyInvois system using various filter criteria. This API supports pagination and requires at least one date range (submission or issue date) to be specified.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in (as Taxpayer or Intermediary).
2.  **Define Search Parameters**: Specify filters. Critically, either `submissionDateFrom`/`submissionDateTo` OR `issueDateFrom`/`issueDateTo` must be provided.
3.  **Call Search Documents API**: Use `client.documents.searchDocuments()` with the defined parameters.
4.  **Handling the Response**: Process the list of documents and pagination metadata.

---

## Step 1: Client Setup and Authentication

This step is similar to other examples.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
import {
  SearchDocumentsRequestParams,
  SearchDocumentsResponse,
  RecentDocumentInfo,
} from "myinvois-client/documents/types"; // Adjust path

async function searchDocumentsExample() {
  const CLIENT_ID = "your_client_id";
  const CLIENT_SECRET = "your_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  if (
    CLIENT_ID === "your_client_id" ||
    CLIENT_SECRET === "your_client_secret"
  ) {
    console.warn("Please replace with actual API credentials.");
    // return; // Optional: exit if credentials are not set
  }

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT,
  );

  try {
    console.log("Authenticating for Search Documents...");
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    // Or, for intermediary acting on behalf of a taxpayer:
    // const ON_BEHALF_OF_TIN = "TIN_OF_TAXPAYER";
    // const accessToken = await myInvoiceClient.auth.loginAsIntermediary(ON_BEHALF_OF_TIN, "InvoicingAPI");

    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "...",
    );

    // --- Example 1: Search by Submission Date Range ---
    const submissionDateParams: SearchDocumentsRequestParams = {
      submissionDateFrom: "2023-10-01T00:00:00Z", // Replace with your desired date range
      submissionDateTo: "2023-10-31T23:59:59Z", // Max 31 days range
      pageSize: 5,
      pageNo: 1,
      InvoiceDirection: "Sent",
      status: "Valid",
      // documentType: "01",
      // searchQuery: "INV-2023-OCT"
    };
    await performSearchAndDisplay(
      myInvoiceClient,
      submissionDateParams,
      "Submission Date Search" /*, ON_BEHALF_OF_TIN */,
    );

    // --- Example 2: Search by Issue Date Range and other filters ---
    /*
    const issueDateParams: SearchDocumentsRequestParams = {
      issueDateFrom: "2023-11-01T00:00:00Z", // Replace with your desired date range
      issueDateTo: "2023-11-15T23:59:59Z",   // Max 31 days range
      pageSize: 10,
      pageNo: 1,
      documentType: "02", // Credit Note
      searchQuery: "CUST12345" // Example: Search by a customer TIN or name part
    };
    await performSearchAndDisplay(myInvoiceClient, issueDateParams, "Issue Date Search" ON_BEHALF_OF_TIN );
    */

    // --- Example 3: Search by specific UUID (still requires a date range) ---
    /*
    const uuidSearchParams: SearchDocumentsRequestParams = {
        uuid: "SPECIFIC_DOCUMENT_UUID_HERE", // Replace with actual UUID
        submissionDateFrom: "2023-01-01T00:00:00Z", // Broad date range covering the UUID's submission
        submissionDateTo: "2023-12-31T23:59:59Z",
    };
    await performSearchAndDisplay(myInvoiceClient, uuidSearchParams, "UUID Search" ON_BEHALF_OF_TIN );
    */
  } catch (error) {
    // Errors from performSearchAndDisplay are caught there, this catches auth errors etc.
    console.error("Error in searchDocumentsExample main flow:", error);
  }
}

// searchDocumentsExample(); // Call the main function
```

## Step 2: Performing the Search and Handling Results

Use the `client.documents.searchDocuments()` method. Ensure at least one date range is provided.

```typescript
// Continued in performSearchAndDisplay function...

async function performSearchAndDisplay(
  client: MyInvoisClient,
  params: SearchDocumentsRequestParams,
  searchDescription: string,
  onBehalfOfTIN?: string,
) {
  console.log(`\n--- ${searchDescription} ---`);
  console.log(`Searching with params:`, params);
  if (onBehalfOfTIN) {
    console.log(`As intermediary for TIN: ${onBehalfOfTIN}`);
  }

  try {
    // The client method includes validation for date parameters
    const response: SearchDocumentsResponse =
      await client.documents.searchDocuments(params, onBehalfOfTIN);

    console.log("Metadata:");
    console.log(`  Total Pages: ${response.metadata.totalPages}`);
    console.log(`  Total Count: ${response.metadata.totalCount}`);
    console.log(`  Page Size: ${response.metadata.pageSize}`);
    console.log(`  Current Page: ${response.metadata.pageNo}`);

    if (response.result && response.result.length > 0) {
      console.log("\nSearch Results (Documents):");
      response.result.forEach((doc: RecentDocumentInfo) => {
        console.log(`  ---`);
        console.log(`  UUID: ${doc.uuid}`);
        console.log(`  Internal ID: ${doc.internalId}`);
        console.log(
          `  Type: ${doc.typeName} (Version: ${doc.typeVersionName})`,
        );
        console.log(`  Status: ${doc.status}`);
        console.log(
          `  Issued: ${doc.dateTimeIssued}, Submitted: ${doc.dateTimeReceived}`,
        );
        console.log(`  Issuer: ${doc.issuerName} (TIN: ${doc.issuerTin})`);
        console.log(
          `  Receiver: ${doc.receiverName || "N/A"} (TIN: ${doc.receiverTin || "N/A"}, ID: ${doc.receiverId || "N/A"})`,
        );
        console.log(`  Total Amount: ${doc.total}`);
      });
    } else {
      console.log(
        "\nNo documents found matching the criteria for this search.",
      );
    }
  } catch (error) {
    console.error(`Error during "${searchDescription}":`, error);
    // Log specific error messages, e.g., if date range validation fails in the client method
  }
  console.log(`--- End of ${searchDescription} ---\n`);
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID` and `CLIENT_SECRET`.
3.  Modify the `submissionDateParams`, `issueDateParams`, or `uuidSearchParams` in `searchDocumentsExample` to test different search scenarios.
    - **Crucially, ensure either `submissionDateFrom`/`To` or `issueDateFrom`/`To` are provided in any search.**
    - Respect the maximum 31-day range for these date filters.
4.  If acting as an intermediary, set `ON_BEHALF_OF_TIN` and adjust authentication and the `performSearchAndDisplay` calls.
5.  Call the main function: `searchDocumentsExample();`

```typescript
// To run (after setting up credentials and parameters):
// searchDocumentsExample();
```

---

This example provides a template for searching documents. The `searchDocuments` API is powerful but has strict requirements for date filters and usage guidelines (e.g., for auditing/troubleshooting, not high-frequency reconciliation). Always refer to the latest API documentation for rate limits, filter behaviors, and usage recommendations.
