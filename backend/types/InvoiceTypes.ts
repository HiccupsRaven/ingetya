import { IAny } from "./LibTypes"

export type IInvoiceKey = "order_id" | "gross_amount" | "transaction_status" | "permata_va_number" | "va_numbers" | "bill_key" | "biller_code" | "actions" | "expiry_time" | "settlement_time" | "confirmed"

export type IInvoice = Record<IInvoiceKey, IAny>
