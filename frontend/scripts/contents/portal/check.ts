import { eroot, kel } from "../../lib/kel"
import waittime from "../../lib/waittime"
import { ILunaPrimary } from "../../types/PortalTypes"
import { lang } from "./languagePortal"

export class LunaCheck implements ILunaPrimary {
  private el: HTMLDivElement
  isLocked: boolean = false
  id: string = "lunacheck"
  constructor(private text?: string) {
    this.el = kel("div", "card")
    this.init()
  }

  createElement(): void {
    this.el.innerHTML = `
    <div class="title">
      <div class="big-icon"><i class="fa-solid fa-circle-notch fa-spin"></i></div>
      <h1>${this.text || lang("connecting")}</h1>
    </div>`
  }

  async destroy(): Promise<void> {
    this.isLocked = true
    this.el.classList.add("out")
    await waittime(300)
    this.el.remove()
    this.isLocked = false
  }

  init(): void {
    this.createElement()
    eroot().append(this.el)
  }
}
