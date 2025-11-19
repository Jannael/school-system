import { model, Schema } from 'mongoose'
import config from './../../../config/config'

const { ObjectId } = Schema.Types

const techLeadSchema = new Schema({
  fullName: { type: String, require: true },
  _id: { type: ObjectId, require: true }
}, {
  ...config.database.mongodb.schemaOptions,
  _id: false
})

const schema = new Schema({
  _id: { type: ObjectId },
  techLead: { type: techLeadSchema, require: true },
  name: { type: String, require: true },
  repository: { type: String },
  member: [{
    type: ObjectId,
    ref: 'user'
  }]
}, {
  ...config.database.mongodb.schemaOptions,
  collection: 'group'
})

export default model('group', schema)
