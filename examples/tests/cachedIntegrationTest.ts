/* eslint-disable @typescript-eslint/require-await */
import {
  MyInvoisClient,
  MyInvoisEnvironment,
  CreateInvoiceDocumentParams,
  createUblJsonInvoiceDocument,
  IdentificationScheme,
  SubmitDocumentsRequest,
  SubmitDocumentsResponse,
  UBLJsonInvoiceDocumentV1_0,
} from "myinvois-client"; // Adjust path

// --- Environment-Specific Helper Implementations (YOU NEED TO PROVIDE THESE) ---

// For Node.js environment
async function calculateSHA256HexNode(text: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function encodeBase64Node(text: string): string {
  return Buffer.from(text, "utf8").toString("base64");
}
// Choose the correct helpers based on your test environment
// For this example, let's assume a Node.js testing environment conceptually
const calculateSHA256Hex = calculateSHA256HexNode; // Or calculateSHA256HexBrowser
const encodeBase64 = encodeBase64Node; // Or encodeBase64Browser

// --- Mock Redis Client for Testing Cache ---
class MockRedisClient {
  private store = new Map<string, string>();
  private ttlStore = new Map<string, number>(); // To simulate TTL expiry

  async get(key: string): Promise<string | null> {
    const expiryTime = this.ttlStore.get(key);
    if (expiryTime && Date.now() > expiryTime) {
      console.log(`MockRedisClient: TTL expired for key "${key}". Deleting.`);
      this.store.delete(key);
      this.ttlStore.delete(key);
      return null;
    }
    const value = this.store.get(key);
    // Shorten logged value if it's very long (like a token)
    const loggedValue = value
      ? value.length > 100
        ? `"${value.substring(0, 30)}...${value.substring(value.length - 10)} (length ${value.length})"`
        : `"${value}"`
      : "null";
    console.log(`MockRedisClient: GET key "${key}", value: ${loggedValue}`);
    return value ?? null;
  }

  async set(
    key: string,
    value: string,
    commandOptions?: { EX: number }
  ): Promise<unknown> {
    // Shorten logged value
    const loggedValue =
      value.length > 100
        ? `"${value.substring(0, 30)}...${value.substring(value.length - 10)} (length ${value.length})"`
        : `"${value}"`;
    console.log(
      `MockRedisClient: SET key "${key}", value: ${loggedValue}, TTL: ${commandOptions?.EX}s`
    );
    this.store.set(key, value);
    if (commandOptions?.EX) {
      this.ttlStore.set(key, Date.now() + commandOptions.EX * 1000);
    }
    return "OK";
  }

  clear() {
    this.store.clear();
    this.ttlStore.clear();
    console.log("MockRedisClient: Store cleared.");
  }

  // Helper to inspect a key without affecting TTL logic for testing
  peek(key: string): string | undefined {
    return this.store.get(key);
  }
}

// --- Dummy Cryptographic Materials & Setup (REMOVED as Invoice 1.0 doesn't use UBLExtensions/Signature) ---

// --- Main Test Function ---
async function runFullIntegrationTest() {
  console.log(
    "Starting Full Integration Test for MyInvoisClient (Invoice 1.0)..."
  );

  const CLIENT_ID = process.env.SANDBOX_CLIENT_ID ?? "your_sandbox_client_id";
  const CLIENT_SECRET =
    process.env.SANDBOX_CLIENT_SECRET ?? "your_sandbox_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";
  const SUPPLIER_TIN = process.env.SANDBOX_SUPPLIER_TIN ?? "EI00000000010";
  const SUPPLIER_IDENTIFICATION_NUMBER =
    process.env.SANDBOX_SUPPLIER_IDENTIFICATION_NUMBER ?? "202001234567";
  const SUPPLIER_IDENTIFICATION_SCHEME =
    process.env.SANDBOX_CUSTOMER_IDENTIFICATION_SCHEME ?? "BRN";
  const CUSTOMER_TIN = process.env.SANDBOX_CUSTOMER_TIN ?? "EI00000000010";
  const CUSTOMER_IDENTIFICATION_NUMBER =
    process.env.SANDBOX_CUSTOMER_IDENTIFICATION_NUMBER ?? "202001234567";
  const CUSTOMER_IDENTIFICATION_SCHEME =
    process.env.SANDBOX_CUSTOMER_IDENTIFICATION_SCHEME ?? "BRN";
  if (
    CLIENT_ID === "your_sandbox_client_id" ||
    CLIENT_SECRET === "your_sandbox_client_secret"
  ) {
    console.warn(
      "Please replace with actual SANDBOX credentials to run this test against the API."
    );
    // return;
  }

  const mockRedisClient = new MockRedisClient(); // Instantiate the mock

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT,
    mockRedisClient // Pass the mock client
  );

  try {
    console.log("\nStep 1: Authenticating as taxpayer (first attempt)...");
    let accessToken = // Changed to let
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    console.log(
      "First authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    console.log(
      "\nStep 1a: Authenticating as taxpayer (second attempt - should use cache)..."
    );
    const accessTokenFromCacheAttempt =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    console.log(
      "Second authentication attempt. Token (first 20 chars):",
      accessTokenFromCacheAttempt.substring(0, 20) + "..."
    );

    if (accessToken === accessTokenFromCacheAttempt) {
      console.log(
        "Tokens match, cache likely used as expected by MyInvoisClient."
      );
    } else {
      console.warn(
        "WARN: Access tokens from first and second (cached) calls MISMATCH. " +
          "This implies MyInvoisClient initiated a new token fetch despite AuthService potentially having a cache. " +
          "Check MockRedisClient logs for GET/SET operations. " +
          `Token1: ${accessToken.substring(0, 20)}... Token2: ${accessTokenFromCacheAttempt.substring(0, 20)}...`
      );
      // The MyInvoisClient manages its own accessToken state. If it decided the cached token (via AuthService)
      // wasn't suitable (e.g., expired by its own check AFTER AuthService returned it), it would fetch a new one.
      // This new one would then be cached by AuthService.
      // For the test to proceed, use the latest token obtained.
      accessToken = accessTokenFromCacheAttempt;
    }
    console.log(
      "Proceeding with Access Token (first 20 chars): " +
        accessToken.substring(0, 20) +
        "..."
    );

    console.log(
      "\nStep 2: Constructing UBL Invoice JSON using createUblJsonInvoiceDocument (Version 1.0)..."
    );
    const currentDate = new Date();
    const issueDateStr = currentDate.toISOString().split("T")[0];
    const issueTimeStr = currentDate.toISOString().substring(11, 16) + ":00Z";
    const invoiceId = `TEST-INV10-${Date.now()}`;

    // return;
    // Populate CreateInvoiceDocumentParams
    const invoiceParams: CreateInvoiceDocumentParams = {
      id: invoiceId,
      issueDate: issueDateStr,
      issueTime: issueTimeStr,
      documentCurrencyCode: "MYR",
      taxCurrencyCode: "MYR",
      supplier: {
        legalName: "Test Supplier Sdn. Bhd.",
        address: {
          cityName: "Kuala Lumpur",
          postalZone: "50000",
          countrySubentityCode: "14", // Assuming MalaysianStateCode for W.P. Kuala Lumpur
          countryCode: "MYS",
          addressLines: ["Street 1", "Area"],
        },
        TIN: SUPPLIER_TIN,
        identificationNumber: SUPPLIER_IDENTIFICATION_NUMBER,
        identificationScheme:
          SUPPLIER_IDENTIFICATION_SCHEME as IdentificationScheme,
        telephone: "+60123456789",
        industryClassificationCode: "46510",
        industryClassificationName:
          "Wholesale of computer hardware, software and peripherals",
      },
      customer: {
        legalName: "Test Customer Bhd.",
        address: {
          cityName: "Petaling Jaya",
          postalZone: "46000",
          countrySubentityCode: "10", // Assuming MalaysianStateCode for Selangor
          countryCode: "MYS",
          addressLines: ["Customer Street 1", "Customer Area"],
        },
        TIN: CUSTOMER_TIN,
        identificationNumber: CUSTOMER_IDENTIFICATION_NUMBER,
        identificationScheme:
          CUSTOMER_IDENTIFICATION_SCHEME as IdentificationScheme,
        telephone: "+60123456789",
      },
      taxTotal: {
        totalTaxAmount: 1.0,
        taxSubtotals: [
          {
            taxableAmount: 10.0,
            taxAmount: 1.0,
            taxCategoryCode: "01", // Assuming TaxTypeCode
            percent: 10,
          },
        ],
      },
      legalMonetaryTotal: {
        lineExtensionAmount: 10.0,
        taxExclusiveAmount: 10.0,
        taxInclusiveAmount: 11.0,
        payableAmount: 11.0,
      },
      invoiceLines: [
        {
          id: "1",
          quantity: 1,
          unitPrice: 10.0,
          unitCode: "UNT",
          subtotal: 10.0,
          itemDescription: "Test Item",
          itemCommodityClassification: {
            code: "001", // Assuming ClassificationCode
            listID: "CLASS",
          },
          lineTaxTotal: {
            taxAmount: 1.0,
            taxSubtotals: [
              {
                taxableAmount: 10.0,
                taxAmount: 1.0,
                taxCategoryCode: "01", // Assuming TaxTypeCode
                percent: 10,
              },
            ],
          },
        },
      ],
      // Note: For Invoice 1.0, ublExtensions and signatureId/Method are not used by the helper
      // and will be omitted from the generated JSON.
    };

    // Generate the full UBL Invoice Document for version 1.0
    // The type assertion is safe because we are passing "1.0"
    const fullUblDocument = createUblJsonInvoiceDocument(
      invoiceParams,
      "1.0"
    ) as UBLJsonInvoiceDocumentV1_0;

    console.log("UBL Invoice 1.0 Document generated.");
    // console.log(JSON.stringify(fullUblDocument, null, 2)); // For debugging the generated structure

    console.log("\nStep 3 : Preparing Document for API Submission..."); // Renumbering step
    const finalInvoiceJsonString = JSON.stringify(fullUblDocument);

    const documentHash = await calculateSHA256Hex(finalInvoiceJsonString);
    console.log("Document Hash (SHA256 Hex):", documentHash);

    const documentBase64 = encodeBase64(finalInvoiceJsonString);

    console.log(documentBase64);

    const documentToSubmit = {
      format: "JSON" as const,
      document: documentBase64,
      documentHash: documentHash,
      codeNumber: invoiceId,
    };

    const submissionRequest: SubmitDocumentsRequest = {
      documents: [documentToSubmit],
    };

    console.log("\nStep 4 : Submitting Document to MyInvois API..."); // Renumbering step
    const submissionResponse: SubmitDocumentsResponse =
      await myInvoiceClient.documents.submitDocuments(submissionRequest);
    console.log(
      "Submission Response:",
      JSON.stringify(submissionResponse, null, 2)
    );
    if (
      submissionResponse.acceptedDocuments &&
      submissionResponse.acceptedDocuments.length > 0
    ) {
      console.log("\nTEST SUCCEEDED (API ACCEPTED THE DOCUMENT CONCEPTUALLY)");
      console.log(
        "Accepted Document UUID:",
        submissionResponse.acceptedDocuments[0].uuid
      );
    } else if (
      submissionResponse.rejectedDocuments &&
      submissionResponse.rejectedDocuments.length > 0
    ) {
      console.error("\nTEST FAILED (API REJECTED THE DOCUMENT):");
      console.error(
        "Rejection Details:",
        JSON.stringify(submissionResponse.rejectedDocuments, null, 2)
      );
    } else {
      console.warn(
        "\nTEST UNCERTAIN (NO CLEAR ACCEPTANCE/REJECTION IN RESPONSE)"
      );
    }
  } catch (error) {
    console.error("\n--- ERROR IN TEST EXECUTION ---");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      const e = error as any;
      if (e.response?.data) {
        console.error(
          "Error details:",
          JSON.stringify(e.response.data, null, 2)
        );
      } else if (e.error?.errorCode) {
        console.error("Error details:", JSON.stringify(e.error, null, 2));
      } else {
        console.error("Full error object:", error);
      }
    } else {
      console.error("An unknown error occurred:", error);
    }

    console.log("-----------------------------");
  } finally {
    console.log("\nFull Integration Test Completed.");
  }
}

runFullIntegrationTest().catch((e) => {
  console.log(e);
});
