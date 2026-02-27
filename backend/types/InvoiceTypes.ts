import { IAny } from "./LibTypes"

export type IInvoiceKey = "order_id" | "gross_amount" | "transaction_status" | "permata_va_number" | "va_numbers" | "bill_key" | "biller_code" | "actions" | "expiry_time" | "settlement_time" | "confirmed" | (string & {})

export type IInvoice = Record<IInvoiceKey, IAny>

export type IPaymentId = "qris" | "bca" | "mandiri" | "bni" | "bri" | "permata" | "cimb" | "other_va" | (string & {})

export type IPaymentType = "bank_transfer" | "qris" | "echannel" | (string & {})

export type IPaymentTransferAccept = "bca" | "bni" | "bri" | "permata" | "cimb" | (string & {})

export type IPaymentFeeType = "percent" | "flat"

export interface IPaymentFee {
  charge: number
  type: IPaymentFeeType
}

export interface IPaymentOptions {
  payment_type: IPaymentId
  custom_expiry?: {
    expiry_duration?: number
  }
  bank_transfer?: {
    bank?: string
  }
  echannel?: {
    bill_info1?: string // "Payment For:"
    bill_info2?: string // "IngetYa Digital"
  }
}

export interface IPayment {
  id: IPaymentId
  options: IPaymentOptions
  notifications: IInvoiceKey[]
}
