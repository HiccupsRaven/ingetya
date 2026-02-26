import dotenv from "dotenv"
dotenv.config()

export default {
  APP_PRODUCTION: process.env.APP_PRODUCTION?.toLowerCase() === "true",
  APP_PORT: Number(process.env.APP_PORT ?? 9000),
  APP_HOST: process.env.APP_HOST ?? "localhost",

  DB_URI: process.env.DB_URI ?? "mongodb://localhost:27017/ingetya",
  DB_NAME: process.env.DB_NAME ?? "ingetya",

  SMTP_HOST: process.env.SMTP_HOST ?? "smtp.example.com",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? "user@example.com",
  SMTP_PASS: process.env.SMTP_PASS ?? "password",

  MIDTRANS_PRODUCTION: process.env.MIDTRANS_PRODUCTION?.toLowerCase() === "true",

  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ?? "unknown",

  SB_MIDTRANS_SERVER_KEY: process.env.SB_MIDTRANS_SERVER_KEY ?? "MIDTRANS_SERVER_KEY",
  SB_MIDTRANS_CLIENT_KEY: process.env.SB_MIDTRANS_CLIENT_KEY ?? "MIDTRANS_CLIENT_KEY",

  PR_MIDTRANS_SERVER_KEY: process.env.PR_MIDTRANS_SERVER_KEY ?? "SB_MIDTRANS_SERVER_KEY",
  PR_MIDTRANS_CLIENT_KEY: process.env.PR_MIDTRANS_CLIENT_KEY ?? "MIDTRANS_CLIENT_KEY",

  SESSION_SECRET: process.env.SESSION_SECRET ?? "secret",

  LUNA_SECRET: process.env.LUNA_SECRET ?? "secret"
}
