import express, { Request, Response, Router } from "express"
import { rep } from "../lib/generators"
import {} from "../types/UserTypes"
import { isUser } from "../main/middlewares"
import { getUserOrders, orderNotificationHandler, orderSandBoxNotificationHandler } from "../controllers/OrderController"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.get("/me", isUser, async (req: Request, res: Response) => {
  const meOrders = rep(await getUserOrders(req.user!.id))

  return res.status(meOrders.code).json(meOrders)
})

router.post("/midtrans/pd/hiccupsraven/devanka/notifications", async (req: Request, res: Response) => {
  await orderNotificationHandler(req.body)
  res.status(200).json({})
})

router.post("/midtrans/sb/hiccupsraven/devanka/notifications", async (req: Request, res: Response) => {
  orderSandBoxNotificationHandler(req.body)
  res.status(200).json({})
})

export default router
