import { Request } from "express"
import { WebSocketWithHeartbeat } from "express-ws"
import logger from "../main/logger"
import peer from "../main/peer"
import { webhook } from "../main/webhook/webhook"
import { COLORS } from "../types/EmbedTypes"
import { processSocketMessages } from "../controllers/SocketController"

function webSocketApp(ws: WebSocketWithHeartbeat, req: Request) {
  if (!req.user || !req.user.id) {
    logger.info("❌ Connection rejected: no user ID")
    ws.close()
    return
  }

  const userId = req.user.id
  const clientId = req.query.id?.toString()
  if (!clientId) {
    logger.info("❌ Connection rejected: no client id")
    ws.close()
    return
  }

  const validated = peer.validate(userId, clientId)
  if (!validated) {
    logger.info(`❌ Connection rejected: client with id ${clientId} is not found`)
    ws.close()
    return
  }

  peer.add(userId, ws)
  logger.info(`Online   ${userId} ${clientId}`)
  webhook("clients", {
    description: "## ONLINE",
    fields: [
      {
        name: "Socket",
        value: clientId,
        inline: true
      },
      {
        name: "ID",
        value: userId,
        inline: true
      }
    ],
    color: COLORS.LIME,
    timestamp: true
  })
  ws.isAlive = true

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString())
      processSocketMessages({ ...msg, from: clientId, uid: userId })
    } catch (err) {
      console.error("Failed to parse JSON.", err)
    }
  })
  ws.on("close", () => {
    peer.unregister(userId, clientId)
    peer.remove(userId, clientId)
    logger.info(`Offline  ${userId} ${clientId}`)
    webhook("clients", {
      description: "## OFFLINE",
      fields: [
        {
          name: "Socket",
          value: clientId,
          inline: true
        },
        {
          name: "ID",
          value: userId,
          inline: true
        }
      ],
      color: COLORS.RED,
      timestamp: true
    })
  })

  ws.on("error", (err: Error) => {
    console.error(err)
  })

  ws.on("pong", () => {
    ws.isAlive = true
  })
}

export default webSocketApp
