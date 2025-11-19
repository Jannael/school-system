import config from '../../config/config'
import { NotFound } from '../../error/error'
import { IScore } from '../../interface/score'
import dbModel from './../../database/schemas/node/score'

const model = {
  user: {
    get: async function (account: string, semester: number): Promise<IScore> {
      const result = await dbModel.findOne({ account, semester }, { One: 1, Two: 1, Three: 1, _id: 0 }).lean()
      if (result === null) throw new NotFound('Score not found')
      return result
    },
    newSemester: async function (account: string, subject: string[]): Promise<boolean> {
      const subjectArray = subject.map((item) => ({ subject: item, score: 0 }))
      const nextSemester = await dbModel.countDocuments({ account }) + 1

      if (nextSemester > config.semester.total) return false

      await dbModel.insertOne({
        account,
        semester: nextSemester,
        One: subjectArray,
        Two: subjectArray,
        Three: subjectArray
      })

      return true
    }
  },
  teacher: {
    update: async function (account: string, semester: number, subject: string, score: number, part: 'One' | 'Two' | 'Three'): Promise<boolean> {
      const result = await dbModel.updateOne(
        { account, semester, [`${part}.subject`]: subject },
        { $set: { [`${part}.$.score`]: score } }
      )

      return result.modifiedCount > 0
    }
  }
}

export default model
