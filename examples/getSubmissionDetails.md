# Example: Get Submission Details Flow

This document provides an example of how to use the `myinvois-client` library to fetch the details of a specific document submission using its unique Submission UID. This API helps in checking the processing status of an entire submission batch.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.
- A `submissionUid` from a previous document submission.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in (as Taxpayer or Intermediary who made the original submission).
2.  **Identify Submission**: Have the `submissionUid` of the submission you want to query.
3.  **Define Pagination (Optional)**: Specify `pageNo` and `pageSize` if you want to paginate through the document summaries within the submission.
4.  **Call Get Submission Details API**: Use `client.documents.getSubmissionDetails()`.
5.  **Handling the Response**: Process the submission status and the summary of documents included in that submission.

---

## Step 1: Client Setup and Authentication

This step is similar to other examples. The user authenticating should be the one who originally submitted the documents (or an intermediary acting on their behalf).

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
import {
  GetSubmissionDetailsRequestParams,
  GetSubmissionDetailsResponse,
  DocumentSummary,
} from "myinvois-client/documents/types"; // Adjust path

async function getSubmissionDetailsExample() {
  const CLIENT_ID = "your_client_id";
  const CLIENT_SECRET = "your_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  // **IMPORTANT**: Replace with an actual Submission UID from a previous submission
  const SUBMISSION_UID_TO_QUERY = "REPLACE_WITH_ACTUAL_SUBMISSION_UID";

  if (
    CLIENT_ID === "your_client_id" ||
    CLIENT_SECRET === "your_client_secret"
  ) {
    console.warn("Please replace with actual API credentials.");
    // return;
  }

  if (SUBMISSION_UID_TO_QUERY === "REPLACE_WITH_ACTUAL_SUBMISSION_UID") {
    console.warn("Please specify the Submission UID to query.");
    return;
  }

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT,
  );

  try {
    console.log("Authenticating for Get Submission Details...");
    // Taxpayer login (assuming taxpayer made the submission)
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    // Or, for intermediary who made the submission on behalf of a taxpayer:
    // const ON_BEHALF_OF_TIN = "TIN_OF_TAXPAYER_FOR_SUBMISSION";
    // const accessToken = await myInvoiceClient.auth.loginAsIntermediary(ON_BEHALF_OF_TIN, "InvoicingAPI");

    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "...",
    );

    // Optional: Define pagination parameters for the document summaries
    const paginationParams: GetSubmissionDetailsRequestParams = {
      pageNo: 1,
      pageSize: 10, // Max 100 as per documentation
    };

    await fetchAndDisplaySubmissionDetails(
      myInvoiceClient,
      SUBMISSION_UID_TO_QUERY,
      paginationParams /*, ON_BEHALF_OF_TIN */,
    );
  } catch (error) {
    console.error("Error during Get Submission Details flow:", error);
  }
}

// getSubmissionDetailsExample(); // Call the main function
```

## Step 2: Fetching and Handling Submission Details

Use the `client.documents.getSubmissionDetails()` method.

```typescript
// Continued in fetchAndDisplaySubmissionDetails function...

async function fetchAndDisplaySubmissionDetails(
  client: MyInvoisClient,
  submissionUid: string,
  params?: GetSubmissionDetailsRequestParams,
  onBehalfOfTIN?: string,
) {
  console.log(`\nFetching details for submission UID: ${submissionUid}`);
  if (params) {
    console.log(
      `With pagination: Page ${params.pageNo}, Size ${params.pageSize}`,
    );
  }
  if (onBehalfOfTIN) {
    console.log(`As intermediary for TIN: ${onBehalfOfTIN}`);
  }

  try {
    const response: GetSubmissionDetailsResponse =
      await client.documents.getSubmissionDetails(
        submissionUid,
        params,
        onBehalfOfTIN,
      );

    console.log("--- Submission Details Response ---");
    console.log(`Submission UID: ${response.submissionUid}`);
    console.log(`Document Count: ${response.documentCount}`);
    console.log(`Date/Time Received: ${response.dateTimeReceived}`);
    console.log(`Overall Status: ${response.overallStatus}`);

    if (response.documentSummary && response.documentSummary.length > 0) {
      console.log("\nDocument Summaries (current page):");
      response.documentSummary.forEach((doc: DocumentSummary) => {
        console.log(`  ---`);
        console.log(`  Document UUID: ${doc.uuid}`);
        console.log(`  Internal ID: ${doc.internalId}`);
        console.log(
          `  Type: ${doc.typeName} (Version: ${doc.typeVersionName})`,
        );
        console.log(`  Status: ${doc.status}`);
        console.log(
          `  Issued: ${doc.dateTimeIssued}, Received by API: ${doc.dateTimeReceived}`,
        );
        console.log(`  Issuer: ${doc.issuerName} (TIN: ${doc.issuerTin})`);
        if (doc.receiverName && doc.receiverId) {
          console.log(
            `  Receiver: ${doc.receiverName} (ID: ${doc.receiverId})`,
          );
        }
        console.log(`  Total Payable: ${doc.totalPayableAmount}`);
        if (doc.longId) {
          console.log(
            `  Long ID (for valid docs): ${doc.longId.substring(0, 20)}...`,
          );
        }
        if (doc.documentStatusReason) {
          console.log(`  Reason: ${doc.documentStatusReason}`);
        }
      });
    } else {
      console.log(
        "\nNo document summaries found in this page of the submission.",
      );
    }
    console.log("--- End of Submission Details Response ---");
  } catch (error) {
    console.error(
      `Error fetching details for submission ${submissionUid}:`,
      error,
    );
    // Handle specific errors, e.g., submission not found (404)
  }
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID`, `CLIENT_SECRET`, and `SUBMISSION_UID_TO_QUERY`.
3.  Adjust `paginationParams` if needed.
4.  If the submission was made by an intermediary, set `ON_BEHALF_OF_TIN` and adjust the authentication and `fetchAndDisplaySubmissionDetails` call.
5.  Call the main function: `getSubmissionDetailsExample();`

```typescript
// To run (after setting up credentials and Submission UID):
// getSubmissionDetailsExample();
```

---

This example provides a template for fetching submission details. Remember the recommended polling interval of 3-5 seconds and the rate limit of 300 RPM per Client ID when using this API to monitor submission status.
