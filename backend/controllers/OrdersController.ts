import { rNumber } from "../lib/generators"
import validate from "../lib/validate"
import shared from "../main/shared"
import Order from "../models/OrderModel"
import Product from "../models/ProductModel"
import { IPaymentFee, IPaymentOptions, IPaymentTransferAccept } from "../types/InvoiceTypes"
import { IAny, IResTemp } from "../types/LibTypes"
import { IOrder, OrderStatus } from "../types/OrderTypes"
import { IItemPackage } from "../types/SharedTypes"

function getTotalCharge(items: IItemPackage[], fee: IPaymentFee): number {
  const prices = items.map((pr) => pr.price)
  const totalPrice = prices.reduce((a, b) => a + b, 0)
  console.log(prices, totalPrice)

  const feeCharge = fee.type === "flat" ? fee.charge : (totalPrice * fee.charge) / 100

  return Math.floor(totalPrice + feeCharge)
}

export async function getUserOrders(uid: string): Promise<IResTemp> {
  const orders = await Order.find({ userId: uid })

  return { code: 200, data: orders }
}

export async function checkoutOrder(uid: string, s: IAny): Promise<IResTemp> {
  if (!validate(["itemId", "productId", "paymentMethod"], s)) {
    return { code: 400 }
  }
  if (!Array.isArray(s.addons)) {
    return { code: 400 }
  }

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
    customer_details: { userId: uid }
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

  console.log(orderData)
  console.log(chargeOptions)

  return { code: 200, data: { orderId, chargeOptions } }
}

export async function orderNotificationHandler(_s: IAny): Promise<void> {
  // later
}
export async function orderSandBoxNotificationHandler(_s: IAny): Promise<void> {
  // later
}
