import { model, Model, Schema } from "mongoose"
import { IOrder } from "../types/OrderTypes"

export type IOrderModel = Model<IOrder>

const schema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    itemId: { type: String, required: true },
    paymentId: { type: String, required: true },
    addons: { type: [String] },
    status: { type: Number, required: true },
    data: {
      name: { type: String },
      date: { type: Number }
    }
  },
  {
    versionKey: false
  }
)

const Order: IOrderModel = model<IOrder>("Order", schema)

export default Order
