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
