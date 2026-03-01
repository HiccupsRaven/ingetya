import { eapp, futor, kel, qutor } from "../../../../lib/kel"
import waittime from "../../../../lib/waittime"
import { IProduct } from "../../../contentManager"
import { lang } from "../../languageApp"
import { MainExplore } from "../Explore"
import { Payment } from "../Invoices/Payment"
import { IProductId, ProductAddon, ProductPackage } from "./ProductPackage"
import productPackages from "./productPackages.json"
import { getAllPaymentInfo } from "../Invoices/getPaymentInfo"
import { IHistoryState } from "../../Main"

export class Cart {
  product: IProduct
  readonly id: string = "cart"
  private el!: HTMLDivElement
  explore: MainExplore
  packages: ProductPackage[] = []
  addons: ProductAddon[] = []
  payments: Payment[] = []
  private locked: boolean = false
  packageActive!: IProductId
  addonsActive: IProductId[] = []
  constructor(product: IProduct, explore: MainExplore) {
    this.product = product
    this.explore = explore
  }
  private createElement(): void {
    const cartBefore = qutor(".cart")
    if (cartBefore) cartBefore.remove()
    this.el = kel("div", "cart")
    this.el.innerHTML = `
    <div class="card">
      <div class="title">${this.product.name}</div>
      <div class="field input-wrapper">
        <label for="name" class="label">${lang("cart_order_note")}</label>
        <input type="text" name="name" id="name" autocomplete="off" placeholder="Wedding Rudi 27 Mei" />
        <p class="sm">${lang("cart_notice")}</p>
      </div>
      <div class="field expiry">
        <p class="label">${lang("cart_package")}</p>
        <div class="expiry-wrapper"></div>
      </div>
      <div class="field add-on">
        <p class="label">${lang("cart_addon")} (${lang("optional")})</p>
        <div class="addon-wrapper"></div>
      </div>
      <div class="field payment-methods">
        <p class="label">${lang("cart_payment_text")}</p>
      </div>
      <div class="field cancel-payment">
        <div class="btn btn-cancel-payment"><i class="fa-solid fa-xmark"></i> ${lang("cart_cancel")}</div>
      </div>
    </div>`
  }
  private writeThumbnail(): void {
    const title = futor(".title", this.el)
    title.style.backgroundImage = `url("${this.product.thumbnail}")`
  }
  private writePackages(): void {
    const packagewrapper = futor(".expiry-wrapper", this.el)
    productPackages
      .filter((packageInfo) => packageInfo.type === 1)
      .forEach((packageInfo, i) => {
        const productPackage = new ProductPackage(packageInfo, this)
        productPackage.run()
        packagewrapper.append(productPackage.html)
        this.packages.push(productPackage)
        if (i === 0) this.activatePackage(packageInfo.id)
      })
  }
  private writeAddons(): void {
    const addonwrapper = futor(".addon-wrapper", this.el)
    productPackages
      .filter((addonInfo) => addonInfo.type === 10)
      .forEach((addonInfo) => {
        const productAddon = new ProductAddon(addonInfo, this)
        productAddon.run()
        addonwrapper.append(productAddon.html)
        this.addons.push(productAddon)
      })
  }
  activatePackage(packageId: IProductId): void {
    this.packageActive = packageId
    this.packages.forEach((productPackage) => {
      if (productPackage.id === packageId) {
        productPackage.activate()
      } else {
        productPackage.activate(false)
      }
    })
    this.payments.forEach((payment) => payment.updateCharge())
  }
  activateAddon(packageId: IProductId, newStatus: boolean = true): void {
    this.addons.find((addon) => addon.activate(newStatus))

    if (newStatus === true) {
      if (this.addonsActive.includes(packageId)) return
      this.addonsActive.push(packageId)
    } else {
      const packageIndex = this.addonsActive.indexOf(packageId)
      if (packageIndex !== -1) {
        this.addonsActive.splice(packageIndex, 1)
      }
    }
    this.payments.forEach((payment) => payment.updateCharge())
  }
  writePaymentMethods(): void {
    const paymentWrapper = futor(".payment-methods", this.el)
    const availableMethods = getAllPaymentInfo()
    availableMethods.forEach((paymentInfo) => {
      const payment = new Payment(paymentInfo, this).run()
      this.payments.push(payment)
      paymentWrapper.append(payment.html)
    })
  }
  private onCancelPayment(): void {
    const btnCancel = futor(".btn-cancel-payment", this.el)
    btnCancel.onclick = async () => {
      if (this.locked) return
      await this.destroy()
      history.back()
    }
  }
  async handleHistory(state: IHistoryState): Promise<void> {
    if (!state.subView) {
      this.explore.lock(false)
      this.locked = false
      this.destroy()
    }
  }
  lock(newStatus: boolean = true): void {
    this.locked = newStatus
  }
  get isLocked(): boolean {
    return this.locked
  }
  get html(): HTMLElement {
    return this.el
  }
  async destroy(force?: boolean): Promise<void> {
    if (this.locked && !force) return
    this.locked = true
    this.el.classList.add("out")
    await waittime()
    this.locked = false
    this.explore.lock(false)
    this.el.classList.remove("out")
    this.el.remove()
  }
  run(): this {
    this.createElement()
    eapp().append(this.el)
    this.writeThumbnail()
    this.writePackages()
    this.writeAddons()
    this.writePaymentMethods()
    this.onCancelPayment()
    return this
  }
}
