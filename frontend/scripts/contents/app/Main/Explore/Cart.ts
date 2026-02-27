import { eapp, kel } from "../../../../lib/kel"
import waittime from "../../../../lib/waittime"
import { IProduct } from "../../../contentManager"
import { lang } from "../../languageApp"
import { MainExplore } from "../Explore"

export class Cart {
  private product: IProduct
  readonly id: string = "cart"
  private el!: HTMLDivElement
  explore: MainExplore
  private locked: boolean = false
  constructor(product: IProduct, explore: MainExplore) {
    this.product = product
    this.explore = explore
  }
  private createElement(): void {
    this.el = kel("div", "cart")
    this.el.innerHTML = `<div class="card">
    <div class="title">Olive</div>
      <div class="field input-wrapper">
        <label for="name" class="label">${lang("cart_order_note")}</label>
        <input type="text" name="name" id="name" autocomplete="off" placeholder="Wedding Rudi 27 Mei" />
        <p class="sm">${lang("cart_notice")}</p>
      </div>
      <div class="field expiry">
        <div class="btn btn-expiry btn-month active">
          <p><b>1 Bulan</b></p>
          <p>Rp20.000</p>
        </div>
        <div class="btn btn-expiry btn-year">
          <p><b>12 Bulan</b></p>
          <p>Rp90.000</p>
        </div>
      </div>
      <div class="field payment-methods">
        <p class="label">Metode Pembayaran</p>
        <div class="payment show">
          <div class="payment-title">
            <img src="/assets/icons/payments/bri-icon.svg" alt="[BRI Logo]" height="24" /> <span class="title-text">Bank BRI</span> <span><i class="fa-solid fa-chevron-right"></i></span>
          </div>
          <div class="payment-detail">
            <div class="fee">
              <p class="amount">Biaya Metode Pembayran: <b>0.7%</b></p>
              <p class="total">Total: <b>Rp90.000</b></p>
            </div>
            <div class="btn btn-buy" data-payment="bri">Lanjut dengan BRI</div>
            <div class="method-wrapper">
              <div class="method-name">Internet Banking BRI</div>
              <div class="method-steps">
                <ul>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                </ul>
              </div>
            </div>
            <div class="method-wrapper">
              <div class="method-name">ATM BRI</div>
              <div class="method-steps">
                <ul>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="payment">
          <div class="payment-title">
            <img src="/assets/icons/payments/qris-icon.svg" alt="[BRI Logo]" height="24" /> <span class="title-text">QRIS</span> <span><i class="fa-solid fa-chevron-right"></i></span>
          </div>
          <div class="payment-detail">
            <div class="btn btn-buy" data-payment="bri">Lanjutkan Pembayaran dengan BRI</div>
            <div class="method-wrapper">
              <div class="method-name">Scan Kode</div>
              <div class="method-steps">
                <ul>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                  <li>Pilih pembayaran & pembelian.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="btn btn-cancel-payment"><i class="fa-solid fa-xmark"></i> ${lang("cart_cancel")}</div>
      </div>
    </div>`
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
    this.explore.lock(false)
    this.el.classList.remove("out")
    this.el.remove()
  }
  run(): this {
    this.createElement()
    eapp().append(this.el)
    return this
  }
}
