export type IInvoiceKey = "order_id" | "gross_amount" | "transaction_status" | "permata_va_number" | "va_numbers" | "bill_key" | "biller_code" | "actions" | "expiry_time" | "settlement_time" | "qr_string" | (string & {})

export type IPaymentId = "qris" | "bca" | "mandiri" | "bni" | "bri" | "permata" | "cimb" | "other_va" | (string & {})

export type IPaymentType = "bank_transfer" | "qris" | "echannel" | (string & {})

export type IPaymentTransferAccept = "bca" | "bni" | "bri" | "permata" | "cimb" | "other_va" | (string & {})

export type PaymentStatus = "pending" | "deny" | "settlement" | "expire" | "cancel" | (string & {})

export interface IInvoiceVaNumbers {
  bank: IPaymentTransferAccept
  va_number: string
}

export interface IInvoiceActions {
  name: string
  method: string
  url: string
}

export interface IInvoice {
  order_id: string
  gross_amount?: string
  transaction_status?: PaymentStatus
  expiry_time?: string
  settlement_time?: string
  va_numbers?: IInvoiceVaNumbers[]
  permata_va_number?: string
  bill_key?: string
  biller_code?: string
  actions?: IInvoiceActions[]
  qr_string?: string
}

export type IPaymentFeeType = "percent" | "flat"

export interface IPaymentFee {
  charge: number
  type: IPaymentFeeType
}

export interface IPaymentItem {
  name: string
  quantity: number
  price: number
}
export interface IPaymentTransactionDetail {
  order_id: string
  gross_amount: number
}
export interface IPaymentOptions {
  payment_type: IPaymentType
  transaction_details: IPaymentTransactionDetail
  item_details: IPaymentItem[]
  customer_details: { userId: string }
  custom_expiry?: {
    expiry_duration?: number
  }
  bank_transfer?: {
    bank?: IPaymentTransferAccept
  }
  echannel?: {
    bill_info1?: string // "Payment For:"
    bill_info2?: string // "IngetYa Digital"
  }
  qris?: { acquirer: "gopay" }
}

export interface IPayment {
  id: IPaymentId
  options: IPaymentOptions
  notifications: IInvoiceKey[]
}
