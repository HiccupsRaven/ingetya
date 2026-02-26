import { kel } from "../../lib/kel"
import { type King } from "./King"
import { MainAccount } from "./Main/Account"
import { MainExplore } from "./Main/Explore"
import { INavButtonName } from "./Nav"
import { CMain } from "./types/MainTypes"

export const CMainClass: Record<INavButtonName, (main: Main) => CMain> = {
  account: (main: Main) => new MainAccount(main),
  explore: (main: Main) => new MainExplore(main),
  orders: (main: Main) => new MainAccount(main),
  tickets: (main: Main) => new MainAccount(main)
}

export type CMainKey = keyof typeof CMainClass

let initialSection: CMainKey = "explore"

export class Main {
  section!: CMain
  private el!: HTMLElement
  king: King
  constructor(king: King) {
    this.king = king
  }
  private createElement(): void {
    this.king.nav.activate(initialSection)
    this.section = CMainClass[initialSection](this).run()

    this.el = kel("main", "main")
    this.el.append(this.section.html)
  }
  async setNewSection(sectionId: CMainKey): Promise<void> {
    await this.section.destroy()

    this.section = CMainClass[sectionId](this).run()
    this.el.append(this.section.html)
  }
  setRefresh(initSectionId?: CMainKey): void {
    if (initSectionId) initialSection = initSectionId
    this.king.refresh()
  }
  get html(): HTMLElement {
    return this.el
  }
  get isLocked(): boolean {
    return this.section.isLocked
  }
  async destroy(): Promise<void> {
    await this.section.destroy()
    this.el.remove()
  }
  run(): this {
    this.createElement()
    return this
  }
}
