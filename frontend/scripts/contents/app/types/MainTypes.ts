import { IAny } from "../../../types/LibTypes"
import { INavButtonName } from "../Nav"

export interface CMain {
  isLocked: boolean
  readonly id: INavButtonName
  html: HTMLElement
  destroy(): IAny
  run(): IAny
}
