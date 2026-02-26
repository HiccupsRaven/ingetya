import { model, Model, Schema } from "mongoose"
import { IProduct } from "../types/ProductTypes"

export type IProductModel = Model<IProduct>

const schema = new Schema(
  {
    id: { type: String, required: true },
    group: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    url: { type: String, required: true },
    name: { type: String, required: true }
  },
  {
    versionKey: false
  }
)

const Product: IProductModel = model<IProduct>("Product", schema)

export default Product
