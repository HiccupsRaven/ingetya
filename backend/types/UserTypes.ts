export type UserProvider = "google" | "discord" | "github" | "tiktok" | "facebook" | "luunna" | "ingetya"

export interface IExternalUserData {
  externalId: string
  email: string
  provider: UserProvider
  name?: string
}

export interface IExternalUser {
  id: string
  data: IExternalUserData[]
  created: number
}

export interface IUserSession {
  id: string
  created: number
}

export interface IUser {
  id: string
  externalId: string
  email: string
  created: number
  access?: number
}

export type IUserTemp = Partial<IUser>

export interface IUserSafe {
  id: string
  email: string
  lunaId: string
}
