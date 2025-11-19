import { createApp } from '../../../../backend/app'
import { Express } from 'express'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { IEnv } from '../../../../backend/interface/env'
import userModel from './../../../../backend/model/user/model'
import { IRefreshToken } from '../../../../backend/interface/user'
import dbModel from './../../../../backend/database/schemas/node/user'
import scoreDbModel from '../../../../backend/database/schemas/node/score'

dotenv.config({ quiet: true })
const { TEST_PWD_ENV } = process.env as unknown as IEnv

let app: Express
let agent: ReturnType<typeof request.agent>
let user: IRefreshToken

beforeAll(async () => {
  app = await createApp()
  agent = await request.agent(app)

  user = await userModel.user.create({
    fullName: 'test',
    account: 'test@gmail.com',
    pwd: 'test',
    role: ['student'],
    school: 'test school'
  }, ['Math', 'Science', 'History'])
})

afterAll(async () => {
  await scoreDbModel.deleteMany({})
  await dbModel.deleteMany({})
  await mongoose.connection.close()
})

describe('/user/v1/', () => {
  const path = '/user/v1'
  beforeAll(async () => {
    await agent
      .post('/auth/v1/request/refreshToken/code/')
      .send({
        account: user.account,
        pwd: 'test',
        TEST_PWD: TEST_PWD_ENV
      })
    await agent
      .post('/auth/v1/request/refreshToken/')
      .send({
        code: '1234'
      })
  })

  describe('/get/', () => {
    const endpoint = path + '/get/'
    test('', async () => {
      const res = await agent
        .get(endpoint)

      expect(res.body).toStrictEqual({
        fullName: 'test',
        account: 'test@gmail.com',
        role: ['student'],
        school: 'test school',
        complete: true
      })
    })

    test('error', async () => {
      const func = [
        {
          fn: async function () {
            return await request(app)
              .get(endpoint)
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'Missing accessToken',
            complete: false
          }
        }
      ]

      for (const { fn, error } of func) {
        const res = await fn()

        expect(res.statusCode).toEqual(error.code)
        expect(res.body.msg).toEqual(error.msg)
        expect(res.body.complete).toEqual(error.complete)
        expect(res.body.description).toEqual(error.description)
        expect(res.body.link).toEqual([
          { rel: 'get accessToken', href: '/auth/v1/request/accessToken/' }
        ])
      }
    })
  })

  describe('/create/', () => {
    const endpoint = path + '/create/'
    test('', async () => {
      const agent = request.agent(app)

      await agent
        .post('/auth/v1/request/code/')
        .send({
          account: 'create@gmail.com',
          TEST_PWD: TEST_PWD_ENV
        })

      await agent
        .post('/auth/v1/verify/code')
        .send({
          account: 'create@gmail.com',
          code: '1234'
        })

      const res = await agent
        .post(endpoint)
        .send({
          fullName: 'test',
          account: 'create@gmail.com',
          pwd: '123456',
          role: ['student'],
          school: 'test school',
          subject: ['Math', 'Science']
        })

      expect(res.body).toStrictEqual({
        fullName: 'test',
        account: 'create@gmail.com',
        role: ['student'],
        complete: true,
        school: 'test school'
      })

      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=.*HttpOnly$/)
      expect(res.headers['set-cookie'][1]).toMatch(/accessToken=.*HttpOnly$/)
      expect(res.headers['set-cookie'][2]).toMatch(/account=.*GMT$/)
      expect(res.statusCode).toEqual(201)
    })

    test('error', async () => {
      const func = [
        {
          fn: async function () {
            return await request(app)
              .post(endpoint)
              .set('Cookie', ['account=value'])
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'Account not verified',
            complete: false
          }
        },
        {
          fn: async function () {
            return await request(app)
              .post(endpoint)
              .send({
                user: 'test',
                subject: ['Math', 'Science']
              })
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'Account not verified',
            complete: false
          }
        },
        {
          fn: async function () {
            return await request(app)
              .post(endpoint)
              .set('Cookie', ['account=value'])
              .send({
                user: 'test',
                subject: ['Math', 'Science']
              })
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'The token is invalid',
            complete: false
          }
        },
        {
          fn: async function () {
            const agent = request.agent(app)
            await agent
              .post('/auth/v1/request/code/')
              .send({
                account: 'create1@gmail.com',
                TEST_PWD: TEST_PWD_ENV
              })

            await agent
              .post('/auth/v1/verify/code')
              .send({
                account: 'create1@gmail.com',
                code: '1234'
              })

            return await agent
              .post(endpoint)
              .send({
                fullName: 'test',
                account: 'create@gmail.com',
                pwd: '123456',
                role: ['student'],
                subject: ['Math', 'Science']
              })
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'Verified account does not match the sent account',
            complete: false
          }
        },
        {
          fn: async function () {
            const agent = request.agent(app)
            await agent
              .post('/auth/v1/request/code/')
              .send({
                account: 'create1@gmail.com',
                TEST_PWD: TEST_PWD_ENV
              })

            await agent
              .post('/auth/v1/verify/code')
              .send({
                account: 'create1@gmail.com',
                code: '1234'
              })

            return await agent
              .post(endpoint)
              .send({
                account: 'create1@gmail.com',
                school: 'test school',
                pwd: '123456',
                role: ['student'],
                subject: ['Math', 'Science']
              })
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'FullName is required',
            complete: false
          }
        }
      ]

      for (const { fn, error } of func) {
        const res = await fn()

        expect(res.statusCode).toEqual(error.code)
        expect(res.body.msg).toEqual(error.msg)
        expect(res.body.complete).toEqual(error.complete)
        expect(res.body.description).toEqual(error.description)
        expect(res.body.link).toEqual([
          { rel: 'code', href: '/auth/v1/request/code/' },
          { rel: 'code', href: '/auth/v1/verify/code/' }
        ])
      }
    })
  })

  describe('/update/', () => {
    const endpoint = path + '/update/'
    test('', async () => {
      await agent
        .post('/auth/v1/request/code/')
        .send({
          account: user.account,
          TEST_PWD: TEST_PWD_ENV
        })

      await agent
        .post('/auth/v1/verify/code')
        .send({
          account: user.account,
          code: '1234'
        })

      const res = await agent
        .put(endpoint)
        .send({
          fullName: 'new Name'
        })

      user.fullName = 'new Name'

      expect(res.body.complete).toEqual(true)
      expect(res.body.user).toStrictEqual({
        fullName: 'new Name',
        account: 'test@gmail.com',
        role: ['student'],
        school: 'test school'
      })
      expect(res.headers['set-cookie'][2]).toMatch(/account=.*GMT$/)

      const secure = await agent
        .get(path + '/get/')

      expect(secure.body).toStrictEqual({
        fullName: 'new Name',
        account: 'test@gmail.com',
        role: ['student'],
        complete: true,
        school: 'test school'
      })

      user = res.body.user
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            return await request(app)
              .put(endpoint)
          },
          error: {
            code: 400,
            msg: 'Missing data',
            description: 'The\'res missing credentials, make sure to get them before update',
            complete: false
          }
        },
        {
          fn: async function () {
            await agent
              .post('/auth/v1/request/code/')
              .send({
                account: 'test0@gmail.com',
                TEST_PWD: TEST_PWD_ENV
              })

            await agent
              .post('/auth/v1/verify/code')
              .send({
                account: 'test0@gmail.com',
                code: '1234'
              })

            return await agent
              .put(endpoint)
              .send({
                fullName: 'second new names'
              })
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'The account verified and your account does not match',
            complete: false
          }
        },
        {
          fn: async function () {
            await agent
              .post('/auth/v1/request/code/')
              .send({
                account: user.account,
                TEST_PWD: TEST_PWD_ENV
              })

            await agent
              .post('/auth/v1/verify/code')
              .send({
                account: user.account,
                code: '1234'
              })

            return await agent
              .put(endpoint)
          },
          error: {
            code: 400,
            msg: 'Missing data',
            description: 'No data to update or invalid data',
            complete: false
          }
        }
      ]

      for (const { fn, error } of cases) {
        const res = await fn()
        expect(res.statusCode).toEqual(error.code)
        expect(res.body.msg).toEqual(error.msg)
        expect(res.body.complete).toEqual(error.complete)
        expect(res.body.description).toEqual(error.description)
        expect(res.body.link).toEqual([
          { rel: 'code', href: '/auth/v1/request/code/' },
          { rel: 'code', href: '/auth/v1/verify/code/' }
        ])
      }
    })
  })

  describe('/update/account/', () => {
    const endpoint = path + '/update/account/'

    test('', async () => {
      await agent
        .patch('/auth/v1/account/request/code/')
        .send({
          newAccount: 'test1@gmail.com',
          TEST_PWD: TEST_PWD_ENV
        })

      await agent
        .patch('/auth/v1/account/verify/code/')
        .send({
          codeCurrentAccount: '1234',
          codeNewAccount: '1234'
        })

      const res = await agent
        .patch(endpoint)

      expect(res.body.complete).toEqual(true)
      expect(res.body.user).toStrictEqual({
        fullName: 'new Name',
        account: 'test1@gmail.com',
        role: ['student'],
        school: 'test school'
      })
      expect(res.headers['set-cookie'][2]).toMatch(/newAccount_account=.*GMT$/)

      user = res.body.user

      const secure = await agent
        .get('/user/v1/get/')

      expect(secure.body).toStrictEqual({
        fullName: 'new Name',
        account: 'test1@gmail.com',
        role: ['student'],
        complete: true,
        school: 'test school'
      })
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            return await request(app)
              .patch(endpoint)
          },
          error: {
            code: 400,
            msg: 'Missing data',
            description: 'Make sure to follow the auth flow for this operation',
            complete: false
          }
        }
      ]

      for (const { fn, error } of cases) {
        const res = await fn()

        expect(res.statusCode).toEqual(error.code)
        expect(res.body.msg).toEqual(error.msg)
        expect(res.body.complete).toEqual(error.complete)
        expect(res.body.description).toEqual(error.description)
        expect(res.body.link).toStrictEqual([
          { rel: 'code', href: '/auth/v1/account/request/code/' },
          { rel: 'code', href: '/auth/v1/account/verify/code/' }
        ])
      }
    })
  })

  describe('/update/password/', () => {
    const endpoint = path + '/update/password/'
    test('', async () => {
      await agent
        .patch('/auth/v1/password/request/code')
        .send({
          account: user.account,
          TEST_PWD: TEST_PWD_ENV
        })

      await agent
        .patch('/auth/v1/password/verify/code/')
        .send({
          code: '1234',
          account: user.account,
          newPwd: 'insane pwd'
        })

      const res = await agent
        .patch(endpoint)

      expect(res.body.complete).toEqual(true)
      expect(res.headers['set-cookie'][0]).toMatch(/newPwd=.*GMT$/)
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            return await request(app)
              .patch(endpoint)
          },
          error: {
            code: 400,
            msg: 'Missing data',
            description: 'Make sure to follow the auth flow for this operation',
            complete: false
          }
        }
      ]

      for (const { fn, error } of cases) {
        const res = await fn()
        expect(res.statusCode).toEqual(error.code)
        expect(res.body.msg).toEqual(error.msg)
        expect(res.body.complete).toEqual(error.complete)
        expect(res.body.description).toEqual(error.description)
        expect(res.body.link).toStrictEqual([
          { rel: 'code', href: '/auth/v1/password/request/code/' },
          { rel: 'verify', href: '/auth/v1/password/verify/code/' }
        ])
      }
    })
  })

  describe('/delete/', () => {
    const endpoint = path + '/delete/'
    test('', async () => {
      await agent
        .post('/auth/v1/request/code/')
        .send({
          account: user.account,
          TEST_PWD: TEST_PWD_ENV
        })

      await agent
        .post('/auth/v1/verify/code')
        .send({
          account: user.account,
          code: '1234'
        })

      const res = await agent
        .delete(endpoint)

      expect(res.body.complete).toEqual(true)
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=.*GMT$/)
      expect(res.headers['set-cookie'][1]).toMatch(/accessToken=.*GMT$/)
      expect(res.headers['set-cookie'][2]).toMatch(/account=.*GMT$/)
    })

    test('error', async () => {
      const cases = [
        {
          fn: async function () {
            return await request(app)
              .delete(endpoint)
          },
          error: {
            code: 400,
            msg: 'Missing data',
            description: 'Account not verified',
            complete: false
          }
        },
        {
          fn: async function () {
            const agent = request.agent(app)
            user = await userModel.user.create({
              fullName: 'test',
              account: 'testDelete@gmail.com',
              pwd: 'test',
              role: ['student'],
              school: 'test school'
            }, ['Math', 'Science', 'History'])

            await agent
              .post('/auth/v1/request/refreshToken/code/')
              .send({
                account: user.account,
                pwd: 'test',
                TEST_PWD: TEST_PWD_ENV
              })

            await agent
              .post('/auth/v1/request/refreshToken/')
              .send({
                code: '1234'
              })

            await agent
              .post('/auth/v1/request/code/')
              .send({
                account: 'delete@gmail.com',
                TEST_PWD: TEST_PWD_ENV
              })

            await agent
              .post('/auth/v1/verify/code')
              .send({
                account: 'delete@gmail.com',
                code: '1234'
              })

            return await agent
              .delete(endpoint)
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'The verified account and yours does not match',
            complete: false
          }
        }
      ]

      for (const { fn, error } of cases) {
        const res = await fn()
        expect(res.statusCode).toEqual(error.code)
        expect(res.body.msg).toEqual(error.msg)
        expect(res.body.complete).toEqual(error.complete)
        expect(res.body.description).toEqual(error.description)
        expect(res.body.link).toEqual([
          { rel: 'code', href: '/auth/v1/request/code/' },
          { rel: 'code', href: '/auth/v1/verify/code/' }
        ])
      }
    })
  })
})
