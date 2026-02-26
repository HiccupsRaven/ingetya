import fs from "fs"
import { addDir } from "../lib/generators"

const usersFolder = "./public/json/build"
const usersPath = usersFolder + "/userSize"

class Guests {
  private userSize: number = 0
  userNumber(addedNumber: number = 1, isSet?: boolean): number {
    this.userSize = isSet ? addedNumber : this.userSize + addedNumber
    this._saveUsers()
    return this.userSize
  }
  private _saveUsers(): void {
    if (!fs.existsSync(usersFolder)) fs.mkdirSync(usersFolder)
    fs.writeFileSync(usersPath, this.userSize.toString(), "utf-8")
  }
  async load(): Promise<void> {
    await addDir(usersFolder)
    if (!fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, "0", "utf-8")
      return
    }
    const usersData: string = fs.readFileSync(usersPath, "utf-8") || "0"
    this.userSize = Number(usersData.trim())
  }
}
const guest = new Guests()
export default guest
