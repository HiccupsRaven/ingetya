import cfg from "../cfg"
import { rNumber } from "../lib/generators"
import validate from "../lib/validate"
import xhr from "../lib/xhr"
import shared from "../main/shared"
import Invoice from "../models/InvoiceModel"
import Order from "../models/OrderModel"
import Product from "../models/ProductModel"
import { IInvoice, IPaymentFee, IPaymentOptions, IPaymentTransferAccept } from "../types/InvoiceTypes"
import { IAny, IResTemp } from "../types/LibTypes"
import { IOrder, OrderStatus } from "../types/OrderTypes"
import { IItemPackage } from "../types/SharedTypes"

interface IMidtransRequest {
  url: string
  authorization: string
}

function encodeMidtrans(): IMidtransRequest {
  const isProd = cfg.MIDTRANS_PRODUCTION

  const api = isProd ? "api.midtrans.com" : "api.sandbox.midtrans.com"
  const SECRET_KEY = cfg[`${isProd ? "PR" : "SB"}_MIDTRANS_SERVER_KEY`]
  const authorization = Buffer.from(SECRET_KEY).toString("base64")

  const url = `https://${api}/v2`

  return { url, authorization }
}

function getTotalCharge(items: IItemPackage[], fee: IPaymentFee): number {
  const prices = items.map((pr) => pr.price)
  const totalPrice = prices.reduce((a, b) => a + b, 0)

  const feeCharge = fee.type === "flat" ? fee.charge : (totalPrice * fee.charge) / 100

  return Math.floor(totalPrice + feeCharge)
}

export async function getUserOrders(uid: string): Promise<IResTemp> {
  const orders = await Order.find({ userId: uid }).lean()

  const invoices = await Invoice.find({ iya_uid: uid }).lean()

  return { code: 200, data: { orders, invoices } }
}

export async function hasOrderLimit(uid: string): Promise<boolean> {
  const unpaidInvoiceSize = await Invoice.countDocuments({
    transaction_status: { $in: ["pending", "deny"] },
    iya_uid: uid
  })

  return unpaidInvoiceSize >= 2
}

export async function checkoutOrder(uid: string, s: IAny): Promise<IResTemp> {
  // yang ini palsu karna buat biar ga masuk prod dulu
  if (!validate([cfg.LUNA_SECRET], s)) return { code: 404 }

  if (!validate(["itemId", "productId", "paymentMethod"], s)) {
    return { code: 400 }
  }
  if (!Array.isArray(s.addons)) {
    return { code: 400 }
  }

  const isLimited = await hasOrderLimit(uid)
  if (isLimited) return { code: 400, msg: "invoice_limit" }

  const product = await Product.findOne({ id: s.productId })
  if (!product) {
    return { code: 404 }
  }

  const payments = shared.PAYMENTS

  const payment = payments.find((validPay) => validPay.id === s.paymentMethod)
  if (!payment) {
    return { code: 404 }
  }

  const items = shared.ITEMS

  const item = items.find((pr) => pr.id === s.itemId)

  if (!item) {
    return { code: 404 }
  }

  const addons = items.filter((pr) => pr.type === 10 && s.addons.some((addon: string) => addon === pr.id))

  const orderSize: number = await Order.countDocuments()

  const orderId = `${rNumber(3)}${orderSize}`

  const orderData: IOrder = {
    userId: uid,
    id: orderId,
    paymentId: payment.id,
    productId: product.id,
    itemId: item.id,
    addons: addons.map((pr) => pr.id),
    status: OrderStatus.Unpaid,
    data: {
      name: typeof s.orderName === "string" && s.orderName.length < 100 ? s.orderName : "-",
      date: Date.now()
    }
  }

  // await Order.create(orderData)

  const itemGroup = [item, ...addons]

  const totalCharge = getTotalCharge(itemGroup, payment.fee)

  const chargeOptions: Partial<IPaymentOptions> = {
    transaction_details: {
      gross_amount: totalCharge,
      order_id: orderId
    },
    item_details: [
      {
        name: `Undangan: Tema ${product.name}`,
        price: totalCharge,
        quantity: 1
      }
    ],
    customer_details: { userId: uid },
    custom_expiry: {
      expiry_duration: 720
    }
  }

  const bankTransfersIds: IPaymentTransferAccept[] = ["bca", "bni", "bri", "permata", "cimb", "other_va"]

  if (bankTransfersIds.includes(payment.id as IPaymentTransferAccept)) {
    chargeOptions.payment_type = "bank_transfer"
    chargeOptions.bank_transfer = {
      bank: payment.id === "other_va" ? "bni" : payment.id
    }
  }

  if (payment.id === "mandiri") {
    chargeOptions.payment_type = "echannel"
    chargeOptions.echannel = {
      bill_info1: "Payment:",
      bill_info2: "IngetYa Digital"
    }
  }

  if (payment.id === "qris") {
    chargeOptions.payment_type = "qris"
    chargeOptions.qris = { acquirer: "gopay" }
  }

  const midtrans = encodeMidtrans()

  const invoiceToExpiry = Date.now() + 1000 * 60 * 60 * 12

  const charge: IInvoice & IAny = await xhr.post(`${midtrans.url}/charge`, midtrans.authorization, chargeOptions)

  if (charge.error || charge.errors) {
    return { code: 500 }
  }

  const requiredKeys = ["order_id", "transaction_status"]
  const isChargeValid = requiredKeys.every((itm) => Object.keys(charge).some((k) => itm === k))
  if (!isChargeValid) {
    return { code: 500 }
  }

  await Order.create(orderData)

  const invoiceData: Record<string, IAny> = {}
  Object.keys(charge).forEach((k) => (invoiceData[k] = charge[k]))
  invoiceData.iya_expiry = invoiceToExpiry
  invoiceData.iya_price = totalCharge
  invoiceData.iya_uid = uid
  invoiceData.iya_timestamp = Date.now()

  await Invoice.create(invoiceData)

  return { code: 200, data: { order: orderData, invoice: invoiceData } }
}

// const res = await xhr.get(`${midtrans.url}/${s.order_id}/status`, midtrans.authorization)
// if (res.error) return

export async function orderNotificationHandler(_s: IAny): Promise<void> {
  // later
}
export async function orderSandBoxNotificationHandler(_s: IAny): Promise<void> {
  // later
}
