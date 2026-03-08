import { futor, kel } from "../../../lib/kel"
import modal from "../../../lib/modal"
import waittime from "../../../lib/waittime"
import xhr from "../../../lib/xhr"
import { InvoicesMemory, OrdersMemory } from "../../contentManager"
import socket from "../../Socket"
import { lang } from "../languageApp"
import { IHistoryState, Main } from "../Main"
import { INavButtonName } from "../Nav"
import { CMain } from "../types/MainTypes"
import { setAllProducts } from "./Explore"
import { Bill } from "./Invoices/Bill"
import { Invoice } from "./Invoices/Invoice"
import {} from "./Orders/Order"

export class MainInvoices implements CMain {
  id: INavButtonName = "invoices"
  private locked: boolean = false
  private el!: HTMLElement
  main: Main
  list: Invoice[] = []
  bill?: Bill
  constructor(main: Main) {
    this.main = main
  }
  private createElement(): void {
    this.el = kel("section", "sect sect-invoices")
    this.el.innerHTML = `
    <div class="sect-header">
      <h1>${lang("nav_invoices")}</h1>
      <p>${lang("invoice_desc")}</p>
    </div>
    <div class="sect-table">
      <table class="tg">
        <thead>
          <tr>
            <th>${lang("invoice_tb_time")}</th>
            <th>${lang("invoice_tb_id")}</th>
            <th>${lang("invoice_tb_name")}</th>
            <th>${lang("invoice_tb_status")}</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr class="cell-default">
            <td colspan="5"><i class="fa-solid fa-circle-notch fa-spin"></i> ${lang("loading")}</td>
          </tr>
        </tbody>
      </table>
    </div>`
  }
  private async writeData(): Promise<void> {
    const cellDefault = futor(".cell-default", this.el) as HTMLTableCellElement
    const rowDefault = futor("td", cellDefault)

    const invoiceExists = InvoicesMemory
    if (!invoiceExists.includes(null)) {
      this.renderData()
      if (invoiceExists.length < 1) {
        rowDefault.innerHTML = lang("invoice_tb_nodata")
        return
      }
      cellDefault.remove()
      return
    }

    this.locked = true

    const orders = await xhr.get("/x/orders/me")

    if (!orders.ok) {
      rowDefault.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> ${lang("error")}`
    }

    if (orders.code === 401) {
      await xhr.get("/x/auth/logout")
      window.location.href = "/portal"
      this.locked = false
      return
    }

    if (!orders.ok) {
      await modal.alert(lang(orders.msg) || lang("error"))
      this.locked = false
      return
    }

    OrdersMemory.splice(0, OrdersMemory.length)
    InvoicesMemory.splice(0, InvoicesMemory.length)

    socket.init(orders.data)

    await waittime(500)
    await setAllProducts()

    cellDefault.remove()

    this.renderData()
    this.locked = false
  }
  private renderData(): void {
    const tableBody = futor(".table-body", this.el)

    InvoicesMemory.filter((invoice) => !!invoice)
      .sort((a, b) => {
        if (a.iya_expiry > b.iya_expiry) return -1
        if (a.iya_expiry < b.iya_expiry) return 1
        return 0
      })
      .forEach((invoice) => {
        const item = new Invoice(invoice, this).run()
        this.list.push(item)
        tableBody.append(item.html)
      })
  }
  async handleHistory(state: IHistoryState): Promise<void> {
    if (state.subView && state.subView.startsWith("bill")) {
      const parts = state.subView.split("/")
      const invoiceId = parts[1] || "0"
      const invoice = InvoicesMemory.find((inv) => inv!.order_id === invoiceId)
      if (!invoice) return
      this.locked = true
      const bill = new Bill(invoice, this)
      bill.run()
      this.setBill(bill)
    }

    if (this.bill) {
      this.bill.handleHistory(state)
    }
  }
  setBill(newBill: Bill): void {
    this.bill = newBill
  }
  lock(newStatus: boolean = true) {
    this.locked = newStatus
  }
  get html(): HTMLElement {
    return this.el
  }
  get isLocked(): boolean {
    return this.locked
  }
  async destroy(force?: boolean): Promise<void> {
    if (force) {
      this.locked = false
      modal.abort()
      this.el.remove()
      return
    }
    await modal.abort()
    this.locked = true
    this.el.classList.add("out")
    await waittime()
    this.locked = false
    this.el.classList.remove("out")
    this.el.remove()
  }
  run(): this {
    socket.send("traffic", { content: "Invoices" })
    this.createElement()
    this.writeData()
    return this
  }
}
