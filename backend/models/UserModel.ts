import { model, Model, Schema } from "mongoose"
import { IUser } from "../types/UserTypes"

export type IUserModel = Model<IUser>

const schema = new Schema(
  {
    id: { type: String, required: true },
    externalId: { type: String, required: true },
    email: { type: String, required: true },
    created: { type: Number, required: true },
    access: { type: Number }
  },
  {
    versionKey: false
  }
)

const User: IUserModel = model<IUser>("User", schema)

export default User
