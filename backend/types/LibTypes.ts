/* eslint-disable @typescript-eslint/no-explicit-any */

export type IValidateObject = {
  [key: string]: "string" | "number" | "boolean"
}

export type IValidateArray = string[]

export type IAny = any

export type IRequestType = "POST" | "GET"

export interface IResTemp {
  ok?: boolean
  code: number
  msg?: string
  data?: any
}

export interface IResponse extends IResTemp {
  ok: boolean
  msg: string
}
