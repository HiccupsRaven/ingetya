import paymentMethods from "./paymentMethods.json"
import lang_id from "../../../../../locales/id/invoice_id.json"
import lang_en from "../../../../../locales/en/invoice_en.json"
import { ILanguage } from "../../../../types/LibTypes"

export interface IPaymentStep {
  name: string
  steps: string[]
}

export interface IPaymentFee {
  charge: number
  type: "percent" | "flat"
}

export interface IPaymentMethodInfo {
  id: string
  name: string
  fee: IPaymentFee
  howto: Record<ILanguage, IPaymentStep[]>
}

const locales: IPaymentMethodInfo[] = paymentMethods.map((method) => {
  return {
    id: method.id,
    name: method.name,
    fee: method.fee as IPaymentFee,
    howto: {
      id: lang_id.find((l) => l.id === method.id)?.howto || [],
      en: lang_en.find((l) => l.id === method.id)?.howto || []
    }
  }
})

export function getPaymentInfo(id: string): IPaymentMethodInfo | undefined {
  return locales.find((item) => item.id === id)
}

export function getAllPaymentInfo(): IPaymentMethodInfo[] {
  return locales
}
