import express, { Request, Response, Router } from "express"
import { authLogin, getMe, processThirdParty } from "../controllers/AuthController"
import { rep, toBase64 } from "../lib/generators"
import { IUser, UserProvider } from "../types/UserTypes"
import { getOAuthUrl, getOAuthUser, isProviderValid } from "../controllers/OAuthController"
import { isUser } from "../main/middlewares"
import { IAny } from "../types/LibTypes"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.get("/isUser", isUser, (req: Request, res: Response) => {
  res.status(200).json(rep({ code: 200 }))
  return
})

router.get("/me", isUser, async (req: Request, res: Response) => {
  const userMe = rep(await getMe(req.user!.id))
  return res.status(userMe.code).json(userMe)
})

router.post("/sign-in", async (req: Request, res: Response) => {
  const signIn = rep(await authLogin(req.body))
  res.status(signIn.code).json(signIn)
  return
})

router.get("/logout", (req: Request, res: Response) => {
  const { r, s, pwa } = req.query

  const url = "/" + (r?.toString() || "app")
  const queries: string[] = []
  if (s) queries.push("s=" + s)
  if (pwa) queries.push("pwa=" + pwa)

  const redirectURL = url + (queries.length >= 1 ? "?" + queries.join("&") : "")

  req.session.destroy(() => {
    res.redirect(redirectURL)
    return
  })
})

router.get("/luunna/redirect", async (req: Request, res: Response) => {
  let { code } = req.query

  if (!code) {
    return res.render("404")
  }

  code = code.toString()

  const states: Record<string, IAny> = {}

  const user = await getOAuthUser(code)
  if (!user || !user.ok || user.error || user.errors) {
    states.error = Date.now().toString(36).toUpperCase()
    states.errorMsg = user.msg || "error"
    const queries: string[] = []
    queries.push("luna=" + toBase64(states))

    const redirectURL = "/portal" + (queries.length >= 1 ? "?" + queries.join("&") : "")

    return res.redirect(redirectURL)
  }

  const verifyUser = rep(await processThirdParty(user.data))

  if (!verifyUser.ok || verifyUser.code !== 200) {
    states.error = Date.now().toString(36).toUpperCase()
    states.errorMsg = verifyUser.msg
    const queries: string[] = []
    queries.push("luna=" + toBase64(states))

    const redirectURL = "/portal" + (queries.length >= 1 ? "?" + queries.join("&") : "")

    return res.redirect(redirectURL)
  }

  const userData = verifyUser.data.user as IUser

  req.user = {
    id: userData.id,
    created: userData.created
  }

  const queries: string[] = []
  queries.push("luna=" + toBase64(states))

  const redirectURL = "/portal" + (queries.length >= 1 ? "?" + queries.join("&") : "")

  return res.redirect(redirectURL)
})

router.get("/:provider", (req: Request, res: Response) => {
  const { provider } = req.params
  if (!isProviderValid(provider.toString())) {
    return res.render("404")
  }

  const { locale } = req.query

  return res.redirect(getOAuthUrl(provider as UserProvider, locale?.toString()))
})

export default router
