import QRcode from "qrcode"
import { eapp, futor, kel, qutor } from "../../../../lib/kel"
import waittime from "../../../../lib/waittime"
import { IInvoice, IOrder, OrdersMemory } from "../../../contentManager"
import { lang } from "../../languageApp"
import { IHistoryState } from "../../Main"
import { MainInvoices } from "../Invoices"
import { getPaymentInfo, IPaymentMethodInfo } from "./getPaymentInfo"
import { createStep } from "./Payment"
import { getLanguage } from "../../../../lib/locales"
import sdate from "../../../../lib/sdate"
import { toMoneyFormat } from "../../../../lib/generators"
import socket from "../../../Socket"

let timeInterval: ReturnType<typeof setInterval> | null = null

export class Bill {
  data: IInvoice
  order: IOrder
  private el!: HTMLDivElement
  private locked: boolean = false
  invoices: MainInvoices
  private field!: HTMLDivElement
  private paymentInfo: IPaymentMethodInfo
  constructor(invoice: IInvoice, invoices: MainInvoices) {
    this.data = invoice
    this.order = OrdersMemory.find((itm) => itm!.id === invoice.order_id)!
    this.invoices = invoices
    this.paymentInfo = getPaymentInfo(this.order.paymentId)!
  }
  private createElement(): void {
    clearTimeInterval()
    const billBefore = qutor(".cart.bill")
    if (billBefore) billBefore.remove()

    this.el = kel("div", "cart bill")
    this.el.innerHTML = `
    <div class="card">
      <div class="title">#${this.data.order_id}</div>
      <div class="field payment-data">
      </div>
      <div class="field payment-methods payment-bill">
        <div class="payment show">
          <div class="payment-detail">
          </div>
        </div>
      </div>
      <div class="field cancel-payment">
        <div class="btn btn-cancel-payment"><i class="fa-solid fa-arrow-left"></i> ${lang("back")}</div>
      </div>
    </div>`

    this.field = futor(".payment-data", this.el) as HTMLDivElement
  }
  private async writeData(): Promise<void> {
    this.writePayment()
    await this.writeDetail()
    this.writeAmount()
    this.writeTransactionTime()
    this.writeSteps()
  }
  private writePayment(): void {
    const line1 = kel("span", "line")
    const line2 = kel("span", "line")

    const paymentProvider = new Image()
    paymentProvider.src = `/assets/icons/payments/${this.paymentInfo.id}-icon.svg`
    paymentProvider.alt = `[${this.paymentInfo.name} Logo]`
    paymentProvider.height = 36

    const wrapper = createWrapper("bank-logo")
    wrapper.append(line1, paymentProvider, line2)

    this.field.append(wrapper)
  }
  private async writeDetail(): Promise<void> {
    const paymentDetail = await createPaymentDetail(this.order.paymentId, this.data)
    this.field.append(...paymentDetail)
  }
  private writeAmount(): void {
    const wrapper = createWrapper()

    const label = kel("label", null, { a: { for: "base-amount" } })
    label.innerHTML = lang("bill_amount")

    const inp = kel("input", null, {
      a: {
        type: "text",
        name: "base-amount",
        id: "base-amount",
        autocomplete: "off"
      }
    })
    inp.value = `Rp${toMoneyFormat(this.data.iya_price)}`
    wrapper.append(label, inp)
    this.field.append(wrapper)
  }
  private writeTransactionTime(): void {
    const transactionDetail = createTransactionTime(this.data)

    this.field.append(transactionDetail)
  }
  private writeSteps(): void {
    const transStatusEnds = ["settlement", "cancel", "expire"]
    if (transStatusEnds.some((tr) => tr === this.data.transaction_status)) {
      const paymentMethod = futor(".payment-methods", this.el)
      paymentMethod.remove()
      return
    }
    const details = futor(".payment-detail", this.el)

    const steps = this.paymentInfo.howto[getLanguage()]

    steps.forEach((step) => {
      const stepwrapper = createStep(step)
      details.append(stepwrapper)
    })
  }
  private onBack(): void {
    const btnCancel = futor(".btn-cancel-payment", this.el)
    btnCancel.onclick = async () => {
      if (this.locked) return
      await this.destroy()
      history.back()
    }
  }
  async handleHistory(state: IHistoryState): Promise<void> {
    if (!state.subView) {
      this.invoices.lock(false)
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
    clearTimeInterval()
    this.locked = true
    this.el.classList.add("out")
    await waittime()
    this.locked = false
    this.invoices.lock(false)
    this.el.classList.remove("out")
    this.el.remove()
  }
  run(): this {
    socket.send("traffic", { content: `Invoices > Bill > ${this.data.order_id}` })
    this.createElement()
    eapp().append(this.el)
    this.writeData()
    this.onBack()
    return this
  }
}

export async function createPaymentDetail(bankId: string, invoice: IInvoice): Promise<HTMLDivElement[]> {
  const data: HTMLDivElement[] = []

  const transStatusEnds = ["settlement", "cancel", "expire"]
  if (transStatusEnds.some((tr) => tr === invoice.transaction_status)) {
    const wrapper = createWrapper(`trans-status status-${invoice.transaction_status}`)

    const iconClass = invoice.transaction_status === "settlement" ? "fa-circle-check" : "fa-circle-xmark"

    const transIcon = kel("div", "trans-icon", { e: `<i class="fa-duotone fa-solid ${iconClass}"></i>` })
    const transText = kel("div", "trans-text", { e: lang(`invoice_${invoice.transaction_status}`) })
    wrapper.append(transIcon, transText)

    data.push(wrapper)
    return data
  }

  const banks = [["qris"], ["bca", "bni", "bri", "cimb", "permata", "mandiri", "other_va"]]
  const needCodes = ["other_va", "mandiri"]

  if (banks[0].some((id) => bankId === id)) {
    const wrapper = createWrapper("qrcode")
    const qrUrl = invoice.actions!.find((act) => act.name === "generate-qr-code")!.url

    const qrString = invoice.qr_string || qrUrl

    const qr = await QRcode.toDataURL(qrString, {
      color: {
        dark: "#1c222c",
        light: "#cccccc"
      },
      type: "image/png",
      width: 250
    })
      .then((res) => res)
      .catch((err) => {
        console.error(err)
        return "error"
      })

    const imgsrc = qr === "error" ? qrUrl : qr
    const img = new Image()
    img.src = imgsrc

    const span = kel("span", "sm qr-download", { e: lang("bill_qr_download") })

    const a = kel("a", "qr-image")
    a.download = `IngetYa_QRIS_${invoice.order_id}`
    a.href = imgsrc
    a.append(img, span)

    wrapper.append(a)
    data.push(wrapper)
  } else if (banks[1].some((id) => id === bankId)) {
    if (needCodes.some((code) => code === bankId)) {
      const wrapperCode = createWrapper()

      const labelCode = kel("label", null, { a: { for: "base-va" } })
      labelCode.innerHTML = lang("bill_bank_code")

      const inpCode = kel("input", null, {
        a: {
          type: "text",
          name: "base-code",
          id: "base-code",
          autocomplete: "off"
        }
      })
      if (bankId === "mandiri") {
        inpCode.value = invoice.biller_code!
      } else {
        inpCode.value = "009 - BNI"
      }
      inpCode.readOnly = true

      wrapperCode.append(labelCode, inpCode)
      data.push(wrapperCode)
    }
    const wrapper = createWrapper()

    const label = kel("label", null, { a: { for: "base-va" } })
    label.innerHTML = lang("bill_va_number")

    const inp = kel("input", null, {
      a: {
        type: "text",
        name: "base-va",
        id: "base-va",
        autocomplete: "off"
      }
    })
    if (bankId === "mandiri") {
      inp.value = invoice.bill_key!
    } else if (bankId === "permata") {
      inp.value = invoice.permata_va_number!
    } else {
      inp.value = invoice.va_numbers!.find((va) => va.va_number)!.va_number
    }
    inp.readOnly = true

    wrapper.append(label, inp)

    data.push(wrapper)
  }

  return data
}

export function createTransactionTime(invoice: IInvoice): HTMLDivElement {
  const wrapper = createWrapper()

  const label = kel("label", null, { a: { for: "base-time" } })

  const inp = kel("input", null, {
    a: {
      type: "text",
      name: "base-time",
      id: "base-time",
      autocomplete: "off"
    }
  })
  inp.readOnly = true

  if (invoice.transaction_status === "settlement") {
    label.innerHTML = lang("bill_settlement_time")
    inp.value = sdate.datetime(new Date(invoice.settlement_time!).getTime())
  }
  const timeTarget = new Date(invoice.expiry_time!).getTime()

  if (["cancel", "expire"].some((tr) => tr === invoice.transaction_status)) {
    label.innerHTML = lang("bill_expiry_time")
    inp.value = sdate.datetime(timeTarget)
  }

  if (["pending", "deny"].some((tr) => tr === invoice.transaction_status)) {
    label.innerHTML = lang("bill_expiry_time")
    inp.value = lang("loading")
    timeInterval = setInterval(() => {
      const expireString = sdate.remain(timeTarget, true)
      inp.value = expireString || lang("invoice_expire")

      if (!expireString) clearTimeInterval()
    }, 900)
  }

  wrapper.append(label, inp)
  return wrapper
}

function createWrapper(className?: string): HTMLDivElement {
  return kel("div", `field input-wrapper${className ? " " + className : ""}`)
}

function clearTimeInterval(): void {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
}
