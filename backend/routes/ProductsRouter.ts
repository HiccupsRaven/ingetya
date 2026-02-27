import express, { Request, Response, Router } from "express"
import { rep } from "../lib/generators"
import { cdUser } from "../main/middlewares"
import { getAllProducts } from "../controllers/ProductsController"

const router: Router = express.Router()

router.get("/", cdUser, async (req: Request, res: Response) => {
  const products = rep(await getAllProducts())

  return res.status(products.code).json(products)
})

router.use(express.json({ limit: "100KB" }))

export default router
