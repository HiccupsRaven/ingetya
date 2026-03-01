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
  name?: string
  date?: number
}

export interface IOrder {
  id: string
  userId: string
  productId: string
  status: OrderStatus
  data?: IOrderData
}

export const AccountMemory: Partial<IAccount> & IAny = {}

export const ProductsMemory: IProduct[] = []

export const OrdersMemory: Array<IOrder | null> = [null]
