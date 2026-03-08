import { IPaymentFee, IPaymentId } from "./InvoiceTypes"

export type IConfigDB = {
  MONGODB_INSTALLED: boolean
}

export type IConfigVersion = {
  version: string
}

export type IConfigWebhook = {
  errors: string
  accounts: string
  clients: string
  traffics: string
}

export interface IItemPackage {
  id: string
  type: number
  price: number
  note?: string
}

export interface IPaymentPackage {
  id: IPaymentId
  name: string
  fee: IPaymentFee
}
