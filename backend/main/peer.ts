import { WebSocket } from "ws"
import { IPeer } from "../types/PeerTypes"

class Peer {
  private clients: Record<string, IPeer[]> = {}
  private users: Record<string, string[]> = {}
  add(uid: string, socket: WebSocket): IPeer {
    const client: IPeer = { id: uid, socket }
    if (!this.clients[uid]) this.clients[uid] = []
    this.clients[uid].push(client)
    return client
  }
  get(uid: string): IPeer[] | null {
    const client = this.clients[uid]
    if (!client || client.length < 1) return null
    return client
  }
  remove(uid: string, clientId?: string) {
    if (!this.clients[uid]) return
    if (!clientId) {
      delete this.clients[uid]
      return
    }

    const clientIndex = this.clients[uid].findIndex((peer) => peer.id === clientId)
    if (clientIndex > -1) {
      this.clients[uid].splice(clientIndex, 1)
    }

    if (this.clients[uid].length === 0) {
      delete this.clients[uid]
    }
  }
  register(uid: string, clientId: string): void {
    if (!this.users[uid]) this.users[uid] = []
    this.users[uid].push(clientId)
  }
  unregister(uid: string, clientId?: string): void {
    if (!this.users[uid]) return
    if (!clientId) {
      delete this.users[uid]
      return
    }

    const clientExists = this.users[uid].some((peerId) => clientId === peerId)
    if (!clientExists) return

    const clientIndex = this.users[uid].indexOf(clientId!)
    if (clientIndex > -1) this.users[uid].splice(clientIndex, 1)
    if (this.users[uid].length === 0) delete this.users[uid]
  }
  validate(uid: string, clientId: string): boolean {
    if (!this.users[uid]) return false
    if (!this.users[uid].some((peerId) => clientId === peerId)) return false

    const clientIndex = this.users[uid].indexOf(clientId)
    if (clientIndex > -1) this.users[uid].splice(clientIndex, 1)
    if (this.users[uid].length === 0) delete this.users[uid]

    return true
  }
  get size(): number {
    return Object.keys(this.clients).length
  }
  get all(): IPeer[] {
    const clients: IPeer[] = []
    Object.keys(this.clients).forEach((uid) => {
      this.clients[uid].forEach((client) => {
        clients.push(client)
      })
    })

    return clients
  }
}

export default new Peer()
