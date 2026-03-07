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
import { Order } from "./Orders/Order"

export class MainOrders implements CMain {
  id: INavButtonName = "orders"
  private locked: boolean = false
  private el!: HTMLElement
  main: Main
  list: Order[] = []
  constructor(main: Main) {
    this.main = main
  }
  private createElement(): void {
    this.el = kel("section", "sect sect-explore")
    this.el.innerHTML = `
      <div class="sect-header">
        <h1>${lang("nav_orders")}</h1>
        <p>${lang("orders_desc")}</p>
      </div>
      <div class="sect-list">
      </div>`
  }
  private async writeData(): Promise<void> {
    const sectList = futor(".sect-list", this.el)
    const itemLoad = kel("div", "add-item")
    itemLoad.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><p>${lang("loading")}</p>`
    sectList.append(itemLoad)

    const ordersExists = OrdersMemory
    if (!ordersExists.includes(null)) {
      this.renderData()
      itemLoad.innerHTML = `<i class="fa-solid fa-plus"></i><p>${lang("order_add")}</p>`
      return
    }
    this.locked = true

    const orders = await xhr.get("/x/orders/me")

    if (!orders.ok) {
      itemLoad.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i><p>${lang("error")}</p>`
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

    itemLoad.innerHTML = `<i class="fa-solid fa-plus"></i><p>${lang("order_add")}</p>`

    this.renderData()
    this.locked = false
  }

  private renderData(): void {
    const sectList = futor(".sect-list", this.el)

    OrdersMemory.filter((order) => !!order)
      .sort((a, b) => {
        if (a.data.date > b.data.date) return -1
        if (a.data.date < b.data.date) return 1
        return 0
      })
      .forEach((order) => {
        const item = new Order(order, this).run()
        this.list.push(item)
        sectList.append(item.html)
      })
    this.itemAddOnclick()
  }
  private itemAddOnclick(): void {
    const itemAdd = futor(".add-item", this.el)
    itemAdd.onclick = () => {
      if (this.locked || this.main.king.isLocked) return
      this.main.setNewSection("explore")
    }
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
