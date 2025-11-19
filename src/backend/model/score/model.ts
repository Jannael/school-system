import { NotFound } from '../../error/error'
import dbModel from './../../database/schemas/node/score'

const model = {
  user: {
    get: async function (account: string, semester: number) {
      const result = await dbModel.findOne({ account, semester }, { One: 1, Two: 1, Three: 1, _id: 0 }).lean()
      if (result === null) throw new NotFound('Score not found')
      return result
    }
  }
}

export default model
