import lang_id from "../../../locales/id/luna_id.json"
import lang_en from "../../../locales/en/luna_en.json"
import { kel } from "../../lib/kel"
import modal from "../../lib/modal"
import { getLanguage, loadLocale, saveLocale, setLanguage } from "../../lib/locales"
import { ILanguage } from "../../types/LibTypes"

let updatedLang: ILanguage | null = null

export async function changeLang(): Promise<boolean> {
  const optLang = await modal.select({
    ic: "language",
    msg: "Language/Bahasa",
    items: [
      { id: "id", label: "Bahasa Indonesia", activated: getLanguage() === "id" },
      { id: "en", label: "English", activated: getLanguage() === "en" }
    ]
  })

  if (!optLang) return false

  updatedLang = optLang === "en" ? "en" : "id"
  setLanguage(optLang === "en" ? "en" : "id")

  saveLocale()
  return true
}

export function createLanguageButton(): HTMLDivElement {
  const el = kel("div", "btn btn-lang")
  el.innerHTML = '<span><i class="fa-regular fa-language"></i> Bahasa/Language</span><span class="dropdown"><i class="fa-solid fa-chevron-down"></i></span>'
  return el
}

const locales: Record<string, Record<string, string>> = {
  id: lang_id,
  en: lang_en
}

type LangKey = keyof typeof lang_id | (string & {})

export function lang(key: LangKey): string {
  if (!updatedLang) {
    loadLocale()
    updatedLang = getLanguage()
  }
  return locales[updatedLang!][key.toLowerCase()] || key
}
export function langId(key: string): string {
  return locales["id"][key.toLowerCase()] || key
}
export function langEn(key: string): string {
  return locales["en"][key.toLowerCase()] || key
}
