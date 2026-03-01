import { futor, kel } from "../../../../lib/kel"
import { SSKelement } from "../../../../types/LibTypes"
import { IOrder, OrderStatus } from "../../../contentManager"
import { lang } from "../../languageApp"
import { getProduct } from "../Explore/Product"
import { MainOrders } from "../Orders"

export class Order {
  private order: IOrder
  orders: MainOrders
  private el!: HTMLDivElement
  constructor(order: IOrder, orders: MainOrders) {
    this.order = order
    this.orders = orders
  }
  private createElement(): void {
    const product = getProduct(this.order.productId)

    this.el = kel("div", "item")
    this.el.innerHTML = `
    <img src="${product?.thumbnail || "/assets/images/error.png"}" alt="${this.order.id}" />
    <div class="item-label">#${this.order.id} | ${product?.name || "-"}</div>
    <div class="item-overlay"></div>`

    const itemOverlay = futor(".item-overlay", this.el)

    const orderStatus = parseOrderStatus(this.order)

    itemOverlay.append(...orderStatus)
  }
  get html(): HTMLDivElement {
    return this.el
  }
  private onClick(): void {
    this.el.onclick = () => {
      if (this.order.status === OrderStatus.Unpaid) {
        this.orders.lock(false)
        this.orders.main.setNewSection("invoices")
      }
    }
  }
  run(): this {
    this.createElement()
    this.onClick()
    return this
  }
}

export function parseOrderStatus(order: IOrder): SSKelement[] {
  const elements: SSKelement[] = []

  if (order.status === OrderStatus.Active) {
    const { name, date } = order.data ?? {}
    const orderEventName = kel("h3", null, { e: `${name ?? "-"}` })
    const orderEventDate = kel("p", null, { e: `${lang("order_event_date")}: ${date ?? ""}` })
    const orderTemplate = kel("div", "item-waiting active")
    orderTemplate.innerHTML = `<i class="fa-solid fa-palette"></i> ${lang("order_active_edit")} <i class="fa-solid fa-chevron-right"></i>`
    elements.push(orderEventName, orderEventDate, orderTemplate)
  } else if (order.status === OrderStatus.Working) {
    const orderOnProcessing = kel("div", "item-waiting working")
    orderOnProcessing.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang("order_status_working")}`
    elements.push(orderOnProcessing)
  } else if (order.status === OrderStatus.Unpaid) {
    const orderOnUnpaid = kel("div", "item-waiting unpaid")
    orderOnUnpaid.innerHTML = `<i class="fa-solid fa-credit-card"></i> ${lang("order_status_unpaid")}`
    elements.push(orderOnUnpaid)
  } else if (order.status === OrderStatus.Canceled) {
    const orderOnUnpaid = kel("div", "item-waiting unpaid")
    orderOnUnpaid.innerHTML = `<i class="fa-solid fa-droplet"></i> ${lang("order_status_canceled")}`
    elements.push(orderOnUnpaid)
  }

  return elements
}
