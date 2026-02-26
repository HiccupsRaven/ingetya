export enum OrderStatus {
  Unpaid = 1,
  Working = 2,
  Active = 3
}

export interface IOrder {
  id: string
  userId: string
  productId: string
  status: OrderStatus
}
