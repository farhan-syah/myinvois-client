# Manual UBL Document Construction (Advanced)

For more complex scenarios or when you need full control over the UBL JSON structure, you can construct the document manually. This approach requires a deeper understanding of the UBL JSON schema.

Below is an example of how you might start to build a UBL Invoice v1.1 document manually.

```typescript
import { UBLJsonInvoiceDocumentV1_1 } from "myinvois-client/ubl/json/invoice"; // Adjust path as needed

// Create the UBL document structure manually
const manualUblInvoice: UBLJsonInvoiceDocumentV1_1 = {
  _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
  _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
  Invoice: [
    {
      ID: [{ _: "INV-2023-001" }],
      IssueDate: [{ _: "2023-10-15" }],
      IssueTime: [{ _: "14:30:00Z" }],
      InvoiceTypeCode: [{ _: "01", listVersionID: "1.1" }],
      DocumentCurrencyCode: [{ _: "MYR" }],

      // You'll need to define all the nested structures manually
      // This is a highly abbreviated example.
      AccountingSupplierParty: [
        {
          Party: [
            {
              IndustryClassificationCode: [
                { _: "46510", name: "Wholesale of computers and software" },
              ],
              PartyLegalEntity: [
                {
                  RegistrationName: [{ _: "ABC Trading Sdn. Bhd." }],
                },
              ],
              // ... many more supplier details would be needed here (address, contact, etc.)
            },
          ],
        },
      ],
      AccountingCustomerParty: [
        /* ... customer details ... */
      ],
      InvoiceLine: [
        /* ... invoice line items ... */
      ],
      TaxTotal: [
        /* ... tax totals ... */
      ],
      LegalMonetaryTotal: [
        /* ... monetary totals ... */
      ],

      // For v1.1, you need to include UBLExtensions and the cac:Signature block.
      // The UBLExtensions will contain the actual ds:Signature.
      UBLExtensions: [
        // This would typically hold the UBL Extension for the digital signature.
        // Example:
        // {
        //   UBLExtension: [
        //     {
        //       ExtensionURI: [{ _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades" }],
        //       ExtensionContent: [ /* Contains UBLDocumentSignatures structure */ ]
        //     }
        //   ]
        // }
      ],
      Signature: [
        // This is the cac:Signature block
        {
          ID: [{ _: "urn:oasis:names:specification:ubl:signature:Invoice" }], // Referenced by UBLExtension
          SignatureMethod: [
            { _: "urn:oasis:names:specification:ubl:dsig:enveloped:xades" },
          ],
          // The actual <ds:Signature> is embedded within UBLExtensions, not directly here.
          // This cac:Signature block mainly acts as a placeholder and reference point.
        },
      ],
    },
  ],
};

// To use this 'manualUblInvoice', you would typically:
// 1. Fully populate all required fields according to UBL specifications.
// 2. If signing (for v1.1), generate the digital signature components (as shown in detailedDigitalSignatureGuide.md)
//    and correctly embed them within the UBLExtensions.
// 3. Stringify the object: JSON.stringify(manualUblInvoice)
// 4. Proceed with submission steps (hashing, base64 encoding, API call).

console.log(
  "Manually constructed UBL Invoice (partial):",
  JSON.stringify(manualUblInvoice, null, 2)
);
```

**Note:** Manually constructing UBL documents is error-prone and complex. It is generally recommended to use the helper functions (`createUblJsonInvoiceDocument`) provided by this library, as they simplify the process and ensure a correctly structured document. This manual approach is provided for advanced users or for educational purposes to understand the underlying structure.
