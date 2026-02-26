import { IAny } from "../types/LibTypes"

export interface IAccount {
  id: string
  lunaId: string
}
export enum ProductGroup {
  Invitation = 1,
  GuestBook = 2
}
export interface IProduct {
  id: string
  group: ProductGroup
  thumbnail: string
  url: string
  name: string
}

export const AccountMemory: Partial<IAccount> & IAny = {}

export const ProductsMemory: IProduct[] = []
