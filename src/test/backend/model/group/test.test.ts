import { IRefreshToken } from '../../../../backend/interface/user'
import model from './../../../../backend/model/group/model'
import userModel from './../../../../backend/model/user/model'

import dotenv from 'dotenv'
import mongoose, { Types } from 'mongoose'
import dbModel from './../../../../backend/database/schemas/node/group'
import { IEnv } from '../../../../backend/interface/env'
import userDbModel from './../../../../backend/database/schemas/node/user'
import { IGroup } from '../../../../backend/interface/group'
import { Forbidden, NotFound } from '../../../../backend/error/error'

dotenv.config({ quiet: true })
const { DB_URL_ENV_TEST } = process.env as Pick<IEnv, 'DB_URL_ENV_TEST'>

beforeAll(async () => {
  await mongoose.connect(DB_URL_ENV_TEST)
})

afterAll(async () => {
  await dbModel.deleteMany({})
  await userDbModel.deleteMany({})
  await mongoose.connection.close()
})

let user: IRefreshToken
let group: IGroup
let secondUser: IRefreshToken
let secondGroup: IGroup
const users: IRefreshToken[] = []

beforeAll(async () => {
  for (let i = 0; i < 5; i++) {
    const user = await userModel.create({
      fullName: 'test',
      account: `test-${i}@gmail.com`,
      pwd: 'test',
      nickName: 'test'
    })
    users.push(user)
  }

  user = await userModel.create({
    fullName: 'test',
    account: 'test@gmail.com',
    pwd: 'test',
    nickName: 'test'
  })

  secondUser = await userModel.create({
    fullName: 'test',
    account: 'secondUser@gmail.com',
    pwd: 'test',
    nickName: 'test'
  })

  secondGroup = await model.create({
    name: 'test',
    color: '#000000'
  }, { account: user.account, fullName: user.fullName })
})

describe('group model', () => {
  describe('create', () => {
    test('', async () => {
      const res = await model.create({
        name: 'test',
        color: '#000000'
      }, { account: user.account, fullName: user.fullName })

      group = res

      expect(res).toStrictEqual({
        name: 'test',
        color: '#000000',
        _id: expect.any(Types.ObjectId)
      })
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            await model.create(group, { fullName: 'name', account: 'notFound@gmail.com' })
          },
          error: new NotFound('User not found')
        },
        {
          fn: async function () {
            for (let i = 0; i < 5; i++) {
              await model.create({
                name: 'test',
                color: '#000000'
              }, { account: user.account, fullName: user.fullName })
            }
          },
          error: new Forbidden('Access denied', 'The user has reached the max number of groups')
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

  describe('exists', () => {
    test('', async () => {
      const res = await model.exists(group._id, user.account)
      expect(res).toEqual(true)
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            await model.exists(group._id, 'notExist@gmail.com')
          },
          error: new Forbidden('Access denied', 'The group exists but the user is not a techLead')
        },
        {
          fn: async function () {
            await model.exists(new mongoose.Types.ObjectId(), user.account)
          },
          error: new NotFound('Group not found', 'The group you are trying to access does not exist')
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

  describe('get', () => {
    test('', async () => {
      const res = await model.get(group._id)
      expect(res).toStrictEqual({
        _id: expect.any(Types.ObjectId),
        name: 'test',
        color: '#000000'
      })
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            await model.get(new mongoose.Types.ObjectId())
          },
          error: new NotFound('Group not found', 'The group you are trying to access does not exist')
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

  describe('update', () => {
    test('', async () => {
      const res = await model.update(user._id, group._id, { color: '#111111' })
      expect(res).toStrictEqual({
        _id: expect.any(Types.ObjectId),
        name: 'test',
        color: '#111111'
      })

      const guard = await model.get(group._id)
      expect(guard).toStrictEqual({
        _id: expect.any(Types.ObjectId),
        name: 'test',
        color: '#111111'
      })
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            await model.update(new mongoose.Types.ObjectId(), group._id, { name: 'test' })
          },
          error: new NotFound('User not found')
        },
        {
          fn: async function () {
            await model.update(user._id, new mongoose.Types.ObjectId(), { name: 'test' })
          },
          error: new NotFound('Group not found')
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

  describe('member', () => {
    describe('add', () => {
      test('', async () => {
        const res = await model.member.add(group._id, {
          account: secondUser.account,
          fullName: secondUser.account,
          role: 'documenter'
        })
        expect(res).toEqual(true)
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              for (const el of users.entries()) {
                await model.member.add(group._id, {
                  account: el[1].account,
                  fullName: el[1].account,
                  role: 'documenter'
                })
              }
            },
            error: new Forbidden('Access denied', 'The group has reached the max number of members')
          },
          {
            fn: async function () {
              const { account, fullName } = user
              await model.member.add(new mongoose.Types.ObjectId(), { account, fullName, role: 'documenter' })
            },
            error: new NotFound('Group not found', 'The group you are trying to access was not found')
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

    describe('update', () => {
      test('', async () => {
        const res = await model.member.update(group._id,
          { fullName: user.fullName, account: user.account },
          { fullName: 'newFullName', account: user.account }
        )

        expect(res).toEqual(true)
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              await model.member.update(new mongoose.Types.ObjectId(),
                { fullName: user.fullName, account: user.account },
                { fullName: 'newFullName', account: user.account }
              )
            },
            error: new NotFound('Group not found')
          },
          {
            fn: async function () {
              await model.member.update(group._id,
                { fullName: 'notExists', account: 'NotExists' },
                { fullName: 'newFullName', account: user.account }
              )
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

    describe('remove', () => {
      test('', async () => {
        const res = await model.member.remove(group._id, secondUser.account)
        expect(res).toEqual(true)
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              await model.member.remove(group._id, user.account)
            },
            error: new Forbidden('Access denied', 'You can not remove the last techLead')
          },
          {
            fn: async function () {
              await model.member.remove(new mongoose.Types.ObjectId(), user.account)
            },
            error: new NotFound('Group not found', 'The group was not found')
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

  describe('delete', () => {
    test('', async () => {
      const res = await model.delete(user.account, group._id)
      expect(res).toEqual(true)
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            await model.delete(secondUser.account, secondGroup._id)
          },
          error: new Forbidden('Access denied', 'Only tech leads can delete a group')
        },
        {
          fn: async function () {
            await model.delete(user.account, new mongoose.Types.ObjectId())
          },
          error: new NotFound('Group not found', 'The group you are trying to delete does not exist')
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
