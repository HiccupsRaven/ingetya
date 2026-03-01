/* eslint-disable @typescript-eslint/no-explicit-any */
import cfg from "../cfg"
import { isProd, toBase64 } from "../lib/generators"
import xhr from "../lib/xhr"
import { IAny } from "../types/LibTypes"
import { UserProvider } from "../types/UserTypes"

const CallBackURL: Record<string, IAny> = {
  luunna(state: string) {
    return `https://devanka.id/luunna/portal?luna=${state}`
  },
  google(state: string) {
    return `https://devanka.id/luunna/google?luna=${state}`
  },
  github(state: string) {
    return `https://devanka.id/luunna/github?luna=${state}`
  },
  discord(state: string) {
    return `https://devanka.id/luunna/discord?luna=${state}`
  },
  facebook(state: string) {
    return `https://devanka.id/luunna/facebook?luna=${state}`
  }
}

export function isProviderValid(provider: string, useIngetYa?: boolean): boolean {
  const valid_provider: UserProvider[] = ["google", "github", "discord", "facebook", "luunna"]
  if (useIngetYa) valid_provider.push("ingetya")
  if (valid_provider.find((k) => k === provider)) return true
  return false
}

export function getOAuthUrl(provider: UserProvider, locale?: string) {
  const HOST = isProd ? "https://ingetya.net" : "http://localhost:9001"

  const stateData = {
    client: `${HOST}/x/auth/luunna/redirect`,
    lang: typeof locale === "string" && locale === "en" ? "en" : "id"
  }

  const state = toBase64(stateData)

  const redirectUrl = CallBackURL[provider](state)
  return redirectUrl
}
export async function getOAuthUser(code: string): Promise<any> {
  const token = `Token ${cfg.LUNA_SECRET}`
  const user = await xhr.post("https://devanka.id/luunna/oauth/zzz", token, {
    code
  })
  return user
}
