import { type WebSocket } from "ws"
import { IUserSession } from "./types/UserTypes"

declare module "express-ws" {
  interface WebSocketWithHeartbeat extends WebSocket {
    isAlive: boolean
  }
}

declare module "express-session" {
  interface SessionData {
    user?: IUserSession
  }
}

declare module "express" {
  interface Request {
    user?: IUserSession
  }
}

export {}
