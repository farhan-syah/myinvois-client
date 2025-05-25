export interface Einvoice {
  id: string;
  name: string;
  items: EinvoiceItem[];
  total: number;
  status: EinvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EinvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export enum EinvoiceStatus {
  Pending = "pending",
  Paid = "paid",
  Overdue = "overdue",
}

// Standard error response structure for MyInvois API calls
export interface MyInvoisDetailedError {
  propertyName: string | null;
  propertyPath: string | null;
  errorCode: string;
  error: string; // Human readable error message in English
  errorMS: string; // Human readable error message in Malay
  target?: string | null; // Optional: the target/subject of the error
  details?: MyInvoisDetailedError[] | null; // Optional: list of multiple errors
  message?: string;
}

export interface MyInvoisGenericApiResponseError {
  status?: string; // Optional, e.g., "Invalid"
  error: MyInvoisDetailedError;
  name?: string; // Optional, e.g., "Step03-Duplicated Submission Validator"
}
