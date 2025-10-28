/* eslint-disable @typescript-eslint/require-await */
import {
  GetRecentDocumentsRequestParams,
  GetRecentDocumentsResponse,
  MyInvoisClient,
  MyInvoisEnvironment,
} from "myinvois-client"; // Adjust path

// --- Configuration ---
const VERBOSE_OUTPUT = false; // Set to true to print full response objects

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

// --- Main Test Function for ERP (Direct Taxpayer) ---
async function runErpGetRecentDocumentsTest() {
  console.log("Starting ERP Get Recent Documents Test for MyInvoisClient...");

  const CLIENT_ID = process.env.SANDBOX_CLIENT_ID ?? "your_sandbox_client_id";
  const CLIENT_SECRET =
    process.env.SANDBOX_CLIENT_SECRET ?? "your_sandbox_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  if (
    CLIENT_ID === "your_sandbox_client_id" ||
    CLIENT_SECRET === "your_sandbox_client_secret"
  ) {
    console.warn(
      "Please replace with actual SANDBOX credentials to run this test against the API."
    );
    // return;
  }

  const mockRedisClient = new MockRedisClient();

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT,
    mockRedisClient
  );

  try {
    console.log("\nStep 1: Authenticating as taxpayer...");
    const accessToken =
      await myInvoiceClient.auth.loginAsTaxpayer("InvoicingAPI");
    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    console.log(
      "\nStep 2: Getting recent documents with default parameters..."
    );
    const recentDocuments: GetRecentDocumentsResponse =
      await myInvoiceClient.documents.getRecentDocuments();

    if (VERBOSE_OUTPUT) {
      console.log(
        "Recent Documents Response:",
        JSON.stringify(recentDocuments, null, 2)
      );
    }

    console.log(
      "\nStep 3: Getting recent documents with pagination parameters..."
    );
    const paginationParams: GetRecentDocumentsRequestParams = {
      pageNo: 1,
      pageSize: 10,
    };

    const paginatedDocuments: GetRecentDocumentsResponse =
      await myInvoiceClient.documents.getRecentDocuments(paginationParams);

    if (VERBOSE_OUTPUT) {
      console.log(
        "Paginated Documents Response:",
        JSON.stringify(paginatedDocuments, null, 2)
      );
    }

    if (recentDocuments.result && recentDocuments.result.length >= 0) {
      console.log("\nTEST SUCCEEDED (ERP ACCESS)");
      console.log("Documents Count:", recentDocuments.result.length);
      console.log(
        "Total Pages:",
        recentDocuments.metadata?.totalPages || "N/A"
      );
      console.log(
        "Total Count:",
        recentDocuments.metadata?.totalCount || "N/A"
      );
    } else {
      console.warn("\nTEST UNCERTAIN (NO RESULT ARRAY IN RESPONSE)");
    }
  } catch (error) {
    console.error("\n--- ERROR IN ERP TEST EXECUTION ---");
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
  } finally {
    console.log("\nERP Get Recent Documents Test Completed.");
  }
}

// --- Main Test Function for OnBehalf (Intermediary) ---
async function runOnBehalfGetRecentDocumentsTest() {
  console.log(
    "Starting OnBehalf Get Recent Documents Test for MyInvoisClient..."
  );

  const CLIENT_ID = process.env.SANDBOX_CLIENT_ID ?? "your_sandbox_client_id";
  const CLIENT_SECRET =
    process.env.SANDBOX_CLIENT_SECRET ?? "your_sandbox_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";
  const INTERMEDIARY_TIN =
    process.env.SANDBOX_INTERMEDIARY_TIN ?? "EI00000000010";

  if (
    CLIENT_ID === "your_sandbox_client_id" ||
    CLIENT_SECRET === "your_sandbox_client_secret"
  ) {
    console.warn(
      "Please replace with actual SANDBOX credentials to run this test against the API."
    );
    // return;
  }

  const mockRedisClient = new MockRedisClient();

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT,
    mockRedisClient
  );

  try {
    console.log("\nStep 1: Authenticating as intermediary...");
    const accessToken = await myInvoiceClient.auth.loginAsIntermediary(
      INTERMEDIARY_TIN,
      "InvoicingAPI"
    );
    console.log(
      "Authentication successful. Token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    console.log("\nStep 2: Getting recent documents on behalf of taxpayer...");
    const recentDocuments: GetRecentDocumentsResponse =
      await myInvoiceClient.documents.getRecentDocuments({}, INTERMEDIARY_TIN);

    if (VERBOSE_OUTPUT) {
      console.log(
        "Recent Documents Response:",
        JSON.stringify(recentDocuments, null, 2)
      );
    }

    console.log(
      "\nStep 3: Getting recent documents with filters on behalf of taxpayer..."
    );
    const filterParams: GetRecentDocumentsRequestParams = {
      pageNo: 1,
      pageSize: 5,
    };

    const filteredDocuments: GetRecentDocumentsResponse =
      await myInvoiceClient.documents.getRecentDocuments(
        filterParams,
        INTERMEDIARY_TIN
      );

    if (VERBOSE_OUTPUT) {
      console.log(
        "Filtered Documents Response:",
        JSON.stringify(filteredDocuments, null, 2)
      );
    }

    if (recentDocuments.result && recentDocuments.result.length >= 0) {
      console.log("\nTEST SUCCEEDED (ON BEHALF ACCESS)");
      console.log("Documents Count:", recentDocuments.result.length);
      console.log(
        "Total Pages:",
        recentDocuments.metadata?.totalPages || "N/A"
      );
      console.log(
        "Total Count:",
        recentDocuments.metadata?.totalCount || "N/A"
      );
      console.log("Acting on behalf of TIN:", INTERMEDIARY_TIN);
    } else {
      console.warn("\nTEST UNCERTAIN (NO RESULT ARRAY IN RESPONSE)");
    }
  } catch (error) {
    console.error("\n--- ERROR IN ON BEHALF TEST EXECUTION ---");
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
  } finally {
    console.log("\nOnBehalf Get Recent Documents Test Completed.");
  }
}

// --- Run Both Tests ---
async function runAllGetRecentDocumentsTests() {
  console.log("=".repeat(60));
  console.log("RUNNING ALL GET RECENT DOCUMENTS TESTS");
  console.log("=".repeat(60));

  await runErpGetRecentDocumentsTest();

  console.log("\n" + "=".repeat(60));

  await runOnBehalfGetRecentDocumentsTest();

  console.log("\n" + "=".repeat(60));
  console.log("ALL TESTS COMPLETED");
  console.log("=".repeat(60));
}

runAllGetRecentDocumentsTests().catch((e) => {
  console.log(e);
});
