import { futor, kel } from "../../../../lib/kel"
import { lang } from "../../languageApp"
import { Cart } from "../Explore/Cart"
import { IPaymentFee, IPaymentMethodInfo, IPaymentStep } from "./getPaymentInfo"
import productPackages from "../Explore/productPackages.json"
import { toMoneyFormat } from "../../../../lib/generators"
import { getLanguage } from "../../../../lib/locales"
import modal from "../../../../lib/modal"
import xhr from "../../../../lib/xhr"

export function getPaymentTotal(subTotal: number, fee: IPaymentFee): number {
  const feeCharge = fee.type === "flat" ? fee.charge : (subTotal * fee.charge) / 100

  return Math.floor(subTotal + feeCharge)
}

export function getPaymentFeeTotal(subTotal: number, fee: IPaymentFee): number {
  return getPaymentTotal(subTotal, fee) - subTotal
}

export function parseFeeCharge(fee: IPaymentFee): string {
  if (fee.type === "flat") {
    return `Rp${toMoneyFormat(fee.charge)}`
  }
  return `${fee.charge}%`
}

export class Payment {
  readonly id: string
  private el!: HTMLDivElement
  constructor(
    private paymentInfo: IPaymentMethodInfo,
    private cart: Cart
  ) {
    this.id = paymentInfo.id
  }
  private createElement(): void {
    this.el = kel("div", "payment")
    this.el.innerHTML = `
    <div class="payment-title">
      <span class="arrow-openclose"><i class="fa-solid fa-chevron-right"></i></span>
      <img src="/assets/icons/payments/${this.paymentInfo.id}-icon.svg" alt="[${this.paymentInfo.name} Logo]" height="24" />
      <span class="title-text">${this.paymentInfo.name}</span>
    </div>
    <div class="payment-detail">
      <div class="fee"></div>
      <div class="btn btn-buy" data-payment="${this.paymentInfo.id}"><i class="fa-duotone fa-solid fa-chevrons-right"></i> ${lang("cart_checkout")} ${this.paymentInfo.name}</div>
    </div>`
  }
  updateCharge(): void {
    const feewrapper = futor(".fee", this.el)
    while (feewrapper.lastChild) {
      feewrapper.lastChild.remove()
    }
    const oPackage = productPackages.find((productPackage) => productPackage.id === this.cart.packageActive)!

    const oAddons = productPackages.filter((productPackage) => this.cart.addonsActive.find((addon) => addon === productPackage.id))

    const costPackage = `<p>${lang("cart_package")}: <b>Rp${toMoneyFormat(oPackage.price)}</b> (${lang("cart_" + oPackage.id)})</p>`
    feewrapper.innerHTML += `${costPackage}`

    const addonsTotal = oAddons.reduce((acc, addon) => acc + addon.price, 0)

    const addonsGroup = oAddons.map((addon) => lang("cart_" + addon.id)).join(", ")
    if (oAddons.length >= 1) {
      const costAddons = `<p>${lang("cart_addon")}: <b>Rp${toMoneyFormat(addonsTotal)}</b> [${addonsGroup}]</p>`
      feewrapper.innerHTML += costAddons
    }

    const subTotal = oPackage.price + addonsTotal

    const oFee = getPaymentFeeTotal(subTotal, this.paymentInfo.fee)
    const costFee = `<p>${lang("cart_fee")}: <b>Rp${toMoneyFormat(oFee)}</b> (${parseFeeCharge(this.paymentInfo.fee)})</p>`
    feewrapper.innerHTML += `${costFee}`

    const total = subTotal + oFee
    const costTotal = `<p>${lang("cart_total")}: <b>Rp${toMoneyFormat(total)}</b></p>`

    feewrapper.innerHTML += `${costTotal}`
  }
  private writeSteps(): void {
    const details = futor(".payment-detail", this.el)

    const steps = this.paymentInfo.howto[getLanguage()]

    steps.forEach((step) => {
      const stepwrapper = createStep(step)
      details.append(stepwrapper)
    })
  }
  private onTitleClick(): void {
    const title = futor(".payment-title", this.el)
    title.onclick = () => {
      this.el.classList.toggle("show")
    }
  }
  private onBuyClick(): void {
    const btnBuy = futor(".btn-buy", this.el)
    btnBuy.onclick = async () => {
      if (this.cart.isLocked) return
      this.cart.lock()
      const data = {
        itemId: this.cart.packageActive,
        productId: this.cart.product.id,
        paymentMethod: this.paymentInfo.id,
        addons: this.cart.addonsActive,
        orderName: this.cart.orderName
      }
      await modal.loading(xhr.post("/x/orders/checkout", data))
      await modal.alert("Sabar ya, masih proses ngoding-ngoding manja..")
      this.cart.lock(false)
    }
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.createElement()
    this.writeSteps()
    this.updateCharge()
    this.onTitleClick()
    this.onBuyClick()
    return this
  }
}

function createStep(step: IPaymentStep): HTMLDivElement {
  const el = kel("div", "method-wrapper")
  const methodName = kel("div", "method-name", { e: step.name })
  const methodSteps = kel("div", "method-steps")
  el.append(methodName, methodSteps)
  const ul = kel("ul")
  methodSteps.append(ul)

  step.steps.forEach((text) => {
    const li = kel("li", null, { e: text })
    ul.append(li)
  })

  return el
}
