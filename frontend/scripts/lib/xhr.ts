import { IAny, IResponse, IRequestType } from "../types/LibTypes"

async function efetch(method: IRequestType, url: string, s?: IAny): Promise<IResponse> {
  return await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: s ? JSON.stringify(s) : undefined
  })
    .then((res) => {
      return res.json()
    })
    .then((res) => {
      return res
    })
    .catch((err) => {
      return { code: 404, ok: false, msg: "ERROR", errors: err }
    })
}

export default {
  async get(ref: string): Promise<IResponse> {
    return await efetch("GET", ref)
  },
  async post(ref: string, s?: IAny): Promise<IResponse> {
    return await efetch("POST", ref, s)
  }
}
