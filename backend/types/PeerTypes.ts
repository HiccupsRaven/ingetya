import { WebSocket } from "ws"
import { IAny } from "./LibTypes"

export interface IPeer {
  id: string
  socket: WebSocket
}

export type SocketMessage = Record<string, IAny>

export type SocketHandler = Record<string, (uid: string, data: SocketMessage) => void>

export interface ISocketConfig {
  id: string
  host: string
}

export type ISocket = Record<string, IAny>
