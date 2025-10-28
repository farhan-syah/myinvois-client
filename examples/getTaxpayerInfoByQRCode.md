# Example: Get Taxpayer Info by QR Code

This document provides an example of how to use the `myinvois-client` library to retrieve a taxpayer's information using a string obtained from their MyInvois QR code.

## Prerequisites

- Valid Client ID and Client Secret for the MyInvois API (PROD or SANDBOX).
- The `myinvois-client` library installed in your project.
- A Base64 encoded string obtained from scanning a taxpayer's MyInvois QR code.

## Flow Overview

1.  **Scan QR Code**: Obtain the Base64 encoded string from the QR code.
2.  **Decode Base64 String**: Decode this string to get the `qrCodeText`.
3.  **Client Setup and Authentication**: Initialize `MyInvoisClient` and log in.
4.  **Call Get Taxpayer Info by QR Code API**: Use `client.taxpayer.getTaxpayerInfoByQRCode()` with the decoded `qrCodeText`.
5.  **Handling the Response**: Process the taxpayer's information or handle errors.

---

## Step 1: Client Setup and Authentication

This step is similar to other examples.

```typescript
import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client"; // Adjust import path
import { GetTaxpayerInfoByQRCodeResponse } from "myinvois-client/taxpayer/types"; // Adjust path

// Helper function to simulate Base64 decoding (in a real app, use a proper library or built-in function)
function base64Decode(base64String: string): string {
  try {
    // In Node.js:
    // return Buffer.from(base64String, 'base64').toString('utf8');
    // In Browser:
    return atob(base64String);
  } catch (e) {
    console.error("Failed to decode Base64 string:", e);
    throw new Error("Invalid Base64 string for QR code text.");
  }
}

async function getTaxpayerInfoByQrExample() {
  const CLIENT_ID = "your_client_id";
  const CLIENT_SECRET = "your_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  // 1. Base64 encoded string from a scanned QR code
  const base64FromQrCode = "NGUxYmM5MDctMjViNy00NWIxLTk2MjAtMmQ2NzFhNmY5Y2Fl"; // Example value

  // 2. Decode the Base64 string
  let decodedQrCodeText: string;
  try {
    decodedQrCodeText = base64Decode(base64FromQrCode);
    console.log(`Decoded QR Code Text: ${decodedQrCodeText}`); // Example: 4e1bc907-25b7-45b1-9620-2d671a6f9cae
  } catch (error: any) {
    console.error(error.message);
    return;
  }

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
    console.log("\nAuthenticating for Get Taxpayer Info by QR Code...");
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI"); // Or loginAsIntermediary
    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    await fetchAndDisplayTaxpayerInfo(myInvoiceClient, decodedQrCodeText);
  } catch (error) {
    console.error("Error in getTaxpayerInfoByQrExample main flow:", error);
  }
}

// getTaxpayerInfoByQrExample(); // Call the main function
```

## Step 2: Fetching and Displaying Taxpayer Information

Use the `client.taxpayer.getTaxpayerInfoByQRCode()` method with the **decoded** QR code string.

```typescript
// Continued in fetchAndDisplayTaxpayerInfo function...

async function fetchAndDisplayTaxpayerInfo(
  client: MyInvoisClient,
  qrCodeText: string,
  onBehalfOfTIN?: string // Optional: if an intermediary is performing the action
) {
  console.log(`\nFetching taxpayer info for QR Code Text: ${qrCodeText}`);
  if (onBehalfOfTIN) {
    console.log(`As intermediary for TIN: ${onBehalfOfTIN}`);
  }

  try {
    const response: GetTaxpayerInfoByQRCodeResponse =
      await client.taxpayer.getTaxpayerInfoByQRCode(qrCodeText, onBehalfOfTIN);

    console.log("--- Taxpayer Information ---");
    console.log(`TIN: ${response.tin}`);
    console.log(`Name: ${response.name}`);
    console.log(`ID Type: ${response.idType}, ID Number: ${response.idNumber}`);
    if (response.sst) console.log(`SST: ${response.sst}`);
    if (response.email) console.log(`Email: ${response.email}`);
    if (response.contactNumber)
      console.log(`Contact Number: ${response.contactNumber}`);
    if (response.ttx) console.log(`TTX Number: ${response.ttx}`);
    console.log(`MSIC: ${response.msic || "N/A"}`);
    console.log(
      `Business Activity (EN): ${response.businessActivityDescriptionEN || "N/A"}`
    );
    console.log(
      `Business Activity (BM): ${response.businessActivityDescriptionBM || "N/A"}`
    );
    console.log("Address:");
    console.log(`  ${response.addressLine0 || ""}`);
    if (response.addressLine1) console.log(`  ${response.addressLine1}`);
    if (response.addressLine2) console.log(`  ${response.addressLine2}`);
    console.log(`  ${response.postalZone || ""} ${response.city || ""}`);
    console.log(`  ${response.state || ""}, ${response.country || ""}`);
    console.log(`QR Generated Timestamp: ${response.generatedTimestamp}`);
    console.log("--- End of Taxpayer Information ---");
  } catch (error: any) {
    console.error(
      `Error fetching taxpayer info by QR code:`,
      error.message || error
    );
    // Handle specific errors, e.g., 404 Not Found if QR code text is invalid or not found.
  }
}
```

## Running the Example

To run this full flow:

1.  Ensure your TypeScript environment is set up.
2.  Replace placeholders for `CLIENT_ID` and `CLIENT_SECRET`.
3.  Replace `base64FromQrCode` with an actual Base64 string from a MyInvois QR code.
    - The example uses a placeholder value; a real value is needed for a successful API call.
4.  If operating as an intermediary, provide the `onBehalfOfTIN` argument when calling `fetchAndDisplayTaxpayerInfo` and adjust authentication.
5.  Call the main function: `getTaxpayerInfoByQrExample();`

```typescript
// To run (after setting up credentials and a valid Base64 QR code string):
// getTaxpayerInfoByQrExample();
```

---

This example demonstrates how to retrieve taxpayer information from a QR code. The crucial first steps are to obtain the Base64 string from the QR scan and then **decode** it before passing it to the API client method. Remember to handle potential errors, especially 404 (Not Found) if the QR code data does not correspond to a valid taxpayer record.
