import sdate from "../../../../lib/sdate"
import { futor, kel } from "../../../../lib/kel"
import { IInvoice, InvoicesMemory, IOrder, OrdersMemory } from "../../../contentManager"
import { lang } from "../../languageApp"
import { MainInvoices } from "../Invoices"
import { Bill } from "./Bill"

export class Invoice {
  data: IInvoice
  order: IOrder
  private el!: HTMLTableRowElement
  invoices: MainInvoices
  constructor(data: IInvoice, invoices: MainInvoices) {
    this.invoices = invoices
    this.data = data
    this.order = OrdersMemory.find((itm) => itm!.id === data.order_id)!
  }
  private createElement(): void {
    this.el = kel("tr")
    this.el.innerHTML = `
    <td>${sdate.dateOrTime(this.order.data.date)}</td>
    <td>${this.data.order_id}</td>
    <td>${this.order.data.name}</td>
    <td class="transtatus ${this.data.transaction_status}"><div class="btn btn-view">${lang("invoice_" + this.data.transaction_status)}</div></td>`
  }
  updateData(): void {
    this.data = InvoicesMemory.find((itm) => itm!.order_id === this.data.order_id)!
    this.order = OrdersMemory.find((itm) => itm!.id === this.data.order_id)!

    const transactionStatus = futor(".transtatus", this.el)
    transactionStatus.innerHTML = lang("invoice_" + this.data.transaction_status)
  }
  onClick(): void {
    this.el.onclick = () => {
      this.invoices.lock(true)
      const bill = new Bill(this.data, this.invoices)
      bill.run()
      this.invoices.main.addHistory({ sectionId: "invoices", subView: "bill", data: { invoice: this.data } })
      this.invoices.setBill(bill)
    }
  }
  get html(): HTMLTableRowElement {
    return this.el
  }
  run(): this {
    this.createElement()
    this.onClick()
    return this
  }
}
