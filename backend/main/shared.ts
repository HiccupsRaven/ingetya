import fs from "fs"
import { IConfigDB, IConfigVersion, IConfigWebhook, IItemPackage, IPaymentPackage } from "../types/SharedTypes"

const VERSION = JSON.parse(fs.readFileSync("./config/version.json").toString()) as IConfigVersion

const DB = JSON.parse(fs.readFileSync("./config/db.json").toString()) as IConfigDB

const WEBHOOK = JSON.parse(fs.readFileSync("./config/webhook.json", "utf-8")) as IConfigWebhook

const productPath = "./frontend/scripts/contents/app/Main/Explore/productPackages.json"

const paymentPath = "./frontend/scripts/contents/app/Main/Invoices/paymentMethods.json"

const ITEMS = JSON.parse(fs.readFileSync(productPath, "utf-8")) as IItemPackage[]

const PAYMENTS = JSON.parse(fs.readFileSync(paymentPath, "utf-8")) as IPaymentPackage[]

export default { VERSION, DB, WEBHOOK, ITEMS, PAYMENTS }
