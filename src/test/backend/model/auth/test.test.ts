import userModel from './../../../../backend/model/user/model'
import model from './../../../../backend/model/auth/model'
import mongoose, { Types } from 'mongoose'
import dotenv from 'dotenv'
import dbModel from '../../../../backend/database/schemas/node/user'
import { IEnv } from '../../../../backend/interface/env'
import { IRefreshToken } from '../../../../backend/interface/user'
import { NotFound, UserBadRequest } from '../../../../backend/error/error'

dotenv.config({ quiet: true })
const { DB_URL_ENV_TEST } = process.env as Pick<IEnv, 'DB_URL_ENV_TEST'>

beforeAll(async () => {
  await mongoose.connect(DB_URL_ENV_TEST)
})

afterAll(async () => {
  await dbModel.deleteMany({})
  await mongoose.connection.close()
})

describe('auth model', () => {
  let user: IRefreshToken
  const notExistUser = '68de8beca3acccec4ac2fddb' as unknown as Types.ObjectId

  beforeAll(async () => {
    user = await userModel.create({
      fullName: 'test',
      account: 'test@email.com',
      pwd: 'test',
      nickName: 'test'
    })
  })

  describe('refreshToken', () => {
    describe('save', () => {
      test('', async () => {
        const res = await model.refreshToken.save('token', user._id)
        expect(res).toBe(true)
      })

      test('error', async () => {
        const func = [
          {
            fn: async function () {
              await model.refreshToken.save('', notExistUser)
            },
            error: new NotFound('User not found')
          }
        ]

        for (const { fn, error } of func) {
          try {
            await fn()
            throw new Error('Expected function to throw')
          } catch (err: any) {
            expect(err).toBeInstanceOf(error.constructor)
            expect(err.message).toBe(error.message)
            expect(err.description).toBe(error.description)
          }
        }
      })
    })

    describe('remove', () => {
      test('', async () => {
        const res = await model.refreshToken.remove('token', user._id)
        expect(res).toBe(true)
      })

      test('error', async () => {
        const func = [
          {
            fn: async function () {
              await model.refreshToken.remove('', notExistUser)
            },
            error: new NotFound('User not found')
          },
          {
            fn: async function () {
              await model.refreshToken.remove('', '' as unknown as Types.ObjectId)
            },
            error: new UserBadRequest('Invalid credentials', 'The _id is invalid')
          }
        ]

        for (const { fn, error } of func) {
          try {
            await fn()
            throw new Error('Expected function to throw')
          } catch (err: any) {
            expect(err).toBeInstanceOf(error.constructor)
            expect(err.message).toBe(error.message)
            expect(err.description).toBe(error.description)
          }
        }
      })
    })

    describe('verify', () => {
      test('', async () => {
      // first we save the token to verify it
        const save = await model.refreshToken.save('token', user._id)
        expect(save).toBe(true)

        const res = await model.refreshToken.verify('token', user._id)
        expect(res).toBe(true)

        await model.refreshToken.remove('token', user._id)
      })

      test('error', async () => {
        const func = [
          {
            fn: async function () {
              await model.refreshToken.verify('token', notExistUser)
            },
            error: new NotFound('User not found')
          },
          {
            fn: async function () {
              await model.refreshToken.verify('token', 'invalid' as unknown as Types.ObjectId)
            },
            error: new UserBadRequest('Invalid credentials', 'The _id is invalid')
          }
        ]

        for (const { fn, error } of func) {
          try {
            await fn()
            throw new Error('Expected function to throw')
          } catch (err: any) {
            expect(err).toBeInstanceOf(error.constructor)
            expect(err.message).toBe(error.message)
            expect(err.description).toBe(error.description)
          }
        }
      })
    })
  })

  describe('login', () => {
    test('', async () => {
      const res = await model.login(user.account, 'test')

      expect(res).toStrictEqual({
        _id: expect.any(Types.ObjectId),
        fullName: 'test',
        account: 'test@email.com',
        nickName: 'test'
      })
    })

    test('error', async () => {
      const func = [
        {
          fn: async function () {
            await model.login('account', 'pwd')
          },
          error: new UserBadRequest('Invalid credentials', 'The account must Match example@service.ext')
        },
        {
          fn: async function () {
            await model.login('account@gmail.com', 'pwd')
          },
          error: new NotFound('User not found')
        },
        {
          fn: async function () {
            await model.login('test@email.com', 'pwd')
          },
          error: new UserBadRequest('Invalid credentials', 'Incorrect password')
        }
      ]

      for (const { fn, error } of func) {
        try {
          await fn()
          throw new Error('Expected function to throw')
        } catch (err: any) {
          expect(err).toBeInstanceOf(error.constructor)
          expect(err.message).toBe(error.message)
          expect(err.description).toBe(error.description)
        }
      }
    })
  })

  describe('exists', () => {
    test('', async () => {
      const res = await model.exists(user.account)
      expect(res).toEqual(true)
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            await model.exists('notExists')
          },
          error: new NotFound('User not found')
        }
      ]

      for (const { fn, error } of cases) {
        try {
          await fn()
          throw new Error('Expected function to throw')
        } catch (err: any) {
          expect(err).toBeInstanceOf(error.constructor)
          expect(err.message).toBe(error.message)
          expect(err.description).toBe(error.description)
        }
      }
    })
  })
})
