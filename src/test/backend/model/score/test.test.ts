import { IUser } from '../../../../backend/interface/user'
import model from '../../../../backend/model/score/model'
import userModel from './../../../../backend/model/user/model'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import scoreDbModel from '../../../../backend/database/schemas/node/score'
import { IEnv } from '../../../../backend/interface/env'
import userDbModel from './../../../../backend/database/schemas/node/user'

dotenv.config({ quiet: true })
const { DB_URL_ENV_TEST } = process.env as Pick<IEnv, 'DB_URL_ENV_TEST'>

let user: IUser

beforeAll(async () => {
  await mongoose.connect(DB_URL_ENV_TEST)
  user = await userModel.user.create({
    school: 'test school',
    fullName: 'test',
    account: 'test@gmail.com',
    pwd: 'test',
    role: ['student']
  }, ['Math', 'Science', 'History'])
})

afterAll(async () => {
  await scoreDbModel.deleteMany({})
  await userDbModel.deleteMany({})
  await mongoose.connection.close()
})

describe('score model', () => {
  describe('user', () => {
    test('newSemester', async () => {
      const res = await model.user.newSemester(user.account, ['Math', 'Science', 'History'])
      expect(res).toBe(true)
    })

    test('get', async () => {
      const res = await model.user.get(user.account, 1)
      expect(res).toStrictEqual({
        One: [
          {
            subject: 'Math',
            score: 0
          },
          {
            subject: 'Science',
            score: 0
          },
          {
            subject: 'History',
            score: 0
          }
        ],
        Two: [
          {
            subject: 'Math',
            score: 0
          },
          {
            subject: 'Science',
            score: 0
          },
          {
            subject: 'History',
            score: 0
          }
        ],
        Three: [
          {
            subject: 'Math',
            score: 0
          },
          {
            subject: 'Science',
            score: 0
          },
          {
            subject: 'History',
            score: 0
          }
        ]
      })
    })
  })
})
