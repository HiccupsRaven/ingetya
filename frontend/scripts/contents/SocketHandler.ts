import { IAny } from "../types/LibTypes"
const INVALID_CONTROLS = ["run", "init", "constructor"]

class SocketHandler {
  run(data: IAny): void {
    if (!data.type) return
    if (INVALID_CONTROLS.find((control) => control === data.type)) return
    const type = data.type as keyof SocketHandler
    if (this[type]) this[type](data)
  }
}

export const socketHandler = new SocketHandler()
