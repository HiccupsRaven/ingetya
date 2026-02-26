import "webfont-awesome-pro/scss/allstyles"
import "../stylesheets/contents/portal/portal.scss"
import { checkRedirect, setCard } from "./contents/portal/authGate"
import { LunaCheck } from "./contents/portal/check"

window.onload = () => {
  const waitCard = new LunaCheck()
  setCard(waitCard)

  checkRedirect()
}
