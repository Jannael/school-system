import { model, Schema } from 'mongoose'
import config from '../../../config/config'
import { IUser, IUserGroup, IUserInvitation } from '../../../interface/user'

const groupSchema = new Schema<IUserGroup>({
  name: { type: String, required: true },
  _id: { type: Schema.Types.ObjectId, required: true },
  color: { type: String, required: true }
}, { _id: false, versionKey: false })

const invitationSchema = new Schema<IUserInvitation>({
  name: { type: String, required: true },
  _id: { type: Schema.Types.ObjectId, required: true },
  color: { type: String, required: true }
}, { _id: false, versionKey: false })

const schema = new Schema<IUser>({
  fullName: { type: String, required: true },
  account: { type: String, required: true, unique: true },
  pwd: { type: String, required: true },
  nickName: { type: String },
  refreshToken: [{ type: String }],
  invitation: [invitationSchema],
  group: [groupSchema]
}, {
  ...config.database.mongodb.schemaOptions,
  collection: 'user'
})

export default model<IUser>('user', schema)
