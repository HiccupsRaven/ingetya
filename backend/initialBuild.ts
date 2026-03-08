import fs from "fs"
import { addDir } from "./lib/generators"
import logger from "./main/logger"
import { IAny } from "./types/LibTypes"

const CONFIG_VERSION: Record<string, IAny> = { version: "1.0.0-wip.1" }

const CONFIG_DB: Record<string, IAny> = { MONGODB_INSTALLED: false }

const CONFIG_WEBHOOK: Record<string, IAny> = {
  account: "00000000",
  error: "00000000",
  connection: "00000000"
}

async function initBuild(): Promise<void> {
  logger.info("Checking Configuration ...")
  await addDir("config")

  if (fs.existsSync("./config/version.json")) {
    const NEW_CONFIG = { ...JSON.parse(fs.readFileSync("./config/version.json", "utf-8").toString()) }

    let newKeyCount: number = 0

    Object.keys(CONFIG_VERSION).forEach((k) => {
      if (typeof NEW_CONFIG[k] === "undefined") {
        newKeyCount++
        NEW_CONFIG[k] = CONFIG_VERSION[k]
      }
    })

    if (newKeyCount >= 1) {
      fs.writeFileSync("./config/version.json", JSON.stringify(NEW_CONFIG, null, 2), "utf-8")

      logger.info(`Added ${newKeyCount} new key(s) to ./config/version.json`)
    }
  } else {
    fs.writeFileSync("./config/version.json", JSON.stringify(CONFIG_VERSION, null, 2), "utf-8")
  }

  if (fs.existsSync("./config/db.json")) {
    const NEW_CONFIG = { ...JSON.parse(fs.readFileSync("./config/db.json", "utf-8").toString()) }

    let newKeyCount: number = 0
    Object.keys(CONFIG_DB).forEach((k) => {
      if (typeof NEW_CONFIG[k] === "undefined") {
        newKeyCount++
        NEW_CONFIG[k] = CONFIG_DB[k]
      }
    })
    if (newKeyCount >= 1) {
      fs.writeFileSync("./config/db.json", JSON.stringify(NEW_CONFIG, null, 2), "utf-8")
      logger.info(`Added ${newKeyCount} new key(s) to ./config/db.json`)
    }
  } else {
    fs.writeFileSync("./config/db.json", JSON.stringify(CONFIG_DB, null, 2), "utf-8")
  }

  if (fs.existsSync("./config/webhook.json")) {
    const NEW_CONFIG = { ...JSON.parse(fs.readFileSync("./config/webhook.json", "utf-8").toString()) }

    let newKeyCount: number = 0
    Object.keys(CONFIG_WEBHOOK).forEach((k) => {
      if (typeof NEW_CONFIG[k] === "undefined") {
        newKeyCount++
        NEW_CONFIG[k] = CONFIG_WEBHOOK[k]
      }
    })
    if (newKeyCount >= 1) {
      fs.writeFileSync("./config/webhook.json", JSON.stringify(NEW_CONFIG, null, 2), "utf-8")
      logger.info(`Added ${newKeyCount} new key(s) to ./config/webhook.json`)
    }
  } else {
    fs.writeFileSync("./config/webhook.json", JSON.stringify(CONFIG_WEBHOOK, null, 2), "utf-8")
  }

  logger.success("Configuration Updated")
}

initBuild()
