import { kel } from "../../lib/kel"
import { IAny } from "../../types/LibTypes"
import { type King } from "./King"
import { MainAccount } from "./Main/Account"
import { MainExplore } from "./Main/Explore"
import { MainInvoices } from "./Main/Invoices"
import { MainOrders } from "./Main/Orders"
import { INavButtonName } from "./Nav"
import { CMain } from "./types/MainTypes"

export interface IHistoryState {
  sectionId: INavButtonName
  subView?: string
  data?: IAny
}

export const CMainClass: Record<INavButtonName, (main: Main) => CMain> = {
  account: (main: Main) => new MainAccount(main),
  explore: (main: Main) => new MainExplore(main),
  orders: (main: Main) => new MainOrders(main),
  invoices: (main: Main) => new MainInvoices(main)
}

let initialSection: INavButtonName = "orders"

export class Main {
  section!: CMain
  private el!: HTMLElement
  king: King
  private locked: boolean = false
  constructor(king: King) {
    this.king = king
    window.onpopstate = this.handlePopState.bind(this)
  }
  private createElement(): void {
    const initialState: IHistoryState = { sectionId: initialSection }
    history.replaceState(initialState, "", `#${initialSection}`)

    this.king.nav.activate(initialSection)
    this.section = CMainClass[initialSection](this).run()

    this.el = kel("main", "main")
    this.el.append(this.section.html)
  }

  /**
   * Navigasi ke section utama yang baru.
   * @param sectionId ID dari section baru.
   * @param fromHistory `true` jika dipanggil dari popstate biar ga looping.
   */
  async setNewSection(sectionId: INavButtonName, fromHistory: boolean = false, force?: boolean): Promise<void> {
    if (this.locked) return
    if (this.section.id === sectionId) return
    this.locked = true

    if (!fromHistory) {
      const currentState: IHistoryState | null = history.state
      const newState: IHistoryState = { sectionId }

      let usePush = true

      if (currentState && !currentState.subView && currentState.sectionId !== "orders" && sectionId !== "orders") {
        usePush = false
      }

      const url = `#${sectionId}`
      if (usePush) {
        history.pushState(newState, "", url)
      } else {
        history.replaceState(newState, "", url)
      }
    }

    this.king.nav.runOpenClose(false)
    this.king.nav.activate(sectionId)
    await this.section.destroy(force)
    this.locked = false

    this.section = CMainClass[sectionId](this).run()
    this.el.append(this.section.html)
  }

  addHistory(state: IHistoryState): void {
    const url = `#${state.sectionId}${state.subView ? `/${state.subView.replace(/\//g, "-")}` : ""}`
    history.pushState(state, "", url)
  }

  private async handlePopState(event: PopStateEvent): Promise<void> {
    const state: IHistoryState | null = event.state
    this.section.lock(false)

    if (!state) {
      await this.setNewSection("orders", true, true)
      return
    }

    if (this.section.id !== state.sectionId) {
      await this.setNewSection(state.sectionId, true, true)
    }

    await this.section.handleHistory?.(state)
  }
  setRefresh(initSectionId?: INavButtonName): void {
    if (initSectionId) initialSection = initSectionId
    this.king.refresh()
  }
  get html(): HTMLElement {
    return this.el
  }
  get isLocked(): boolean {
    return this.section.isLocked || this.locked
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
