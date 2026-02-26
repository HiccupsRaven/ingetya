import { chunkString } from "../../lib/generators"
import { APIEmbed } from "../../types/EmbedTypes"

export function createEmbeds(s: APIEmbed, isInspect?: boolean): APIEmbed[] {
  const strings = chunkString(s.description, 1000)

  const embeds = strings
    .filter((_str, i) => i <= 8)
    .map((str, i) => {
      const data: APIEmbed = { description: isInspect ? `\`\`\`\n${str}\n\`\`\`` : str }
      if (s.author) data.author = s.author
      if (s.color) data.color = s.color
      if (s.fields) data.fields = s.fields
      if (s.footer) data.footer = s.footer
      if (s.image) data.image = s.image
      if (s.provider) data.provider = s.provider
      if (s.thumbnail) data.thumbnail = s.thumbnail
      if (s.timestamp) data.timestamp = new Date()
      data.title = `${s.title || ""} [Page ${i + 1}/${strings.length}]`.trim()
      if (s.url) data.url = s.url
      if (s.video) data.video = s.url
      return data
    })

  return embeds
}
