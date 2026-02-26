import Product from "../models/ProductModel"
import { IResTemp } from "../types/LibTypes"

export async function getAllProducts(): Promise<IResTemp> {
  const products = await Product.find().lean()

  return { code: 200, data: products }
}
