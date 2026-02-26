import { kel } from "../../lib/kel"
import waittime from "../../lib/waittime"
import { type King } from "./King"
import { NavButton } from "./Nav/NavButton"

export type INavButtonName = "orders" | "explore" | "account" | "tickets"

interface IButtonData {
  name: INavButtonName
  icon: string
}

const buttonData: IButtonData[] = [
  { name: "orders", icon: "fa-sharp fa-solid fa-shopping-bag" },
  { name: "explore", icon: "fa-sharp fa-solid fa-compass" },
  { name: "tickets", icon: "fa-sharp fa-solid fa-comment-dots" },
  { name: "account", icon: "fa-sharp fa-solid fa-user" }
]

export class Nav {
  private list: Map<INavButtonName, NavButton> = new Map()
  private el!: HTMLElement
  private listElement!: HTMLDivElement
  private openClose!: HTMLDivElement
  private isOpen: boolean = false
  private locked: boolean = false
  king: King
  constructor(king: King) {
    this.king = king
  }

  private createElement(): void {
    this.el = kel("nav", "nav")
    this.listElement = kel("div", "nav-links")
    this.openClose = kel("div", "btn nav-action")

    buttonData.forEach((k) => this.list.set(k.name, new NavButton(this, k.name, k.icon).run()))

    this.list.forEach((button) => this.listElement.append(button.html))

    this.setOpenClose()

    this.el.append(this.listElement)
    this.el.append(this.openClose)
  }

  private setOpenClose(): void {
    this.openClose.innerHTML = `<i class="fa-solid fa-bars"></i> <span class="text">Menu</span>`
    this.openClose.onclick = async () => {
      if (this.locked) return

      this.locked = true
      await this.runOpenClose()
    }
  }

  async runOpenClose(newStatus?: boolean): Promise<void> {
    const isOpen = typeof newStatus === "boolean" ? !newStatus : this.isOpen

    if (isOpen) {
      this.openClose.innerHTML = `<i class="fa-solid fa-bars"></i> <span class="text">Menu</span>`
      this.el.classList.remove("active")
      this.el.classList.add("link-out")
      await waittime(200)
      this.el.classList.remove("link-out")
      this.isOpen = false
      this.locked = false
      return
    }

    this.el.classList.add("active")
    this.openClose.innerHTML = `<i class="fa-solid fa-xmark"></i> <span class="text">Menu</span>`
    await waittime()
    this.isOpen = true
    this.locked = false
  }

  resetOpenClose(): void {
    this.isOpen = false
    this.openClose.classList.remove("active", "link-out")
  }

  get html(): HTMLElement {
    return this.el
  }
  get isLocked(): boolean {
    let childLocked: boolean = false
    this.list.forEach((child) => {
      if (child.isLocked) childLocked = true
    })
    return childLocked || this.locked
  }
  activate(name: INavButtonName): void {
    this.list.forEach((button) => button.deactivate())
    const button = this.list.get(name)
    if (button) button.activate()
  }
  deactivate(name: INavButtonName): void {
    const button = this.list.get(name)
    if (button) button.deactivate()
  }

  async destroy(): Promise<void> {
    if (this.locked) return
    this.locked = true
    this.el.classList.add("out")
    await waittime()
    this.locked = false
    this.list.clear()
    this.listElement.remove()
    this.el.remove()
  }

  run(): this {
    this.createElement()
    return this
  }
}
