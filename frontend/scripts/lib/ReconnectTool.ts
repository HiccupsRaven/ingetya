import { IResponse } from "../types/LibTypes"
import packageVersion from "../../../config/version.json"
import waittime from "../lib/waittime"
import xhr from "../lib/xhr"

export class ReconnectTool {
  private attemp: number = 0
  private async startReconnect(): Promise<IResponse> {
    this.attemp++
    await waittime(3000)
    if (this.attemp > 20) {
      return { code: 400, ok: false, msg: "cloud_timeout" }
    }

    const userData = await xhr.get("/x/orders/me")
    if (userData.code === 401) {
      return userData
    }

    if (!userData.ok) {
      return await this.startReconnect()
    }

    const clientVersion = userData.data?.version || "-0.0.1"

    if (clientVersion !== packageVersion.version) {
      return { code: 400, ok: false, msg: "cloud_outdated" }
    }

    this.attemp = 0
    return userData
  }
  async run(): Promise<IResponse> {
    return await this.startReconnect()
  }
}
