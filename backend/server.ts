import app from "./app"
import cfg from "./cfg"
import logger from "./main/logger"
import MongoConnection from "./main/database"
import guest from "./main/guests"
import shared from "./main/shared"

const dbConfig = shared.DB

const PORT = cfg.APP_PORT

async function startServer(): Promise<void> {
  await guest.load()
  app.listen(PORT, () => {
    logger.success(`HOME >> http://localhost:${PORT}`)
    logger.success(`AUTH >> http://localhost:${PORT}/portal`)
    logger.success(`DASHBOARD >> http://localhost:${PORT}/app`)
    logger.success("Running ✔✔✔")
    console.log(" ")
    console.log(" ")
    console.log("IngetYa is licensed under")
    console.log("The GNU General Public License v3.0")
    console.log(" ")
    console.log("https://www.gnu.org/licenses/gpl-3.0.html#license-text")
    console.log(" ")
    console.log(" ")
  })
}

async function checkDatabase(): Promise<void> {
  if (!dbConfig.MONGODB_INSTALLED) {
    logger.info("Database Ignored")
    startServer()
    return
  }

  const mongoConnection = new MongoConnection(cfg.DB_URI, cfg.DB_NAME)
  mongoConnection.connect(startServer)
}

checkDatabase()
