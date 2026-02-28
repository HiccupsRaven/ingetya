import { toMoneyFormat } from "../../../../lib/generators"
import { kel } from "../../../../lib/kel"
import { lang } from "../../languageApp"
import { Cart } from "./Cart"
import productPackages from "./productPackages.json"

export type IProductId = (typeof productPackages)[number]["id"] | (string & {})

export interface IProductPackage {
  id: IProductId
  type: number
  price: number
  note?: string
}

export class ProductPackage {
  readonly id: string
  cart: Cart
  protected el!: HTMLDivElement
  protected package: IProductPackage
  constructor(productPackage: IProductPackage, cart: Cart) {
    this.id = productPackage.id
    this.cart = cart
    this.package = productPackage
  }
  protected createElement(): void {
    this.el = kel("div", "btn btn-expiry btn-month")
    this.el.innerHTML = `<p>${lang("cart_package_durr")}</p><p><b>${lang("cart_" + this.package.id)}</b></p><p>Rp${toMoneyFormat(this.package.price)}</p>`
  }
  protected onClick(): void {
    this.el.onclick = () => {
      this.cart.activatePackage(this.id)
    }
  }
  activate(newStatus: boolean = true) {
    if (newStatus === true) {
      this.el.classList.add("active")
      return
    }
    this.el.classList.remove("active")
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.createElement()
    this.onClick()
    return this
  }
}

export class ProductAddon extends ProductPackage {
  private activated: boolean = false
  constructor(productPackage: IProductPackage, cart: Cart) {
    super(productPackage, cart)
  }
  createElement(): void {
    this.el = kel("div", "btn btn-addon-item btn-guess-book")
    this.el.innerHTML = `<p><b>${lang("cart_" + this.package.id)}</b></p><p>Rp${toMoneyFormat(this.package.price)}</p><p class="sm">${lang("cart_" + this.package.note)}</p>`
  }
  onClick(): void {
    this.el.onclick = () => {
      this.cart.activateAddon(this.id, !this.activated)
    }
  }
  activate(newStatus: boolean = true) {
    this.activated = newStatus
    if (newStatus === true) {
      this.el.classList.add("active")
      return
    }
    this.el.classList.remove("active")
  }
}
