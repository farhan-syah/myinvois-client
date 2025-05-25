# Example: Get Document by UUID (Raw)

This document provides an example of how to use the `myinvois-client` library to fetch the full raw document (XML or JSON) along with its metadata using the document's unique UUID.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.
- A `uuid` of a document available on the MyInvois system.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in (as Taxpayer or Intermediary).
2.  **Identify Document**: Have the `uuid` of the document you want to retrieve.
3.  **Specify Preferred Format (Optional)**: Decide if you want the raw document in `JSON` or `XML` format. The client will set the `Accept` header accordingly.
4.  **Call Get Document by UUID API**: Use `client.documents.getDocumentByUuid()`.
5.  **Handling the Response**: Process the document metadata and the raw document string.

---

## Step 1: Client Setup and Authentication

This step is similar to other examples.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
import { GetDocumentResponse } from "myinvois-client/documents/types"; // Adjust path

async function getDocumentByUuidExample() {
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
    // return;
  }

  if (DOCUMENT_UUID_TO_QUERY === "REPLACE_WITH_ACTUAL_DOCUMENT_UUID") {
    console.warn("Please specify the Document UUID to query.");
    return;
  }

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT,
  );

  try {
    console.log("Authenticating for Get Document by UUID...");
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    // Or, for intermediary acting on behalf of a taxpayer:
    // const ON_BEHALF_OF_TIN = "TIN_OF_TAXPAYER";
    // const accessToken = await myInvoiceClient.auth.loginAsIntermediary(ON_BEHALF_OF_TIN, "InvoicingAPI");

    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "...",
    );

    // Fetch as JSON (default if preferredFormat is omitted by client method, or explicitly JSON)
    await fetchAndDisplayDocument(
      myInvoiceClient,
      DOCUMENT_UUID_TO_QUERY,
      "JSON" /*, ON_BEHALF_OF_TIN */,
    );

    // Example: Fetch as XML
    // await fetchAndDisplayDocument(myInvoiceClient, DOCUMENT_UUID_TO_QUERY, "XML" /*, ON_BEHALF_OF_TIN */);
  } catch (error) {
    console.error("Error during Get Document by UUID flow:", error);
  }
}

// getDocumentByUuidExample(); // Call the main function
```

## Step 2: Fetching and Handling the Document

Use the `client.documents.getDocumentByUuid()` method. This method will handle setting the `Accept` header based on your preference.

```typescript
// Continued in fetchAndDisplayDocument function...

async function fetchAndDisplayDocument(
  client: MyInvoisClient,
  documentUuid: string,
  preferredFormat: "JSON" | "XML" = "JSON", // Default to JSON
  onBehalfOfTIN?: string,
) {
  console.log(
    `\nFetching document UUID: ${documentUuid} (Preferred Format: ${preferredFormat})`,
  );
  if (onBehalfOfTIN) {
    console.log(`As intermediary for TIN: ${onBehalfOfTIN}`);
  }

  try {
    // The client method getDocumentByUuid handles setting the Accept header.
    const response: GetDocumentResponse =
      await client.documents.getDocumentByUuid(
        documentUuid,
        preferredFormat,
        onBehalfOfTIN,
      );

    console.log("--- Document Details Response ---");
    console.log(`UUID: ${response.uuid}`);
    console.log(`Submission UID: ${response.submissionUid}`);
    console.log(`Internal ID: ${response.internalId}`);
    console.log(
      `Type: ${response.typeName} (Version: ${response.typeVersionName})`,
    );
    console.log(`Status: ${response.status}`);
    console.log(
      `Issued: ${response.dateTimeIssued}, Received by API: ${response.dateTimeReceived}`,
    );
    if (response.dateTimeValidated) {
      console.log(`Validated: ${response.dateTimeValidated}`);
    }
    console.log(`Issuer: ${response.issuerName} (TIN: ${response.issuerTin})`);
    if (response.receiverName) {
      console.log(
        `Receiver: ${response.receiverName} (ID: ${response.receiverId || "N/A"}, TIN: ${response.receiverTin || "N/A"})`,
      );
    }
    console.log(`Total Payable: ${response.totalPayableAmount}`);
    if (response.longId) {
      console.log(`Long ID: ${response.longId.substring(0, 20)}...`);
    }
    if (response.documentStatusReason) {
      console.log(`Status Reason: ${response.documentStatusReason}`);
    }

    console.log(`\n--- Raw Document (Format: ${preferredFormat}) ---`);
    // Displaying a snippet of the raw document for brevity
    const rawDocumentSnippet = response.document.substring(
      0,
      Math.min(response.document.length, 500),
    );
    console.log(
      rawDocumentSnippet + (response.document.length > 500 ? "..." : ""),
    );
    console.log("--- End of Document Details Response ---");
  } catch (error) {
    console.error(`Error fetching document ${documentUuid}:`, error);
    // Handle specific errors, e.g., document not found (404) or not accessible
  }
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID`, `CLIENT_SECRET`, and `DOCUMENT_UUID_TO_QUERY`.
3.  Choose the `preferredFormat` ("JSON" or "XML") when calling `fetchAndDisplayDocument`.
4.  If acting as an intermediary, set `ON_BEHALF_OF_TIN` and adjust authentication and the `fetchAndDisplayDocument` call.
5.  Call the main function: `getDocumentByUuidExample();`

```typescript
// To run (after setting up credentials and Document UUID):
// getDocumentByUuidExample();
```

---

This example provides a template for fetching a raw document by its UUID. Remember that `Invalid` documents cannot be fetched with this API. Receivers can only fetch `Valid` or `Cancelled` documents they are party to. Issuers can retrieve documents they issued in any status (except `Invalid` via this specific endpoint).

### Public URL for Documents

The document validation or public URL can be constructed using the `uuid` and `longId` from the response:

`{envBaseUrl}/uuid-of-document/share/longid`

Replace `{envBaseUrl}` with the appropriate MyInvois portal base URL.
