# Example: Document Cancellation Flow

This document provides an example of how to use the `myinvois-client` library to cancel a previously submitted e-Invoice or other document. This flow assumes you are the issuer of the document or an intermediary acting on their behalf.

Document cancellation is time-sensitive and typically allowed within 72 hours of the document's validation.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.
- The LHDNM Unique Identifier Number (UUID) of the document you wish to cancel.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in (as Taxpayer or Intermediary).
2.  **Identify Document to Cancel**: Obtain the UUID of the document.
3.  **Call Cancellation API**: Use `client.documents.cancelDocument()` with the UUID and a reason.
4.  **Handling the Response**: Process the cancellation acknowledgment.

---

## Step 1: Client Setup and Authentication

This step is similar to other document submission examples.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
// No specific UBL types are needed for cancellation itself, only for context if you're building a larger app.

async function cancelDocumentExample() {
  const CLIENT_ID = "your_client_id"; // or BUYER_CLIENT_ID if cancelling a self-billed doc as buyer
  const CLIENT_SECRET = "your_client_secret"; // or BUYER_CLIENT_SECRET
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  // **IMPORTANT**: Replace with the actual UUID of the document to be cancelled
  const DOCUMENT_UUID_TO_CANCEL = "REPLACE_WITH_ACTUAL_DOCUMENT_UUID";
  const CANCELLATION_REASON =
    "Customer requested cancellation due to order change."; // Max 300 chars

  if (
    CLIENT_ID === "your_client_id" ||
    CLIENT_SECRET === "your_client_secret"
  ) {
    console.warn("Please replace with actual API credentials.");
    // return; // Optional: exit if credentials are not set
  }

  if (DOCUMENT_UUID_TO_CANCEL === "REPLACE_WITH_ACTUAL_DOCUMENT_UUID") {
    console.warn("Please specify the UUID of the document to cancel.");
    return;
  }

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT
  );

  try {
    console.log("Authenticating for document cancellation...");
    // For taxpayer (issuer) cancelling their own document:
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    // Or, if an intermediary is cancelling on behalf of a taxpayer:
    // const ON_BEHALF_OF_TIN = "TIN_OF_TAXPAYER_WHO_ISSUED_DOC";
    // const accessToken = await myInvoiceClient.auth.loginAsIntermediary(ON_BEHALF_OF_TIN, "InvoicingAPI");
    // For a buyer cancelling a self-billed document they issued:
    // const accessToken = await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI"); // Buyer logs in with their creds

    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    await performCancellation(
      myInvoiceClient,
      DOCUMENT_UUID_TO_CANCEL,
      CANCELLATION_REASON
    );
  } catch (error) {
    console.error(
      "Error during client setup, authentication, or cancellation:",
      error
    );
  }
}

// submitCancellationExample(); // Call the main function
```

## Step 2: Perform Document Cancellation

Use the `client.documents.cancelDocument()` method.

```typescript
// Continued in performCancellation function...
import { CancelDocumentResponse } from "myinvois-client/documents/types"; // Adjust path

async function performCancellation(
  client: MyInvoisClient,
  documentUuid: string,
  reason: string
) {
  console.log(`Attempting to cancel document with UUID: ${documentUuid}`);
  console.log(`Reason: ${reason}`);

  try {
    // If an intermediary is cancelling on behalf of the document issuer:
    // const ON_BEHALF_OF_TIN = "TIN_OF_TAXPAYER_WHO_ISSUED_DOC"; // Ensure this matches login
    // const cancellationResponse: CancelDocumentResponse = await client.documents.cancelDocument(documentUuid, reason, ON_BEHALF_OF_TIN);

    // If the issuer (taxpayer or buyer for self-billed) is cancelling directly:
    const cancellationResponse: CancelDocumentResponse =
      await client.documents.cancelDocument(documentUuid, reason);

    console.log("--- Document Cancellation Response ---");
    console.log("Successfully sent cancellation request to API.");
    handleCancellationApiResponse(cancellationResponse);
  } catch (error) {
    // Error handling will catch issues like document not found, cancellation period over, wrong state, etc.
    console.error(`Error cancelling document ${documentUuid}:`, error);
    // The error object should contain details from the API (errorCode, error message)
    // Example of checking for specific error details if error is structured:
    // if (error.message && error.message.includes("OperationPeriodOver")) {
    //   console.error("Cancellation failed: The cancellation period for this document has passed.");
    // }
  }
}
```

## Step 3: Handling the Cancellation Response

The API returns an HTTP 200 status code for a successful cancellation request.

```typescript
// Function to handle API response for cancellation
function handleCancellationApiResponse(response: CancelDocumentResponse) {
  console.log("Document UUID:", response.uuid);
  console.log("Status:", response.status); // Should be "Cancelled"

  if (response.status === "Cancelled") {
    console.log(`Document ${response.uuid} has been successfully cancelled.`);
  } else {
    // This case should ideally not be reached if the API call was successful (HTTP 200)
    // and the response structure is as defined. Errors are typically caught in the catch block.
    console.warn(
      `Document ${response.uuid} cancellation status: ${response.status}. Review API logs if unexpected.`
    );
  }
  console.log("--- End of Cancellation Response ---");
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID`, `CLIENT_SECRET` with your actual credentials.
3.  **Crucially, set `DOCUMENT_UUID_TO_CANCEL` to the valid UUID of a document you intend to cancel.**
4.  Set an appropriate `CANCELLATION_REASON`.
5.  If operating as an intermediary or if the Buyer is cancelling a self-billed document, adjust the authentication part in `cancelDocumentExample` and the `performCancellation` call accordingly (e.g., by passing `ON_BEHALF_OF_TIN`).
6.  Call the main function: `cancelDocumentExample();`

```typescript
// To run (after setting up credentials and UUID):
// cancelDocumentExample();
```

---

This example provides a template for integrating document cancellation. Remember that cancellation is subject to specific rules, such as the 72-hour window from validation. Always refer to the latest MyInvois API documentation for specific error codes and conditions.
