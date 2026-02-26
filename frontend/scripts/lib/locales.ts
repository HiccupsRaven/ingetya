import { ILanguage } from "../types/LibTypes"

const langSaveKey = "locale"

export function browserLocale(): ILanguage {
  const browserLocales = !navigator.languages ? [navigator.language] : navigator.languages
  if (!browserLocales) return "id"

  const primaryLocale = browserLocales[0].trim().split(/-|_/)[0]
  return primaryLocale === "en" ? "en" : "id"
}

export function getSavedLocale(): string | null {
  if (!window.localStorage) return null
  const file = window.localStorage.getItem(langSaveKey)

  try {
    return file || null
  } catch {
    return null
  }
}
export function loadLocale(): void {
  const file = getSavedLocale()
  if (file) {
    setLanguage(file === "en" ? "en" : "id")
  } else {
    setLanguage(browserLocale())
    saveLocale()
  }
}
export function saveLocale(): void {
  window.localStorage.setItem(langSaveKey, getLanguage())
}

let currentLanguage: ILanguage = "id"

export function setLanguage(lang: ILanguage): void {
  currentLanguage = lang

  document.documentElement.setAttribute("lang", lang)
  document.documentElement.lang = lang
}

export function getLanguage(): ILanguage {
  return currentLanguage
}
