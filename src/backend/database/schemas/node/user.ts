import { model, Schema } from 'mongoose'
import config from '../../../config/config'

const schema = new Schema({
  school: { type: String, required: true },
  fullName: { type: String, required: true },
  account: { type: String, required: true, unique: true },
  pwd: { type: String, required: true },
  role: [{ type: String }],
  refreshToken: [{ type: String }]
}, {
  ...config.database.mongodb.schemaOptions,
  collection: 'user'
})

export default model('user', schema)
