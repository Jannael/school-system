import { model, Schema } from 'mongoose'
import config from './../../../config/config'
import { IGroup } from '../../../interface/group'

const techLeadSchema = new Schema<NonNullable<IGroup['techLead']>[number]>({
  fullName: { type: String, required: true },
  account: { type: String, required: true }
}, {
  ...config.database.mongodb.schemaOptions,
  _id: false
})

const memberSchema = new Schema<NonNullable<IGroup['member']>[number]>({
  account: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, required: true }
}, {
  ...config.database.mongodb.schemaOptions,
  _id: false
})

const schema = new Schema<IGroup>({
  techLead: [{ type: techLeadSchema, required: true }],
  name: { type: String, required: true },
  repository: { type: String },
  color: { type: String, required: true },
  member: [memberSchema]
}, {
  ...config.database.mongodb.schemaOptions,
  collection: 'group'
})

export default model<IGroup>('group', schema)
