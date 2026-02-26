import Order from "../models/OrderModel"
import { IAny, IResTemp } from "../types/LibTypes"

export async function getUserOrders(uid: string): Promise<IResTemp> {
  const orders = await Order.find({ userId: uid })

  return { code: 200, data: orders }
}

export async function orderNotificationHandler(_s: IAny): Promise<void> {
  // later
}
export async function orderSandBoxNotificationHandler(_s: IAny): Promise<void> {
  // later
}
