import { eroot, futor, kel, qutor } from "../../lib/kel"
import { getLanguage } from "../../lib/locales"
import modal from "../../lib/modal"
import waittime from "../../lib/waittime"
import xhr from "../../lib/xhr"
import { ILunaPrimary } from "../../types/PortalTypes"
import { setCard } from "./authGate"
import { lang, changeLang, createLanguageButton } from "./languagePortal"

const strings: Record<string, () => string> = {
  redirecting: () => `<i class="fa-duotone fa-circle-check"></i> ${lang("redirecting")} ...`,
  processing: () => `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang("processing")} ...`,
  login: () => `<i class="fa-solid fa-arrow-right-to-arc"></i> ${lang("auth_login")}`,
  verify: () => `<i class="fa-solid fa-arrow-right-to-arc"></i> ${lang("auth_verify")}`,
  luunna: () => `<img src="/assets/providers/luunna.svg" class="provider-icon" /><span>Luunna</span>`,
  google: () => `<img src="/assets/providers/google.svg" class="provider-icon" /> <span>Google</span>`,
  discord: () => `<img src="/assets/providers/discord.svg" class="provider-icon" /> <span>Discord</span>`,
  github: () => `<img src="/assets/providers/github_black.svg" class="provider-icon" /> <span>GitHub</span>`,
  tiktok: () => `<img src="/assets/providers/tiktok.svg" class="provider-icon" /> <span>TikTok</span>`,
  facebook: () => `<img src="/assets/providers/facebook.svg" class="provider-icon" /> <span>Facebook</span>`
}

const emailRegex: RegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g

const IN_DEVELOPMENTS = ["tiktok", "facebook"]

export class LunaSignIn implements ILunaPrimary {
  private el: HTMLDivElement
  isLocked: boolean = false
  id: string = "lunasignin"
  constructor() {
    this.el = kel("div", "card")
    this.init()
  }
  createElement(): void {
    this.el.innerHTML = `
    <div class="title">
      <img class="logo-icon" src="/assets/providers/luunna.svg" alt="[Luunna Logo]" width="125" />
      <h1>${lang("welcome")}</h1>
    </div>

    <div class="motto">
      <p>${lang("one_for_all")}</p>
    </div>

    <div class="languages"></div>

    <form id="email-login" action="/luunna/sign-in" method="post" class="form">
      <div class="input-group">
        <div class="input-field">
          <label for="login-email">${lang("auth_email")}</label>
          <div class="input-wrapper">
            <i class="fa-jelly-fill fa-regular fa-envelope"></i>
            <input type="email" id="login-email" name="login-email" placeholder="example@email.com" autocomplete="email" maxlength="200" required />
          </div>
        </div>
      </div>

      <div class="button-group">
        <button type="submit" class="btn btn-login"><i class="fa-solid fa-arrow-right-to-arc"></i> ${lang("auth_login")}</button>
      </div>
    </form>

    <div class="divider">
      <span>${lang("auth_with_provider")}</span>
    </div>

    <div class="login-providers">
      <a href="/x/auth/luunna" class="btn btn-luunna" id="luunna-login">
        <img src="/assets/providers/luunna.svg" class="provider-icon" />
        <span>Luunna</span>
      </a>

      <a href="/x/auth/google" class="btn btn-google" id="google-login">
        <img src="/assets/providers/google.svg" class="provider-icon" />
        <span>Google</span>
      </a>

      <a href="/x/auth/github" class="btn btn-github" id="github-login">
        <img src="/assets/providers/github_black.svg" class="provider-icon" />
        <span>GitHub</span>
      </a>

      <a href="/x/auth/discord" class="btn btn-discord" id="discord-login">
        <img src="/assets/providers/discord.svg" class="provider-icon" />
        <span>Discord</span>
      </a>

      <a href="/x/auth/tiktok" class="btn btn-tiktok" id="tiktok-login">
        <img src="/assets/providers/tiktok.svg" class="provider-icon" />
        <span>TikTok</span>
      </a>

      <a href="/x/auth/facebook" class="btn btn-facebook" id="facebook-login">
        <img src="/assets/providers/facebook.svg" class="provider-icon" />
        <span>Facebook</span>
      </a>
    </div>

    <div class="footer">
      <p>${lang("auth_notice")}</p>
    </div>`
  }

  formListener(): void {
    const btnLogin = futor(".btn-login")
    const inpEmail = futor("#login-email") as HTMLInputElement

    const form = futor(".form")
    form.onsubmit = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      inpEmail.readOnly = true

      const user_email = inpEmail.value.trim()
      if (!user_email.match(emailRegex)) {
        await modal.alert(lang("email_not_valid"))
        this.isLocked = false
        inpEmail.readOnly = false
        return
      }

      btnLogin.innerHTML = strings.processing()

      const data: Record<string, string | number> = {
        email: user_email,
        lang: getLanguage()
      }

      const targetUrl = `/x/auth/sign-in`

      const res = await xhr.post(targetUrl, data)
      inpEmail.readOnly = false

      if (!res.ok) {
        btnLogin.innerHTML = strings["login"]()
        await modal.alert(lang(res.msg) || `${lang("error")} - ${res.code}`)
        this.isLocked = false
        return
      }

      this.isLocked = false
      window.location.href = res.data.url
      btnLogin.innerHTML = strings.redirecting()

      await waittime()

      btnLogin.innerHTML = strings["login"]()
    }
  }

  langListener(): void {
    const fieldLang = futor(".languages")
    const btnLang = qutor(".btn-lang") || createLanguageButton()
    fieldLang.append(btnLang)
    btnLang.onclick = async () => {
      if (this.isLocked) return
      this.isLocked = true

      const isLangChanged = await changeLang()
      if (!isLangChanged) {
        this.isLocked = false
        return
      }

      this.isLocked = false
      await this.destroy()
      const recreatedSignIn = new LunaSignIn()

      setCard(recreatedSignIn)
    }
  }

  providerListener(): void {
    const loginButtons = document.querySelectorAll(".login-providers .btn") as NodeListOf<HTMLAnchorElement>

    loginButtons.forEach((btn) => {
      const currHref = btn.getAttribute("href") as string
      const btnId = btn.getAttribute("id")!.toString().replace("-login", "")

      btn.href = IN_DEVELOPMENTS.find((k) => k === btnId) ? window.location.href : `${currHref}`

      btn.onclick = async (e) => {
        e.preventDefault()
        if (this.isLocked) return
        this.isLocked = true

        if (IN_DEVELOPMENTS.find((k) => k === btnId)) {
          await modal.alert(lang("auth_login_provider_maintenance").replace(/{PROVIDER}/, btnId))
          this.isLocked = false
          return
        }

        btn.innerHTML = strings.processing()
        await waittime(1000)
        this.isLocked = false
        window.location.href = btn.getAttribute("href") as string
        btn.innerHTML = strings[btnId]()
      }
    })
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
    this.langListener()
    this.formListener()
    this.providerListener()
  }
}
