import fs from "fs"
import crypto from "crypto"
import cfg from "../cfg"
import { IAny, IResponse, IResTemp } from "../types/LibTypes"
import waittime from "./waittime"
import { IQueryParam } from "../types/AuthTypes"

export const isProd: boolean = cfg.APP_PRODUCTION
export const isMidtransProd: boolean = cfg.MIDTRANS_PRODUCTION

export function genhex(n: number = 8): string {
  return crypto.randomBytes(n).toString("hex") + Date.now().toString(36)
}

export function rep(options: IResTemp): IResponse {
  const repdata: IResponse = Object.assign(
    {},
    {
      ok: false,
      code: 400,
      msg: "Terjadi Kesalahan - 400"
    },
    typeof options === "string" ? {} : options
  )
  if (options.data && typeof options.data === "object") repdata.data = options.data
  if (options.code === 200) {
    repdata.ok = true
    if (!options.msg) repdata.msg = "OK"
  }

  return repdata
}

export function rString(n: number = 8): string {
  return crypto.randomBytes(n).toString("hex")
}

export function rNumber(n: number = 6): number {
  let a: string = ""
  for (let i: number = 1; i < n; i++) {
    a += "0"
  }
  return Math.floor(Math.random() * Number("9" + a)) + Number("1" + a)
}

export function rUid(): string {
  const rstring = rNumber(1).toString() + (Date.now() + rNumber(6)).toString(36).substring(1)
  return rstring + Date.now().toString(36)
}

export function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export async function addDir(dirpath: string): Promise<void> {
  let curpath = "."
  const dirs: string[] = dirpath.split("/")

  for (const dir of dirs) {
    curpath += `/${dir}`
    if (!fs.existsSync(curpath)) {
      fs.mkdirSync(curpath)
      await waittime(100)
    }
  }
}

export async function createFile(filePath: string, fileData: string): Promise<void> {
  let curpath = "."
  const dirs: string[] = filePath.split("/")

  const total = dirs.length

  for (let i = 0; i < total - 1; i++) {
    curpath += `/${dirs[i]}`
    if (!fs.existsSync(curpath)) {
      fs.mkdirSync(curpath)
      await waittime(100)
    }
  }

  fs.writeFileSync(filePath, fileData, "utf-8")
}

export function checkFile(filePath: string): boolean {
  let curpath = "."
  const dirs: string[] = filePath.split("/")

  const total = dirs.length
  let currentNull = false

  for (let i = 0; i < total; i++) {
    curpath += `/${dirs[i]}`
    if (currentNull === true) return false
    if (!fs.existsSync(curpath)) {
      currentNull = true
    }
  }

  if (currentNull === true) return false

  return true
}

export function getFile(filePath: string, fileEncoding: BufferEncoding = "utf-8"): string | null {
  let curpath = "."
  const dirs: string[] = filePath.split("/")

  const total = dirs.length
  let currentNull = false

  for (let i = 0; i < total; i++) {
    curpath += `/${dirs[i]}`
    if (currentNull === true) return null
    if (!fs.existsSync(curpath)) {
      currentNull = true
    }
  }

  if (currentNull === true) return null

  const file = fs.readFileSync(filePath, fileEncoding).toString()

  return file
}

export function parseBase64(query: IAny): IQueryParam {
  try {
    const data = JSON.parse(Buffer.from(query.toString(), "base64").toString()) as IQueryParam
    return data
  } catch (err) {
    console.error(err)
    return { errorParse: true }
  }
}

export function toBase64(query: IAny): string {
  try {
    const data = Buffer.from(JSON.stringify(query)).toString("base64")
    return data
  } catch (err) {
    console.error(err)
    const data = Buffer.from(JSON.stringify({ errorParse: true })).toString("base64")
    return data
  }
}

export function chunkString(str: string, size: number = 500): string[] {
  const chunk: string[] = []
  let i = 0
  while (i < str.length) {
    chunk.push(str.slice(i, i + size))
    i += size
  }

  return chunk
}
