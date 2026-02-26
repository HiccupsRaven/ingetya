export type SSKelement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IAny = any

export type IQueries = Record<string, string | number | boolean | null>

export type IRequestType = "POST" | "GET"

export interface IResponse {
  ok: boolean
  code: number
  msg: string
  data?: IAny
}

export interface ILocale {
  id: string
  en: string
}

export interface KelementAttr {
  c?: string
  class?: string
  "."?: string
  id?: string
  "#"?: string
  a?: {
    [key: string]: string | number | boolean
  }
  attr?: {
    [key: string]: string | number | boolean
  }
  child?: SSKelement | string | (SSKelement | string)[]
  e?: SSKelement | string | (SSKelement | string)[]
}
export interface ILocale {
  id: string
  en: string
}

export type ILanguage = "id" | "en"
