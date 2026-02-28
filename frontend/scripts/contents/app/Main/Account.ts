import { futor, kel } from "../../../lib/kel"
import modal from "../../../lib/modal"
import waittime from "../../../lib/waittime"
import xhr from "../../../lib/xhr"
import { AccountMemory } from "../../contentManager"
import { changeLang, createLanguageButton, lang } from "../languageApp"
import { Main } from "../Main"
import { INavButtonName } from "../Nav"
import { CMain } from "../types/MainTypes"

export class MainAccount implements CMain {
  id: INavButtonName = "account"
  private locked: boolean = false
  private el!: HTMLElement
  private main: Main
  constructor(main: Main) {
    this.main = main
  }
  private createElement(): void {
    this.el = kel("section", "sect sect-account")
    this.el.innerHTML = `
    <div class="sect-header center">
      <h1>${lang("nav_account")}</h1>
    </div>
    <div class="sect-form">
      <div class="field lang">
      </div>
      <div class="field detail">
        <label for="userid">User ID</label>
        <input type="text" name="userid" id="userid" autocomplete="off" value="Loading" readonly />
      </div>
      <div class="field detail">
        <label for="lunaid">Luunna ID</label>
        <input type="text" name="lunaid" id="lunaid" autocomplete="off" value="Loading" readonly />
      </div>
      <div class="field buttons">
        <a href="https://devanka.id/luunna/portal" target="_blank" class="btn btn-luna"><i class="fa-sharp fa-solid fa-gear"></i> ${lang("acc_luna_settings")}</a>
        <a href="/account/logout" class="btn btn-logout"><i class="fa-sharp fa-solid fa-arrow-left-from-arc"></i> ${lang("acc_logout_btn")}</a>
      </div>
    </div>`
  }

  private renderData(userId: string, lunaId: string): void {
    const userIdInp = futor("#userid", this.el) as HTMLInputElement
    const lunaIdInp = futor("#lunaid", this.el) as HTMLInputElement

    userIdInp.value = userId
    lunaIdInp.value = lunaId
  }

  private async writeData(): Promise<void> {
    const { id, lunaId } = AccountMemory
    if (id && lunaId) {
      this.renderData(id, lunaId)
      return
    }
    this.locked = true
    const user = await xhr.get("/x/auth/me")

    if (user.code === 401) {
      await xhr.get("/x/auth/logout")
      window.location.href = "/portal"
      return
    }

    if (!user.ok) {
      this.renderData(`${lang("error")} - ${user.code}`, `${lang("error")} - ${user.code}`)
      this.locked = false
      return
    }

    Object.keys(user.data).forEach((k) => (AccountMemory[k] = user.data[k]))
    this.renderData(user.data.id, user.data.lunaId)
    this.locked = false
  }

  private formListener(): void {
    const btnLang = createLanguageButton()
    futor(".field.lang", this.el).append(btnLang)

    btnLang.onclick = async () => {
      if (this.main.king.isLocked) return
      this.locked = true

      const isLangChanged = await changeLang()
      if (!isLangChanged) {
        this.locked = false
        return
      }

      this.locked = false
      this.main.setRefresh(this.id)
    }
    this.logoutListener()
  }
  private logoutListener(): void {
    const btnLogout = futor(".btn-logout", this.el)
    btnLogout.onclick = async (e) => {
      e.preventDefault()
      if (this.main.king.isLocked) return
      this.locked = true

      const confirmLogout = await modal.confirm(lang("acc_logout_msg"))
      if (!confirmLogout) {
        this.locked = false
        return
      }

      await modal.loading(xhr.get("/x/auth/logout"))
      window.location.href = "/portal"
    }
  }

  async handleHistory(): Promise<void> {
    this.locked = false
    await modal.abort()
  }

  lock(newStatus: boolean = true) {
    this.locked = newStatus
  }
  get isLocked(): boolean {
    return this.locked
  }
  get html(): HTMLElement {
    return this.el
  }
  async destroy(force?: boolean): Promise<void> {
    if (force) {
      this.locked = false
      modal.abort()
      this.el.remove()
      return
    }
    if (this.locked) return
    await modal.abort()
    this.locked = true
    this.el.classList.add("out")
    await waittime()
    this.locked = false
    this.el.classList.remove("out")
    this.el.remove()
  }
  run(): this {
    this.createElement()
    this.writeData()
    this.formListener()
    return this
  }
}
