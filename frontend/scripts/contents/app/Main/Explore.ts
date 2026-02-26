import { futor, kel } from "../../../lib/kel"
import modal from "../../../lib/modal"
import waittime from "../../../lib/waittime"
import xhr from "../../../lib/xhr"
import { IProduct, ProductsMemory } from "../../contentManager"
import { lang } from "../languageApp"
import { CMainKey, Main } from "../Main"
import { CMain } from "../types/MainTypes"
import { Product } from "./Explore/Product"

export class MainExplore implements CMain {
  readonly id: CMainKey = "explore"
  private locked: boolean = false
  private el!: HTMLElement
  main: Main
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

    const products = await xhr.get("/x/products")

    if (!products.ok) {
      itemLoad.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i><p>${lang("error")}</p>`
    }

    if (products.code === 401) {
      await xhr.get("/x/auth/logout")
      window.location.href = "/portal"
      return
    }

    if (!products.ok) {
      await modal.alert(lang(products.msg) || lang("error"))
      this.locked = false
      return
    }

    products.data.forEach((product: IProduct) => {
      ProductsMemory.push(product)
    })

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
  get isLocked(): boolean {
    return this.locked
  }
  get html(): HTMLElement {
    return this.el
  }
  async destroy(): Promise<void> {
    if (this.locked) return
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
