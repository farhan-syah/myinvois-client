# Example: Search Taxpayer's TIN Flow

This document provides an example of how to use the `myinvois-client` library to search for a Taxpayer's Identification Number (TIN) using various search parameters. This API is useful for verifying or finding a TIN before using it in document submissions.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.

## Flow Overview

1.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in (as Taxpayer or Intermediary).
2.  **Define Search Parameters**: Specify search criteria. You must provide either:
    - `taxpayerName`
    - `idType` AND `idValue`
    - All three (`taxpayerName`, `idType`, AND `idValue`)
3.  **Call Search Taxpayer TIN API**: Use `client.taxpayer.searchTaxpayerTIN()` with the defined parameters.
4.  **Handling the Response**: Process the returned TIN or handle errors if no unique TIN is found.

---

## Step 1: Client Setup and Authentication

This step is similar to other examples.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
import {
  SearchTaxpayerTINRequestParams,
  SearchTaxpayerTINResponse,
} from "myinvois-client/taxpayer/types"; // Adjust path
import { TaxpayerIdType } from "myinvois-client/codes"; // For idType enum

async function searchTaxpayerTinExample() {
  const CLIENT_ID = "your_client_id";
  const CLIENT_SECRET = "your_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  if (
    CLIENT_ID === "your_client_id" ||
    CLIENT_SECRET === "your_client_secret"
  ) {
    console.warn("Please replace with actual API credentials.");
    // return;
  }

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT
  );

  try {
    console.log("Authenticating for Search Taxpayer TIN...");
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI"); // Or loginAsIntermediary
    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    // --- Example 1: Search by Taxpayer Name ---
    const paramsByName: SearchTaxpayerTINRequestParams = {
      taxpayerName: "AMS Setia Jaya Sdn. Bhd.", // Replace with a known taxpayer name
    };
    await performTinSearch(myInvoiceClient, paramsByName, "Search by Name");

    // --- Example 2: Search by ID Type and ID Value ---
    const paramsById: SearchTaxpayerTINRequestParams = {
      idType: "BRN" as TaxpayerIdType, // Business Registration Number
      idValue: "201901234567", // Replace with a known BRN
    };
    // await performTinSearch(myInvoiceClient, paramsById, "Search by ID");

    // --- Example 3: Search by Name, ID Type, and ID Value ---
    const paramsCombined: SearchTaxpayerTINRequestParams = {
      taxpayerName: "Syarikat Maju ABC", // Replace with a known taxpayer name
      idType: "NRIC" as TaxpayerIdType, // National Registration Identity Card
      idValue: "770625015324", // Replace with a known NRIC
    };
    // await performTinSearch(myInvoiceClient, paramsCombined, "Combined Search");
  } catch (error) {
    console.error("Error in searchTaxpayerTinExample main flow:", error);
  }
}

// searchTaxpayerTinExample(); // Call the main function
```

## Step 2: Performing the TIN Search and Handling Results

Use the `client.taxpayer.searchTaxpayerTIN()` method.

```typescript
// Continued in performTinSearch function...

async function performTinSearch(
  client: MyInvoisClient,
  params: SearchTaxpayerTINRequestParams,
  searchDescription: string,
  onBehalfOfTIN?: string // Optional: if an intermediary is performing the search
) {
  console.log(`\n--- ${searchDescription} ---`);
  console.log(`Searching TIN with params:`, params);
  if (onBehalfOfTIN) {
    console.log(`As intermediary for TIN: ${onBehalfOfTIN}`);
  }

  try {
    const response: SearchTaxpayerTINResponse =
      await client.taxpayer.searchTaxpayerTIN(params, onBehalfOfTIN);
    console.log(`Successfully found TIN: ${response.tin}`);
  } catch (error: any) {
    console.error(
      `Error during "${searchDescription}":`,
      error.message || error
    );
    // The error message should provide details if it's a 400 (BadArgument or MultipleTINsFound) or 404 (NotFound)
  }
  console.log(`--- End of ${searchDescription} ---\n`);
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID`, `CLIENT_SECRET` with your actual credentials.
3.  Modify the search parameters in the example calls to `performTinSearch` to test different scenarios.
    - Ensure your search criteria are specific enough to ideally return a single TIN, as the API errors if multiple TINs match.
4.  If operating as an intermediary, provide the `onBehalfOfTIN` argument when calling `performTinSearch` and adjust the authentication accordingly.
5.  Call the main function: `searchTaxpayerTinExample();`

```typescript
// To run (after setting up credentials and parameters):
// searchTaxpayerTinExample();
```

---

This example provides a template for searching for a taxpayer's TIN. It is crucial to handle potential errors, such as when no TIN is found (404) or when the search criteria are not specific enough and multiple TINs are found (400). The API is designed to return one and only one TIN for a successful search.

**Important Considerations from API Documentation:**

- Cache TINs on your ERP side to reduce redundant calls.
- Validate/search for buyer TINs when the buyer entity is first defined in your ERP.
- Avoid calling this API immediately before every document submission.
- Adhere to rate limits (60 RPM).
