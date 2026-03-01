import { IAny, IQueries } from "../types/LibTypes"

export function parseBase64(query: IAny): IQueries {
  try {
    const data = JSON.parse(atob(query))
    return data
  } catch (err) {
    console.error(err)
    return { errorParse: true }
  }
}

export function toBase64(query: IAny): string {
  try {
    const data = btoa(JSON.stringify(query))
    return data
  } catch (err) {
    console.error(err)
    const data = btoa(JSON.stringify({ errorParse: true }))
    return data
  }
}

export function toMoneyFormat(amount: string | number): string {
  const cost = typeof amount === "string" ? amount : amount.toString()
  return cost.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}
