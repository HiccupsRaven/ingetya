import { futor, kel } from "../../../lib/kel"
import modal from "../../../lib/modal"
import waittime from "../../../lib/waittime"
import xhr from "../../../lib/xhr"
import { IInvoice, InvoicesMemory, IOrder, OrdersMemory } from "../../contentManager"
import { lang } from "../languageApp"
import { Main } from "../Main"
import { INavButtonName } from "../Nav"
import { CMain } from "../types/MainTypes"
import { setAllProducts } from "./Explore"
import { Invoice } from "./Invoices/Invoice"
import {} from "./Orders/Order"

export class MainInvoices implements CMain {
  id: INavButtonName = "invoices"
  private locked: boolean = false
  private el!: HTMLElement
  main: Main
  list: Invoice[] = []
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

    orders.data.orders.forEach((order: IOrder) => {
      OrdersMemory.push(order)
    })

    orders.data.invoices.forEach((invoice: IInvoice) => {
      InvoicesMemory.push(invoice)
    })

    await waittime(500)
    await setAllProducts()

    cellDefault.remove()

    this.renderData()
    this.locked = false
  }
  private renderData(): void {
    const tableBody = futor(".table-body", this.el)

    InvoicesMemory.filter((invoice) => !!invoice).forEach((invoice) => {
      const item = new Invoice(invoice).run()
      this.list.push(item)
      tableBody.append(item.html)
    })
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
    this.createElement()
    this.writeData()
    return this
  }
}

// <table class="tg"><thead>
//   <tr>
//     <th class="tg-0lax">Tanggal</th>
//     <th class="tg-0lax">ID</th>
//     <th class="tg-0lax">Nama</th>
//     <th class="tg-0lax">Status</th>
//     <th class="tg-0lax">Aksi</th>
//   </tr></thead>
// <tbody>
//   <tr>
//     <td class="tg-0lax">11/12/17</td>
//     <td class="tg-0lax">123</td>
//     <td class="tg-0lax">HEHE</td>
//     <td class="tg-0lax">pending</td>
//     <td class="tg-0lax">lihat</td>
//   </tr>
//   <tr>
//     <td class="tg-0lax">10/12/17</td>
//     <td class="tg-0lax">234</td>
//     <td class="tg-0lax">ehek</td>
//     <td class="tg-0lax">settlement</td>
//     <td class="tg-0lax">lihat</td>
//   </tr>
// </tbody>
// </table>
