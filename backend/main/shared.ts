import fs from "fs"
import { IConfigDB, IConfigVersion, IConfigWebhook } from "../types/SharedTypes"

const VERSION = JSON.parse(fs.readFileSync("./config/version.json").toString()) as IConfigVersion

const DB = JSON.parse(fs.readFileSync("./config/db.json").toString()) as IConfigDB

const WEBHOOK = JSON.parse(fs.readFileSync("./config/webhook.json", "utf-8")) as IConfigWebhook

export default { VERSION, DB, WEBHOOK }
