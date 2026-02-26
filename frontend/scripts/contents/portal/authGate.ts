import waittime from "../../lib/waittime"
import xhr from "../../lib/xhr"
import { ILunaPrimary } from "../../types/PortalTypes"
import { toBase64 } from "../../lib/generators"
import { LunaError } from "./autherror"
import { delQuery, findQuery, getQueries, setQueries } from "./queries"
import { LunaSignIn } from "./signin"

let checkUserInterval: ReturnType<typeof setInterval> | null = null

let currentCard: ILunaPrimary | null = null

async function checkUser(): Promise<void> {
  const queryParams = toBase64(getQueries())
  const isUser = await xhr.get(`/x/auth/isUser?luna=${queryParams}`)

  if (isUser.code === 401) {
    if (currentCard?.id === "lunasignin") return
    await currentCard?.destroy()
    currentCard = new LunaSignIn()
    if (checkUserInterval) {
      clearInterval(checkUserInterval)
      checkUserInterval = null
    }
    return
  }

  if (!isUser.ok) return

  if (isUser.data?.authCode) {
    setQueries({ code: isUser.data.authCode })
  }

  if (checkUserInterval) {
    clearInterval(checkUserInterval)
    checkUserInterval = null
  }

  await currentCard?.destroy()
  currentCard = null
  window.location.href = "/app"
}

export async function checkRedirect(isClear?: boolean): Promise<void> {
  await waittime(1000)

  if (isClear) {
    delQuery("errorMsg", "error")
  }

  const isError = findQuery("errorMsg") || findQuery("error")
  const errMsg = findQuery("errorMsg")

  if (isError) {
    await currentCard?.destroy()
    currentCard = new LunaError(errMsg)
    return
  }

  await waittime(500)

  checkUserInterval = setInterval(() => checkUser(), 10000)
  checkUser()
}

export function setCard(newCard: ILunaPrimary): void {
  currentCard = newCard
}
