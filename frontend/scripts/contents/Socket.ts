import waittime from "../lib/waittime"
import { IAny } from "../types/LibTypes"
import { socketHandler } from "./SocketHandler"
import { IInvoice, InvoicesMemory, IOrder, OrdersMemory } from "./contentManager"
import { ReconnectTool } from "../lib/ReconnectTool"
import modal from "../lib/modal"
import { lang } from "./app/languageApp"

function socketError(_err: Event) {
  // console.error(err)
}
function socketMessage(data: MessageEvent) {
  try {
    const msg = JSON.parse(data.data.toString())
    socketHandler.run(msg)
  } catch (_err) {
    // console.error(err)
  }
}

class Socket {
  private ws?: WebSocket
  private isExited: number = 0
  private host!: string
  private id!: string
  private start(): void {
    this.ws = new WebSocket(`ws${window.location.protocol === "https:" ? "s" : ""}://${this.host}/socket?id=${this.id}`)

    this.ws.addEventListener("error", socketError)
    this.ws.addEventListener("message", socketMessage)
    this.ws.addEventListener("close", () => this.onClosed(), { once: true })
  }
  destroy(): void {
    this.ws?.removeEventListener("error", socketError)
    this.ws?.removeEventListener("message", socketMessage)
  }
  private async reconnect(): Promise<void> {
    this.ws?.removeEventListener("error", socketError)
    this.ws?.removeEventListener("message", socketMessage)

    const reconnectTool = new ReconnectTool()
    const newUser = await reconnectTool.run()

    if (!newUser.ok) {
      await modal.alert(lang(newUser.msg) || lang("error"))
      window.location.reload()
      // repeat process
      return
    }

    this.resetOldData()
    this.init(newUser.data)
  }
  private async onClosed(): Promise<void> {
    this.ws = undefined
    await waittime()
    this.reconnect()
  }
  setExit(newExit: number): void {
    this.isExited = newExit
  }
  close(): void {
    if (this.ws) this.ws.close()
  }
  send(type: string, obj = {}): void {
    const data = { type, identifier: "ingetya", ...obj }
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  private resetOldData(): void {
    OrdersMemory.splice(0, OrdersMemory.length)
    InvoicesMemory.splice(0, InvoicesMemory.length)
  }
  init(s: IAny): void {
    if (s.orders) s.orders.forEach((order: IOrder) => OrdersMemory.push(order))
    if (s.invoices) s.invoices.forEach((invoice: IInvoice) => InvoicesMemory.push(invoice))

    if (s.socket) {
      if (s.socket.host) this.host = s.socket.host
      if (s.socket.id) this.id = s.socket.id
    }

    this.start()
  }
}

const socket = new Socket()
export default socket
