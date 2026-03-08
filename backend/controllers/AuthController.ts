import { isProd, rNumber, rUid, toBase64 } from "../lib/generators"
import validate from "../lib/validate"
import cfg from "../cfg"
import { IUser, IExternalUser, IUserSafe } from "../types/UserTypes"
import { IResTemp, IAny } from "../types/LibTypes"
import User from "../models/UserModel"
import guest from "../main/guests"
import { webhook } from "../main/webhook/webhook"
import { COLORS } from "../types/EmbedTypes"
import { ISocketConfig } from "../types/PeerTypes"
import peer from "../main/peer"

export function initSocket(uid: string): ISocketConfig {
  const clientId = rUid()
  peer.register(uid, clientId)
  const host = isProd ? cfg.APP_HOST : `localhost:${cfg.APP_PORT}`
  return { id: clientId, host }
}

export async function getMe(uid: string): Promise<IResTemp> {
  const user = await User.findOne({ id: uid }).lean()
  if (!user) {
    return { code: 401 }
  }

  const userData: IUserSafe = {
    id: user.id,
    email: user.email,
    lunaId: user.externalId
  }

  return { code: 200, data: userData }
}

export async function authLogin(s: IAny): Promise<IResTemp> {
  if (!validate(["email"], s)) return { code: 400, msg: "<b>Alamat email gak valid</b><br />Periksa dulu aja dan coba lagi" }
  s.email = s.email.toString().toLowerCase()
  const mailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!s.email.match(mailValid)) return { code: 400, msg: "<b>Alamat email gak valid</b><br />Periksa dulu aja dan coba lagi" }

  const HOST = isProd ? "https://ingetya.net" : `http://localhost:${cfg.APP_PORT}`

  const stateData = {
    client: `${HOST}/x/auth/luunna/redirect`,
    initialEmail: s.email,
    lang: typeof s.lang === "string" && s.lang === "en" ? "en" : "id"
  }

  const state = toBase64(stateData)

  const url = `https://devanka.id/luunna/portal?luna=${state}`

  return { code: 200, msg: "OK", data: { url } }
}

export async function processThirdParty(usr: IExternalUser): Promise<IResTemp> {
  const existingUser = await User.findOne({ externalId: usr.id }).lean()

  if (existingUser) {
    return { code: 200, data: { user: existingUser } }
  }

  const userId = "7" + rNumber(5).toString() + guest.userNumber().toString()

  const newUser: IUser = {
    id: userId,
    externalId: usr.id,
    email: `usr${usr.id}@luna.devanka.id`,
    created: Date.now()
  }
  await User.create(newUser)

  const providersText = usr.data.map((data) => `**ID** ${data.externalId}\n**Email** (${data.provider})\n${data.email}\n**Nickname**\n${data.name || "-"}`)

  webhook("accounts", {
    title: "Registered",
    description: `**ID** ${userId}\n**Luna** ${usr.id}\n\n${providersText.join("\n\n")}`,
    color: COLORS.LIME,
    timestamp: true
  })

  return { code: 200, data: { user: newUser } }
}
