import "webfont-awesome-pro/scss/allstyles.scss"
import "../stylesheets/contents/app/app.scss"
import { king } from "./contents/app/King"
import { loadLocale } from "./lib/locales"

function startKingdom(): void {
  king.run()
}

window.onload = () => {
  loadLocale()
  startKingdom()
}
