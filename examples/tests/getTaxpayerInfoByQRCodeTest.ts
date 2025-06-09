import { MyInvoisClient, MyInvoisEnvironment } from "myinvois-client";

// --- Main Test Function ---
async function runFullTest() {
  const CLIENT_ID = process.env.SANDBOX_CLIENT_ID ?? "your_sandbox_client_id";
  const CLIENT_SECRET =
    process.env.SANDBOX_CLIENT_SECRET ?? "your_sandbox_client_secret";
  const ENVIRONMENT: MyInvoisEnvironment = "SANDBOX";

  const myInvoiceClient = new MyInvoisClient(
    CLIENT_ID,
    CLIENT_SECRET,
    ENVIRONMENT
  );
  console.log("\nStep 1: Authenticating as taxpayer...");
  const accessToken = await myInvoiceClient.auth.loginAsTaxpayer();
  console.log(
    "Authentication successful. Token (first 20 chars):",
    accessToken.substring(0, 20) + "..."
  );

  const response = await myInvoiceClient.taxpayer.getTaxpayerInfoByQRCode(
    "0b8d4613-c995-492b-bc1a-a5ff464b2bad"
  );

  console.log(response);
}

runFullTest().catch((e) => {
  console.log(e);
});
