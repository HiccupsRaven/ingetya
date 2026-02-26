import cfg from "../../cfg"
import { APIEmbed } from "../../types/EmbedTypes"
import { IAny } from "../../types/LibTypes"
import shared from "../shared"
import { createEmbeds } from "./embeds"

type IChannelID = keyof typeof shared.WEBHOOK

export async function webhook(channel: IChannelID, message: APIEmbed): Promise<IAny> {
  const embeds: APIEmbed[] = createEmbeds(message)

  const messageData = { embeds }

  const url = `https://discord.com/api/channels/${shared.WEBHOOK[channel]}/messages`
  const authorization = `Bot ${cfg.DISCORD_BOT_TOKEN}`

  const messageSent = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authorization
    },
    body: JSON.stringify(messageData)
  })
    .then((res) => {
      if (res.ok) return res.json()
      return { error: true, errors: res }
    })
    .then((res) => res)
    .catch((err) => err)

  if (messageSent.error || messageSent.errors) {
    console.log(messageSent)
  }
}
