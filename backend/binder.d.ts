import { IUserSession } from "./types/UserTypes"

declare module "express-session" {
  interface SessionData {
    user?: IUserSession
  }
}

declare module "express" {
  interface Request {
    user?: IUserSession
  }
}

export {}
