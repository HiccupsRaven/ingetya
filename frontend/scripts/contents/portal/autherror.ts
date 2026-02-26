import { eroot, futor, kel } from "../../lib/kel"
import waittime from "../../lib/waittime"
import { ILunaPrimary } from "../../types/PortalTypes"
import { checkRedirect, setCard } from "./authGate"
import { LunaCheck } from "./check"
import { lang } from "./languagePortal"
import { delQuery } from "./queries"

export class LunaError implements ILunaPrimary {
  private el: HTMLDivElement
  isLocked: boolean = false
  id: string = "lunaerror"
  constructor(private errorMsg?: string) {
    this.el = kel("div", "card")
    this.init()
  }
  createElement(): void {
    this.el.innerHTML = `
    <div class="title">
      <h1>Oops!</h1>
    </div>

    <div class="motto">
      ${this.errorMsg ? '<p class="error">' + (lang(this.errorMsg) || this.errorMsg) + '</p><div class="divider"></div>' : ""}
      <p>${lang("auth_failed")}</p>
    </div>

    <div class="divider">
      <span>${lang("auth_retry_txt")}</span>
    </div>

    <div class="form">
      <div class="button-group">
        <div class="btn btn-restart"><i class="fa-solid fa-arrow-left"></i> ${lang("auth_headback_btn")}</div>
      </div>
    </div>`
  }

  formListener(): void {
    delQuery("error")
    delQuery("errorMsg")
    delQuery("errorParse")
    delQuery("link")
    delQuery("user")
    const btnRestart = futor(".btn-restart", this.el)
    btnRestart.onclick = async () => {
      await this.destroy()
      const waitCard = new LunaCheck(lang("please_wait"))

      setCard(waitCard)

      checkRedirect(true)
    }
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
    this.formListener()
  }
}
