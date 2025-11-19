import { model, Schema } from 'mongoose'
import config from '../../../config/config'
import { IScore } from '../../../interface/score'

const partialSchema = new Schema({
  subject: { type: String, required: true },
  score: { type: Number, required: true }
})

const schema = new Schema({
  account: { type: String, required: true },
  semester: { type: String, required: true },
  One: [partialSchema],
  Two: [partialSchema],
  Three: [partialSchema]
}, {
  ...config.database.mongodb.schemaOptions,
  collection: 'score'
})

export default model<IScore>('score', schema)
