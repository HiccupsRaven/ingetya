import { IAny } from "./LibTypes"

export interface ILunaPrimary {
  isLocked: boolean
  destroy(): IAny
  id: string
}
