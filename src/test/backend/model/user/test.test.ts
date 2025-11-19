import { DuplicateData, NotFound, UserBadRequest } from '../../../../backend/error/error'
import { IEnv } from '../../../../backend/interface/env'
import { IRefreshToken, IUser } from '../../../../backend/interface/user'
import model from '../../../../backend/model/user/model'
import dbModel from './../../../../backend/database/schemas/node/user'
import dotenv from 'dotenv'
import mongoose, { Types } from 'mongoose'

dotenv.config({ quiet: true })
const { DB_URL_ENV_TEST } = process.env as Pick<IEnv, 'DB_URL_ENV_TEST'>

beforeAll(async () => {
  await mongoose.connect(DB_URL_ENV_TEST)
})

afterAll(async () => {
  await dbModel.deleteMany({})
  await mongoose.connection.close()
})

describe('user model', () => {
  let userId: Types.ObjectId
  let user: IRefreshToken
  const notExistUser = '68de8beca3acccec4ac2fddb' as unknown as Types.ObjectId

  describe('create user', () => {
    test('', async () => {
      const res = await model.user.create({
        school: 'test school',
        fullName: 'test',
        account: 'test@gmail.com',
        pwd: 'test',
        role: ['student']
      })

      userId = res._id
      user = res

      expect(res).toStrictEqual({
        _id: expect.any(Types.ObjectId),
        fullName: 'test',
        account: 'test@gmail.com',
        role: ['student'],
        school: 'test school'
      })
    })

    test('error', async () => {
      const func = [
        {
          fn: async function () {
            await model.user.create({
              fullName: 'test',
              account: 'test@gmail.com',
              pwd: 'test',
              role: ['student'],
              school: 'test school'
            })
          },
          error: new DuplicateData('User already exists', 'This account belongs to an existing user')
        },
        {
          fn: async function () {
            const obj = {
              account: 'test1@gmail.com',
              pwd: 'test1',
              role: ['student']
            } as unknown as IUser

            await model.user.create(obj)
          },
          error: new UserBadRequest('Invalid credentials', 'School is required')
        },
        {
          fn: async function () {
            const obj = {
              _id: '' as unknown as Types.ObjectId,
              refreshToken: ['hello Dexter Morgan'],
              fullName: 'test',
              account: 'test@gmail.com',
              pwd: 'test',
              role: ['student'],
              school: 'test school'
            }

            await model.user.create(obj)
          },
          error: new UserBadRequest('Invalid credentials', 'You can not put the _id yourself')
        },
        {
          fn: async function () {
            const obj = {
              refreshToken: ['hello Dexter Morgan'],
              fullName: 'test',
              account: 'test@gmail.com',
              pwd: 'test',
              role: ['student'],
              school: 'test school'
            }

            await model.user.create(obj)
          },
          error: new UserBadRequest('Invalid credentials', 'You can not put the refreshToken yourself')
        },
        {
          fn: async function () {
            const obj = {
              fullName: 'test',
              account: 'test',
              pwd: 'test',
              role: ['student'],
              school: 'test school'
            }

            await model.user.create(obj)
          },
          error: new UserBadRequest('Invalid credentials', 'Invalid email address')
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

  describe('update user', () => {
    test('', async () => {
      const res = await model.user.update({
        fullName: 'test1'
      }, userId)

      expect(res).toStrictEqual({
        _id: expect.any(Types.ObjectId),
        account: 'test@gmail.com',
        fullName: 'test1',
        role: ['student'],
        school: 'test school'
      })
    })

    test('error', async () => {
      const func = [
        {
          fn: async function () {
            await model.user.update({ }, notExistUser)
          },
          error: new NotFound('User not found')
        },
        {
          fn: async function () {
            await model.user.update({ account: 'test' }, userId)
          },
          error: new UserBadRequest('Invalid credentials', 'You can not update the account here')
        },
        {
          fn: async function () {
            await model.user.update({ _id: notExistUser }, userId)
          },
          error: new UserBadRequest('Invalid credentials', 'You can not change the _id')
        },
        {
          fn: async function () {
            await model.user.update({ refreshToken: ['hello Dexter Morgan'] }, userId)
          },
          error: new UserBadRequest('Invalid credentials', 'You can not update the refreshToken')
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

  describe('update user account', () => {
    test('', async () => {
      const res = await model.user.account.update(userId, 'test2@gmail.com')
      user = res

      expect(res).toStrictEqual({
        _id: expect.any(Types.ObjectId),
        fullName: 'test1',
        account: 'test2@gmail.com',
        role: ['student'],
        school: 'test school'
      })
    })

    test('error', async () => {
      const func = [
        {
          fn: async function () {
            await model.user.account.update(notExistUser, 'test@gmail.com')
          },
          error: new NotFound('User not found')
        },
        {
          fn: async function () {
            await model.user.account.update(userId, 'test')
          },
          error: new UserBadRequest('Invalid credentials', 'The account must match example@service.ext')
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

  describe('update user password', () => {
    test('', async () => {
      const res = await model.user.password.update(user.account, 'newPassword')
      expect(res).toEqual(true)
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            await model.user.password.update('test', 'test')
          },
          error: new UserBadRequest('Invalid credentials', 'The account must match example@service.ext')
        },
        {
          fn: async function () {
            await model.user.password.update('helloDexterMorgan@gmail.com.mx', 'test')
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

  describe('delete user', () => {
    test('', async () => {
      const res = await model.user.delete(userId)

      expect(res).toBe(true)
    })

    test('error', async () => {
      const func = [
        {
          fn: async function () {
            await model.user.delete(notExistUser)
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
})
