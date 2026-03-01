import { model, Model, Schema } from "mongoose"
import { IInvoice } from "../types/InvoiceTypes"

export type IInvoiceModel = Model<IInvoice>

const schema = new Schema(
  {
    order_id: { type: String, required: true },
    gross_amount: { type: String },
    transaction_status: { type: String },
    expiry_time: { type: String },
    settlement_time: { type: String },
    va_numbers: [
      {
        bank: { type: String },
        va_number: { type: String }
      }
    ],
    permata_va_number: { type: String },
    bill_key: { type: String },
    biller_code: { type: String },
    actions: [
      {
        name: { type: String },
        method: { type: String },
        url: { type: String }
      }
    ],
    qr_string: { type: String }
  },
  {
    versionKey: false
  }
)

const Invoice: IInvoiceModel = model<IInvoice>("Invoice", schema)

export default Invoice
