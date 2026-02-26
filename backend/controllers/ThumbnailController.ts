import fs from "fs"
import { Request, Response } from "express"

export async function getThumbnail(req: Request, res: Response) {
  const { tid } = req.params

  const filePath = `./category/${tid}.png`

  const fileExists = fs.existsSync(filePath)

  if (!fileExists) return res.render("404")

  return res.sendFile(filePath, { root: "./" })
}
