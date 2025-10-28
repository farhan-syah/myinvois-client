# Example: Document Rejection Flow

This document provides an example of how to use the `myinvois-client` library for a Buyer to reject an e-Invoice or other document received from a Supplier. Rejection notifies the supplier of issues with the document.

Document rejection is time-sensitive, typically allowed within 72 hours of the document's validation by the MyInvois system. A document can only be rejected once.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX) belonging to the **Buyer**.
- The `myinvois-client` library installed in your project.
- The LHDNM Unique Identifier Number (UUID) of the document the Buyer wishes to reject.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` with the Buyer's credentials and log in.
2.  **Identify Document to Reject**: Obtain the UUID of the received document.
3.  **Call Rejection API**: Use `client.documents.rejectDocument()` with the UUID and a reason for rejection.
4.  **Handling the Response**: Process the rejection request acknowledgment. The document status becomes "Requested for Rejection". The Supplier must then cancel the document.

---

## Step 1: Client Setup and Authentication (as Buyer)

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path

async function rejectDocumentExample() {
  const BUYER_CLIENT_ID = "your_buyer_client_id";
  const BUYER_CLIENT_SECRET = "your_buyer_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  // **IMPORTANT**: Replace with the actual UUID of the document to be rejected by the Buyer
  const DOCUMENT_UUID_TO_REJECT = "REPLACE_WITH_RECEIVED_DOCUMENT_UUID";
  const REJECTION_REASON = "Incorrect item quantity listed on invoice."; // Be specific

  if (
    BUYER_CLIENT_ID === "your_buyer_client_id" ||
    BUYER_CLIENT_SECRET === "your_buyer_client_secret"
  ) {
    console.warn("Please replace with actual Buyer API credentials.");
    // return;
  }

  if (DOCUMENT_UUID_TO_REJECT === "REPLACE_WITH_RECEIVED_DOCUMENT_UUID") {
    console.warn("Please specify the UUID of the document to reject.");
    return;
  }

  const myInvoiceClient = new MyInvoisClient(
    BUYER_CLIENT_ID,
    BUYER_CLIENT_SECRET,
    ENVIRONMENT
  );

  try {
    console.log("Authenticating as Buyer for document rejection...");
    // Buyer uses their own credentials to log in as a taxpayer
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    // Or, if an intermediary is acting on behalf of the Buyer:
    // const ON_BEHALF_OF_BUYER_TIN = "BUYER_TIN";
    // const accessToken = await myInvoiceClient.auth.loginAsIntermediary(ON_BEHALF_OF_BUYER_TIN, "InvoicingAPI");

    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    await performRejection(
      myInvoiceClient,
      DOCUMENT_UUID_TO_REJECT,
      REJECTION_REASON
    );
  } catch (error) {
    console.error(
      "Error during client setup, authentication, or rejection:",
      error
    );
  }
}

// rejectDocumentExample(); // Call the main function
```

## Step 2: Perform Document Rejection

Use the `client.documents.rejectDocument()` method. The Buyer initiates this.

```typescript
// Continued in performRejection function...
import { RejectDocumentResponse } from "myinvois-client/documents/types"; // Adjust path

async function performRejection(
  client: MyInvoisClient,
  documentUuid: string,
  reason: string
) {
  console.log(`Attempting to reject document with UUID: ${documentUuid}`);
  console.log(`Reason for rejection: ${reason}`);

  try {
    // If an intermediary is rejecting on behalf of the Buyer:
    // const ON_BEHALF_OF_BUYER_TIN = "BUYER_TIN"; // Ensure this matches login
    // const rejectionResponse: RejectDocumentResponse = await client.documents.rejectDocument(documentUuid, reason, ON_BEHALF_OF_BUYER_TIN);

    // If the Buyer is rejecting directly:
    const rejectionResponse: RejectDocumentResponse =
      await client.documents.rejectDocument(documentUuid, reason);

    console.log("--- Document Rejection Response ---");
    console.log("Successfully sent rejection request to API.");
    handleRejectionApiResponse(rejectionResponse);
  } catch (error) {
    console.error(`Error rejecting document ${documentUuid}:`, error);
    // Check for specific error messages, e.g., OperationPeriodOver, IncorrectState
  }
}
```

## Step 3: Handling the Rejection Response

The API returns an HTTP 200 status code if the rejection request was successfully submitted. The document status changes to "Requested for Rejection".

```typescript
// Function to handle API response for rejection
function handleRejectionApiResponse(response: RejectDocumentResponse) {
  console.log("Document UUID:", response.uuid);
  console.log("Status:", response.status); // Should be "Requested for Rejection"

  if (response.status === "Requested for Rejection") {
    console.log(
      `Document ${response.uuid} has been successfully marked for rejection. The issuer (Supplier) needs to cancel it.`
    );
  } else {
    console.warn(
      `Document ${response.uuid} rejection status: ${response.status}. Review API logs if unexpected.`
    );
  }
  console.log("--- End of Rejection Response ---");
}
```

## Running the Example

To run this flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `BUYER_CLIENT_ID`, `BUYER_CLIENT_SECRET` with the Buyer's actual credentials.
3.  Set `DOCUMENT_UUID_TO_REJECT` to the valid UUID of a document received by the Buyer.
4.  Provide a clear `REJECTION_REASON`.
5.  If an intermediary acts for the Buyer, adjust the authentication and `performRejection` call.
6.  Call `rejectDocumentExample();`

```typescript
// To run (after setting up credentials and UUID):
// rejectDocumentExample();
```

---

This example outlines the document rejection process initiated by a Buyer. The key outcome is that the document is flagged for rejection, and the original issuer (Supplier) is then expected to cancel the document. Always consult the MyInvois API documentation for the most current details on error codes and process rules.
