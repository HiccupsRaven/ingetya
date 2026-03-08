import { webhook } from "../main/webhook/webhook"
import { COLORS } from "../types/EmbedTypes"
import { ISocket, SocketHandler } from "../types/PeerTypes"

const socketMessage: SocketHandler = {
  traffic(uid, s) {
    webhook("traffics", {
      title: `ID ${uid}`,
      description: `\`\`\`${s.content}\`\`\``,
      color: COLORS.BLURPLE
    })
  }
}

export function processSocketMessages(data: Partial<ISocket>): void {
  if (!data.type || !data.from || !data.uid) return
  if (!socketMessage[data.type]) return
  socketMessage[data.type](data.uid, data)
}
