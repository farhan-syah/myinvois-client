// einvoice/src/utils/invoiceCalculations.ts

// Simplified UBL-like interfaces based on the calculation descriptions
// In a real scenario, these would align with a more complete UBL JSON model.

interface UBLPrice {
  PriceAmount?: number; // cbc:PriceAmount
}

interface UBLAllowanceCharge {
  ChargeIndicator: boolean; // true for charge, false for discount
  Amount?: number; // cbc:Amount
}

interface UBLTaxCategory {
  ID?: string; // Tax type identifier, e.g., 'S' for Standard Rate, 'E' for Exempt
  Percent?: number; // Tax percentage
}

interface UBLTaxSubtotal {
  TaxableAmount?: number; // cbc:TaxableAmount
  TaxAmount?: number; // cbc:TaxAmount
  TaxCategory?: UBLTaxCategory; // cac:TaxCategory
}

interface UBLTaxTotal {
  TaxAmount?: number; // cbc:TaxAmount (overall tax for this TaxTotal entry)
  TaxSubtotal?: UBLTaxSubtotal[]; // cac:TaxSubtotal
}

interface UBLItemPriceExtension {
  Amount?: number; // Subtotal for the line after item-level discount/charge but before line-level tax
}

interface UBLInvoiceLine {
  ID: string; // Line ID
  InvoicedQuantity?: number; // cbc:InvoicedQuantity
  LineExtensionAmount?: number; // cbc:LineExtensionAmount (Total amount for the line, excluding tax)
  Price?: UBLPrice; // cac:Price (Unit Price)
  ItemPriceExtension?: UBLItemPriceExtension; // cac:ItemPriceExtension (Subtotal)
  AllowanceCharge?: UBLAllowanceCharge[]; // cac:AllowanceCharge (Discounts/Charges on this line)
  TaxTotal?: UBLTaxTotal[]; // cac:TaxTotal (Taxes applicable to this line)
}

interface UBLLegalMonetaryTotal {
  LineExtensionAmount?: number; // Sum of all InvoiceLine/LineExtensionAmount
  TaxExclusiveAmount?: number; // Total amount excluding taxes (LineExtensionAmount - AllowanceTotalAmount + ChargeTotalAmount)
  TaxInclusiveAmount?: number; // Total amount including taxes (TaxExclusiveAmount + TaxTotal/TaxAmount)
  AllowanceTotalAmount?: number; // Total of all invoice-level discounts
  ChargeTotalAmount?: number; // Total of all invoice-level charges
  PrepaidAmount?: number; // Total prepaid amount
  PayableRoundingAmount?: number; // Rounding adjustment
  PayableAmount?: number; // Final amount due (TaxInclusiveAmount - PrepaidAmount + PayableRoundingAmount)
}

interface UBLPrepaidPayment {
  PaidAmount?: number; // cbc:PaidAmount
}

export interface UBLInvoice {
  InvoiceLine: UBLInvoiceLine[]; // cac:InvoiceLine
  TaxTotal?: UBLTaxTotal[]; // cac:TaxTotal (Invoice-level taxes)
  AllowanceCharge?: UBLAllowanceCharge[]; // cac:AllowanceCharge (Invoice-level additional discounts/charges)
  LegalMonetaryTotal: UBLLegalMonetaryTotal; // cac:LegalMonetaryTotal
  PrepaidPayment?: UBLPrepaidPayment[]; // cac:PrepaidPayment
}

/**
 * Calculates the subtotal for an invoice line.
 * Subtotal = (Unit Price) * (Quantity)
 */
export function calculateLineSubtotal(line: UBLInvoiceLine): number {
  const unitPrice = line.Price?.PriceAmount ?? 0;
  const quantity = line.InvoicedQuantity ?? 0;
  return unitPrice * quantity;
}

/**
 * Calculates the total excluding tax at the invoice line level.
 * Total Excluding Tax (Line) = (Subtotal) - SUM(Discounts) + SUM(Charges)
 * Note: UBL often uses LineExtensionAmount for this, which might already incorporate item-level allowances/charges.
 * This function re-calculates based on explicit AllowanceCharge elements on the line.
 * If line.ItemPriceExtension.Amount is the subtotal before line-level allowances/charges:
 */
export function calculateLineTotalExcludingTax(line: UBLInvoiceLine): number {
  let total = line.ItemPriceExtension?.Amount ?? calculateLineSubtotal(line); // Start with subtotal
  if (line.AllowanceCharge) {
    for (const ac of line.AllowanceCharge) {
      const amount = ac.Amount ?? 0;
      if (ac.ChargeIndicator === false) { // Discount
        total -= amount;
      } else { // Charge
        total += amount;
      }
    }
  }
  return total;
  // Or, if LineExtensionAmount is considered definitive:
  // return line.LineExtensionAmount ?? 0;
}

/**
 * Calculates the total net amount for the invoice (sum of line extension amounts).
 * This is often provided as LegalMonetaryTotal.LineExtensionAmount.
 */
export function calculateTotalNetAmount(invoice: UBLInvoice): number {
  return invoice.InvoiceLine.reduce((sum, line) => sum + (line.LineExtensionAmount ?? 0), 0);
}

/**
 * Calculates the total discount value at the invoice level from explicit AllowanceCharges.
 * This is often provided as LegalMonetaryTotal.AllowanceTotalAmount.
 */
export function calculateTotalDiscountValue(invoice: UBLInvoice): number {
  return invoice.AllowanceCharge?.filter(ac => ac.ChargeIndicator === false)
    .reduce((sum, ac) => sum + (ac.Amount ?? 0), 0) ?? 0;
}

/**
 * Calculates the total charge value (fee amount) at the invoice level from explicit AllowanceCharges.
 * This is often provided as LegalMonetaryTotal.ChargeTotalAmount.
 */
export function calculateTotalChargeValue(invoice: UBLInvoice): number {
  return invoice.AllowanceCharge?.filter(ac => ac.ChargeIndicator === true)
    .reduce((sum, ac) => sum + (ac.Amount ?? 0), 0) ?? 0;
}

/**
 * Calculates the total excluding tax at the invoice level.
 * Total Excluding Tax (Invoice) = (Total net amount) - (Total discount value) + (Total charge value)
 * This is often provided as LegalMonetaryTotal.TaxExclusiveAmount.
 */
export function calculateInvoiceTotalExcludingTax(invoice: UBLInvoice): number {
  const totalNetAmount = invoice.LegalMonetaryTotal?.LineExtensionAmount ?? calculateTotalNetAmount(invoice);
  const totalDiscount = invoice.LegalMonetaryTotal?.AllowanceTotalAmount ?? calculateTotalDiscountValue(invoice);
  const totalCharge = invoice.LegalMonetaryTotal?.ChargeTotalAmount ?? calculateTotalChargeValue(invoice);
  return totalNetAmount - totalDiscount + totalCharge;
}

/**
 * Calculates the total tax amount for the entire invoice.
 * Sum of TaxAmount from all TaxSubtotal elements in all invoice-level TaxTotal elements.
 * This is often provided in LegalMonetaryTotal.TaxInclusiveAmount - LegalMonetaryTotal.TaxExclusiveAmount,
 * or as a sum of TaxTotal[n].TaxAmount.
 */
export function calculateTotalTaxAmountInvoiceLevel(invoice: UBLInvoice): number {
  let totalTax = 0;
  if (invoice.TaxTotal) {
    for (const taxTotal of invoice.TaxTotal) {
      // Option 1: Summing up TaxSubtotal amounts if TaxTotal.TaxAmount isn't directly the sum
      if (taxTotal.TaxSubtotal) {
        for (const subTotal of taxTotal.TaxSubtotal) {
          totalTax += subTotal.TaxAmount ?? 0;
        }
      } 
      // Option 2: If TaxTotal.TaxAmount is the sum for that category and it's an invoice level summary
      // else if (taxTotal.TaxAmount) { 
      //   totalTax += taxTotal.TaxAmount;
      // }
    }
  }
  // Fallback or primary: if LegalMonetaryTotal provides the components
  if (invoice.LegalMonetaryTotal?.TaxInclusiveAmount !== undefined && invoice.LegalMonetaryTotal?.TaxExclusiveAmount !== undefined) {
      return (invoice.LegalMonetaryTotal.TaxInclusiveAmount ?? 0) - (invoice.LegalMonetaryTotal.TaxExclusiveAmount ?? 0);
  }
  return totalTax;
}


/**
 * Calculates the total including tax for the invoice.
 * Total Including Tax = (Total Excluding Tax) + (Total tax amount on invoice level)
 * This is often provided as LegalMonetaryTotal.TaxInclusiveAmount.
 */
export function calculateInvoiceTotalIncludingTax(invoice: UBLInvoice): number {
  const totalExcludingTax = invoice.LegalMonetaryTotal?.TaxExclusiveAmount ?? calculateInvoiceTotalExcludingTax(invoice);
  const totalTax = calculateTotalTaxAmountInvoiceLevel(invoice); // Use previously defined function
  return totalExcludingTax + totalTax;
}

/**
 * Calculates the total payable amount for the invoice.
 * Total Payable Amount = (Total Including Tax) - (Pre-Payment Amount) + (PayableRoundingAmount)
 * This is often provided as LegalMonetaryTotal.PayableAmount.
 */
export function calculateInvoiceTotalPayableAmount(invoice: UBLInvoice): number {
  const totalIncludingTax = invoice.LegalMonetaryTotal?.TaxInclusiveAmount ?? calculateInvoiceTotalIncludingTax(invoice);
  const prepaidAmount = invoice.PrepaidPayment?.reduce((sum, p) => sum + (p.PaidAmount ?? 0), 0) 
                        ?? invoice.LegalMonetaryTotal?.PrepaidAmount ?? 0;
  const roundingAmount = invoice.LegalMonetaryTotal?.PayableRoundingAmount ?? 0;
  return totalIncludingTax - prepaidAmount + roundingAmount;
}

/**
 * Calculates the total taxable amount for a specific tax type.
 * SUM(LineExtensionAmount of lines with this tax type) - SUM(Amount Exempted from Tax for this tax type)
 */
export function calculateTotalTaxableAmountPerTaxType(invoice: UBLInvoice, taxTypeId: string): number {
  let taxableAmount = 0;
  for (const line of invoice.InvoiceLine) {
    let lineContributesToTaxType = false;
    let lineExemptAmountForType = 0;

    if (line.TaxTotal) {
      for (const lt of line.TaxTotal) {
        if (lt.TaxSubtotal) {
          for (const lts of lt.TaxSubtotal) {
            if (lts.TaxCategory?.ID === taxTypeId) {
              lineContributesToTaxType = true;
              // If 'E' means exempt, this taxable amount might be 0 or specifically marked.
              // The rule "Amount Exempted from Tax" refers to /cac:TaxCategory/cbc:ID = 'E'.
              // This interpretation is tricky: is it sum of LineExtensionAmounts for lines *subject* to this tax,
              // or sum of TaxSubtotal.TaxableAmount where TaxCategory.ID matches?
              // Using TaxSubtotal.TaxableAmount seems more direct from UBL.
              taxableAmount += lts.TaxableAmount ?? 0;
            }
            // Check for exemption specific to this tax type (e.g. if a line has tax type S and also an E exemption for S)
            // This logic might need more complex UBL knowledge. Assuming 'E' means general exemption.
            if (lts.TaxCategory?.ID === 'E' && lineContributesToTaxType) {
                // This part is complex. If a line is subject to tax 'S' but has an 'E' exemption,
                // its LineExtensionAmount might be counted in TaxableAmount then an exemption amount subtracted.
                // The formula "(Amount Exempted from Tax)" is not clearly scoped in the line context for a *specific* tax type.
                // For simplicity, if TaxSubtotal.TaxCategory.ID matches, we sum its TaxableAmount.
                // If there's a general 'E' on the line, that specific line's contribution might be adjusted.
            }
          }
        }
      }
    }
  }

  // Simpler interpretation: Summing up TaxSubtotal.TaxableAmount from INVOICE LEVEL TaxTotal for the given taxType.
  // This aligns with "Total taxable amount per tax type" often being an invoice-level summary.
  let invoiceLevelTaxableAmount = 0;
  invoice.TaxTotal?.forEach(tt => {
    tt.TaxSubtotal?.forEach(ts => {
      if (ts.TaxCategory?.ID === taxTypeId) {
        invoiceLevelTaxableAmount += ts.TaxableAmount ?? 0;
      }
      // If taxTypeId is 'E', sum all TaxableAmounts marked as exempt
      if (taxTypeId === 'E' && ts.TaxCategory?.ID === 'E') {
        // This calculation seems to be "total amount that IS taxable for a type",
        // not "how much is exempt under a certain tax scheme".
      }
    });
  });
  // The formula "SUM(/ ubl:Invoice / cac:InvoiceLine / cbc:LineExtensionAmount (Total Excluding Tax) [same tax type]) - (/ ubl:Invoice / cac:InvoiceLine / cac:TaxTotal / cac:TaxSubtotal / cbc:TaxableAmount[cac:TaxCategory / cbc:ID) = ‘E’] (Amount Exempted from Tax))"
  // is a bit ambiguous. The example above uses invoice-level totals.
  // A line-based sum would be:
  // invoice.InvoiceLine.filter(line => lineHasTaxType(line, taxTypeId)).reduce((sum, line) => sum + (line.LineExtensionAmount ?? 0), 0)
  // minus exemptions.
  // For now, returning the sum of TaxableAmounts from invoice level TaxSubtotals for that type:
  return invoiceLevelTaxableAmount;
}

/**
 * Calculates the total tax amount for a specific tax type.
 * SUM(TaxAmount of lines with this tax type)
 * Or more directly: sum of TaxSubtotal.TaxAmount from invoice-level TaxTotal for the specific tax type.
 */
export function calculateTotalTaxAmountPerTaxType(invoice: UBLInvoice, taxTypeId: string): number {
  let totalTaxForType = 0;
  if (invoice.TaxTotal) {
    for (const taxTotal of invoice.TaxTotal) {
      if (taxTotal.TaxSubtotal) {
        for (const subTotal of taxTotal.TaxSubtotal) {
          if (subTotal.TaxCategory?.ID === taxTypeId) {
            totalTaxForType += subTotal.TaxAmount ?? 0;
          }
        }
      }
    }
  }
  return totalTaxForType;
}
