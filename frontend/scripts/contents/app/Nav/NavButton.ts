import { kel } from "../../../lib/kel"
import { lang } from "../languageApp"
import { CMainKey } from "../Main"
import { Nav } from "../Nav"

export class NavButton {
  private el!: HTMLAnchorElement
  private name: CMainKey
  private icon: string
  private parent: Nav
  private locked: boolean = false
  constructor(parent: Nav, name: CMainKey, icon: string) {
    this.parent = parent
    this.name = name
    this.icon = icon
  }
  private createElement(): void {
    this.el = kel("a", "btn nav-link", { a: { href: `#${this.name}` } })
    this.el.innerHTML = `<div class="link-text"><i class="${this.icon}"></i> ${lang(`nav_${this.name}`)}</div>`
  }
  get isLocked(): boolean {
    return this.locked
  }
  remove(): void {
    this.el.remove()
  }
  activate(): void {
    this.el.classList.add("active")
  }
  deactivate(): void {
    this.el.classList.remove("active")
  }
  private onClick(): void {
    this.el.onclick = (e) => {
      e.preventDefault()
      if (this.parent.king.isLocked) return

      this.parent.activate(this.name)
      this.parent.runOpenClose(false)
      this.parent.king.brand.pageName = lang(`nav_${this.name}`)
      this.parent.king.main.setNewSection(this.name)
    }
  }
  get html(): HTMLAnchorElement {
    return this.el
  }
  run(): this {
    this.createElement()
    this.onClick()
    return this
  }
}
