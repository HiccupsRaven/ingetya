import { IAny, IQueries } from "../../types/LibTypes"
import { parseBase64 } from "../../lib/generators"

const currentOrigin = window.location.origin
const currentPath = window.location.pathname

const queries: IQueries = {
  client: currentOrigin + currentPath
}

const urlParams = new URLSearchParams(window.location.search)
const paramState = urlParams.get("luna")

if (paramState) {
  const states = parseBase64(paramState)
  Object.keys(states).forEach((k) => {
    queries[k] = states[k]
  })
}

export function setQueries(s: IQueries): void {
  Object.keys(s).forEach((k) => (queries[k] = s[k]))
}

export function getQueries(): IQueries {
  return queries
}

export function findQuery(key: string): IAny {
  return queries[key]
}

export function delQuery(...args: string[]): void {
  args.forEach((key) => {
    delete queries[key]
  })
}
