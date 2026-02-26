import { futor, kel } from "../../../../lib/kel"
import modal from "../../../../lib/modal"
import { IProduct } from "../../../contentManager"
import { lang } from "../../languageApp"
import { MainExplore } from "../Explore"

export class Product {
  private product: IProduct
  explore: MainExplore
  private el!: HTMLDivElement
  constructor(product: IProduct, explore: MainExplore) {
    this.product = product
    this.explore = explore
  }
  private createElement(): void {
    this.el = kel("div", "item")
    this.el.innerHTML = `
    <img src="${this.product.thumbnail}" alt="${this.product.id}" />
    <div class="item-label">${this.product.name}</div>
    <div class="item-overlay">
      <div class="item-actions">
        <a href="${this.product.url}" target="_blank" class="btn-preview">${lang("explore_preview")}</a>
        <div class="btn btn-buy">${lang("explore_buy")}</div>
      </div>
    </div>`
  }
  get html(): HTMLDivElement {
    return this.el
  }
  private onClick(): void {
    const btnBuy = futor(".btn-buy", this.el)
    btnBuy.onclick = () => modal.alert("coming soon")
  }
  run(): this {
    this.createElement()
    this.onClick()
    return this
  }
}
