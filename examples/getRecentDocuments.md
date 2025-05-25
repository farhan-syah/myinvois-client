# Example: Get Recent Documents Flow

This document provides an example of how to use the `myinvois-client` library to fetch a list of recent documents from the MyInvois system. This API allows filtering by various criteria and supports pagination.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in (as Taxpayer or Intermediary).
2.  **Define Search Parameters**: Specify filters such as date ranges, document status, direction (Sent/Received), etc.
3.  **Call Get Recent Documents API**: Use `client.documents.getRecentDocuments()` with the defined parameters.
4.  **Handling the Response**: Process the list of documents and pagination metadata.

---

## Step 1: Client Setup and Authentication

This step is similar to other examples. Authentication can be as a taxpayer or an intermediary.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
import {
  GetRecentDocumentsRequestParams,
  GetRecentDocumentsResponse,
  RecentDocumentInfo,
} from "myinvois-client/documents/types"; // Adjust path

async function getRecentDocumentsExample() {
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
    console.log("Authenticating for Get Recent Documents...");
    // Taxpayer login
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    // Or, for intermediary acting on behalf of a taxpayer:
    // const ON_BEHALF_OF_TIN = "TIN_OF_TAXPAYER";
    // const accessToken = await myInvoiceClient.auth.loginAsIntermediary(ON_BEHALF_OF_TIN, "InvoicingAPI");

    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "...",
    );

    // Define search parameters (examples)
    const searchParams: GetRecentDocumentsRequestParams = {
      pageSize: 10,
      pageNo: 1,
      // submissionDateFrom: "2023-01-01T00:00:00Z",
      // submissionDateTo: "2023-01-31T23:59:59Z",
      // issueDateFrom: "2023-01-01T00:00:00Z",
      // issueDateTo: "2023-01-31T23:59:59Z",
      InvoiceDirection: "Sent",
      status: "Valid",
      // documentType: "01", // Invoice
      // receiverTin: "CUST12345670",
      // issuerTin: "MYTIN00000000", // If searching as intermediary for received documents
    };

    await fetchAndDisplayRecentDocuments(myInvoiceClient, searchParams);

    // Example: Fetching received documents for a specific issuer (if logged in as intermediary for the receiver)
    /*
    if (ON_BEHALF_OF_TIN) { // Ensure ON_BEHALF_OF_TIN is defined
        const receivedParams: GetRecentDocumentsRequestParams = {
            pageSize: 5,
            pageNo: 1,
            InvoiceDirection: "Received",
            issuerTin: "SUPPLIER_TIN_EXAMPLE" // TIN of the party that SENT the invoice
        };
        console.log(`\nFetching received documents from issuer TIN: ${receivedParams.issuerTin} for ${ON_BEHALF_OF_TIN}`);
        await fetchAndDisplayRecentDocuments(myInvoiceClient, receivedParams, ON_BEHALF_OF_TIN);
    }
    */
  } catch (error) {
    console.error("Error during Get Recent Documents flow:", error);
  }
}

// getRecentDocumentsExample(); // Call the main function
```

## Step 2: Fetching and Handling Recent Documents

Use the `client.documents.getRecentDocuments()` method with the desired parameters.

```typescript
// Continued in fetchAndDisplayRecentDocuments function...

async function fetchAndDisplayRecentDocuments(
  client: MyInvoisClient,
  params: GetRecentDocumentsRequestParams,
  onBehalfOfTIN?: string,
) {
  console.log(`\nFetching recent documents with params:`, params);
  if (onBehalfOfTIN) {
    console.log(`As intermediary for TIN: ${onBehalfOfTIN}`);
  }

  try {
    const response: GetRecentDocumentsResponse =
      await client.documents.getRecentDocuments(params, onBehalfOfTIN);

    console.log("--- Recent Documents Response ---");
    console.log("Metadata:");
    console.log(`  Total Pages: ${response.metadata.totalPages}`);
    console.log(`  Total Count: ${response.metadata.totalCount}`);
    console.log(`  Page Size: ${response.metadata.pageSize}`);
    console.log(`  Current Page: ${response.metadata.pageNo}`);

    if (response.result && response.result.length > 0) {
      console.log("\nRecent Documents:");
      response.result.forEach((doc: RecentDocumentInfo) => {
        console.log(`  ---`);
        console.log(`  UUID: ${doc.uuid}`);
        console.log(`  Internal ID: ${doc.internalId}`);
        console.log(
          `  Type: ${doc.typeName} (Version: ${doc.typeVersionName})`,
        );
        console.log(`  Status: ${doc.status}`);
        console.log(
          `  Issued: ${doc.dateTimeIssued}, Received by API: ${doc.dateTimeReceived}`,
        );
        console.log(
          `  Issuer TIN: ${doc.issuerTin}` +
            (doc.issuerName ? ` (${doc.issuerName})` : ``),
        );
        console.log(
          `  Receiver TIN: ${doc.receiverTin}` +
            (doc.receiverName ? ` (${doc.receiverName})` : ``),
        );
        console.log(`  Total Amount: ${doc.total}`);
        if (doc.documentStatusReason) {
          console.log(`  Reason: ${doc.documentStatusReason}`);
        }
      });
    } else {
      console.log("\nNo documents found matching the criteria.");
    }
    console.log("--- End of Recent Documents Response ---");
  } catch (error) {
    console.error(`Error fetching recent documents:`, error);
  }
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID` and `CLIENT_SECRET` with your actual credentials.
3.  Adjust `searchParams` in `getRecentDocumentsExample` to specify the filters you want to test.
4.  If testing as an intermediary, set `ON_BEHALF_OF_TIN` and uncomment the relevant login and fetch sections.
5.  Call the main function: `getRecentDocumentsExample();`

```typescript
// To run (after setting up credentials and parameters):
// getRecentDocumentsExample();
```

---

This example provides a template for fetching recent documents. Remember to consult the API documentation for details on rate limits, the 31-day query window, and specific filter behaviors.

### Public URL for Documents

The document validation or public URL can be constructed using the `uuid` and `longId` from the response:

`{envBaseUrl}/uuid-of-document/share/longid`

Replace `{envBaseUrl}` with the appropriate MyInvois portal base URL (e.g., `https://myinvois.hasil.gov.my` for PROD or `https://preprod.myinvois.hasil.gov.my` for SANDBOX).
