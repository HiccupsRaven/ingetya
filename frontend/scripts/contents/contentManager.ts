import { IAny } from "../types/LibTypes"

export interface IAccount {
  id: string
  lunaId: string
}
export enum ProductGroup {
  Invitation = 1,
  GuestBook = 2
}
export interface IProduct {
  id: string
  group: ProductGroup
  thumbnail: string
  url: string
  name: string
}

export enum OrderStatus {
  Unpaid = 1,
  Working = 2,
  Active = 3,
  Canceled = 4
}

export interface IOrderData {
  name: string
  date: number
  end?: number
}

export type IPaymentId = "qris" | "bca" | "mandiri" | "bni" | "bri" | "permata" | "cimb" | "other_va" | (string & {})

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
  transaction_status: PaymentStatus
  gross_amount?: string
  expiry_time?: string
  settlement_time?: string
  va_numbers?: IInvoiceVaNumbers[]
  permata_va_number?: string
  bill_key?: string
  biller_code?: string
  actions?: IInvoiceActions[]
  qr_string?: string
  iya_expiry: number
  iya_price: number
  iya_uid: string
}
export interface IOrder {
  id: string
  userId: string
  productId: string
  itemId: string
  paymentId: IPaymentId
  addons?: string[]
  status: OrderStatus
  data: IOrderData
}

export const AccountMemory: Partial<IAccount> & IAny = {}

export const ProductsMemory: IProduct[] = []

export const OrdersMemory: Array<IOrder | null> = [null]

export const InvoicesMemory: Array<IInvoice | null> = [null]
