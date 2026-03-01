import { IPaymentId } from "./InvoiceTypes"

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
