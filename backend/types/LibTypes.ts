export type IValidateObject = {
  [key: string]: "string" | "number" | "boolean"
}

export type IValidateArray = string[]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IAny = any

export type IRequestType = "POST" | "GET"

export interface IResTemp {
  ok?: boolean
  code: number
  msg?: string
  data?: IAny
  error?: IAny
  errors?: IAny
}

export interface IResponse extends IResTemp {
  ok: boolean
  msg: string
}
