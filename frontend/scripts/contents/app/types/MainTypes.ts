import { IAny } from "../../../types/LibTypes"
import { CMainKey } from "../Main"

export interface CMain {
  isLocked: boolean
  readonly id: CMainKey
  html: HTMLElement
  destroy(): IAny
  run(): IAny
}
