import express, { Request, Response, NextFunction } from "express"
import session from "express-session"
import MongoStore from "connect-mongo"
import authRouter from "./routes/AuthRouter"
import orderRouter from "./routes/OrdersRouter"
import productRouter from "./routes/ProductsRouter"
import cfg from "./cfg"
import { sessionUserBinder } from "./main/binder"
import shared from "./main/shared"
import { isUser } from "./main/middlewares"
import { getThumbnail } from "./controllers/ThumbnailController"

const { version } = shared.VERSION
const { MONGODB_INSTALLED } = shared.DB

const app = express()

app.use(
  session({
    secret: cfg.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: "strict" },
    store: MONGODB_INSTALLED
      ? MongoStore.create({
          mongoUrl: cfg.DB_URI,
          dbName: cfg.DB_NAME,
          collectionName: "sessions"
        })
      : undefined
  })
)

app.use(sessionUserBinder)
app.use(express.static("public"))
app.set("view engine", "ejs")

app.use("/x/auth", authRouter)
app.use("/x/orders", orderRouter)
app.use("/x/products", productRouter)
app.get("/loveyou/:tid", getThumbnail)

app.get("/app", isUser, (req: Request, res: Response) => {
  return res.render("app")
})

app.get("/portal", (req: Request, res: Response) => {
  return res.render("portal")
})

app.get("/", (req: Request, res: Response) => {
  res.render("home", { version })
})

app.use("/", (req: Request, res: Response) => {
  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"
  if (req.method.toLowerCase() === "get" && !isJsonRequest) {
    return res.status(404).render("404")
  }
  return res.status(404).json({ ok: false, code: 404, msg: "Your requested data is not found", error: "Not Found" })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err)
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      ok: false,
      code: 413,
      msg: "CONTENT_TOO_LARGE"
    })
  }

  console.error(err)

  return res.status(500).json({
    ok: false,
    code: 500,
    msg: "error"
  })
})

export default app
