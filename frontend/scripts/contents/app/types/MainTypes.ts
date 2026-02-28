import { IAny } from "../../../types/LibTypes"
import { IHistoryState } from "../Main"
import { INavButtonName } from "../Nav"

export interface CMain {
  isLocked: boolean
  readonly id: INavButtonName
  html: HTMLElement
  lock(lockStatus: boolean): void
  destroy(force?: boolean): IAny
  run(): IAny
  handleHistory?(state: IHistoryState): Promise<void>
}
