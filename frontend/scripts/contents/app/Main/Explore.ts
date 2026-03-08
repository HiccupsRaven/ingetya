import { futor, kel } from "../../../lib/kel"
import modal from "../../../lib/modal"
import waittime from "../../../lib/waittime"
import xhr from "../../../lib/xhr"
import { IResponse } from "../../../types/LibTypes"
import { IProduct, ProductsMemory } from "../../contentManager"
import socket from "../../Socket"
import { lang } from "../languageApp"
import { IHistoryState, Main } from "../Main"
import { INavButtonName } from "../Nav"
import { CMain } from "../types/MainTypes"
import { Cart } from "./Explore/Cart"
import { Product } from "./Explore/Product"

export class MainExplore implements CMain {
  readonly id: INavButtonName = "explore"
  private locked: boolean = false
  private el!: HTMLElement
  main: Main
  cart: Cart | null = null
  constructor(main: Main) {
    this.main = main
  }
  private createElement(): void {
    this.el = kel("section", "sect sect-explore")
    this.el.innerHTML = `
    <div class="sect-header">
      <h1>${lang("nav_explore")}</h1>
      <p>${lang("explore_desc")}</p>
    </div>
    <div class="sect-list">
    </div>`
  }
  private async writeData(): Promise<void> {
    const sectList = futor(".sect-list", this.el)
    const itemLoad = kel("div", "add-item")
    itemLoad.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><p>${lang("loading")}</p>`
    sectList.append(itemLoad)

    const productsExists = ProductsMemory
    if (productsExists.length >= 1) {
      this.renderData()
      itemLoad.remove()
      return
    }
    this.locked = true

    const products = await setAllProducts()

    if (!products.ok) {
      itemLoad.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i><p>${lang("error")}</p>`
    }

    if (!products.ok) {
      await modal.alert(lang(products.msg) || lang("error"))
      this.locked = false
      return
    }

    itemLoad.remove()

    this.renderData()
    this.locked = false
  }

  private renderData(): void {
    const sectList = futor(".sect-list", this.el)

    ProductsMemory.forEach((product) => {
      const item = new Product(product, this).run()
      sectList.append(item.html)
    })
  }

  async handleHistory(state: IHistoryState): Promise<void> {
    if (state.subView && state.subView.startsWith("cart")) {
      const parts = state.subView.split("/")
      const productId = parts[1] || "0"
      const product = ProductsMemory.find((pr) => pr.id === productId)
      if (product) {
        this.locked = true
        const cart = new Cart(product, this)
        cart.run()
        this.setCart(cart)
      }
    }

    if (this.cart) {
      this.cart.handleHistory(state)
    }
  }

  setCart(newCart: Cart): void {
    this.cart = newCart
  }

  get isLocked(): boolean {
    return this.locked
  }
  lock(newStatus: boolean = true) {
    this.locked = newStatus
  }
  get html(): HTMLElement {
    return this.el
  }
  async destroy(force?: boolean): Promise<void> {
    if (force) {
      this.locked = false
      modal.abort()
      this.el.remove()
      return
    }
    if (this.locked) return
    this.locked = true
    this.el.classList.add("out")
    await waittime()
    this.locked = false
    this.el.classList.remove("out")
    this.el.remove()
  }
  run(): this {
    socket.send("traffic", { content: "Explore" })
    this.createElement()
    this.writeData()
    return this
  }
}

export async function setAllProducts(): Promise<IResponse> {
  const productsExists = ProductsMemory
  if (productsExists.length < 1) {
    const products = await xhr.get("/x/products")
    if (products.code === 401) {
      await xhr.get("/x/auth/logout")
      window.location.href = "/portal"
      return products
    }
    if (!products.ok) {
      return products
    }
    products.data.forEach((product: IProduct) => {
      ProductsMemory.push(product)
    })
    return { ok: true, code: 200, msg: "ok" }
  }
  return { ok: true, code: 200, msg: "ok" }
}
