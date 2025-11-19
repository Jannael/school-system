import { createApp } from '../../../../backend/app'
import { Express } from 'express'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { IEnv } from '../../../../backend/interface/env'
import userModel from './../../../../backend/model/user/model'
import { IRefreshToken } from '../../../../backend/interface/user'
import dbModel from './../../../../backend/database/schemas/node/user'
import { IGroup } from '../../../../backend/interface/group'
import groupModel from '../../../../backend/model/group/model'

dotenv.config({ quiet: true })
const { TEST_PWD_ENV } = process.env as unknown as IEnv

let app: Express
let agent: ReturnType<typeof request.agent>
let user: IRefreshToken
let group: IGroup
let secondUser: IRefreshToken

beforeAll(async () => {
  app = await createApp()
  agent = await request.agent(app)

  user = await userModel.create({
    fullName: 'test',
    account: 'test@gmail.com',
    pwd: 'test',
    nickName: 'test'
  })

  secondUser = await userModel.create({
    fullName: 'second test',
    account: 'secondUser@gmail.com',
    pwd: 'test',
    nickName: 'second test'
  })

  group = await groupModel.create({
    name: 'test',
    color: '#000000'
  }, { account: user.account, fullName: user.fullName })
})

afterAll(async () => {
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
        nickName: 'test',
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
            msg: 'Missing data',
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
          nickName: 'test'
        })
      expect(res.body).toStrictEqual({
        fullName: 'test',
        account: 'create@gmail.com',
        nickName: 'test',
        complete: true
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
            msg: 'Missing data',
            description: 'You did not send any information',
            complete: false
          }
        },
        {
          fn: async function () {
            return await request(app)
              .post(endpoint)
              .send({
                user: 'test'
              })
          },
          error: {
            code: 400,
            msg: 'Missing data',
            description: 'Missing account',
            complete: false
          }
        },
        {
          fn: async function () {
            return await request(app)
              .post(endpoint)
              .set('Cookie', ['account=value'])
              .send({
                user: 'test'
              })
          },
          error: {
            code: 400,
            msg: 'Invalid credentials',
            description: 'The account is invalid',
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
                nickName: 'test'
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
                pwd: '123456',
                nickName: 'test'
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
        nickName: 'test'
      })
      expect(res.headers['set-cookie'][2]).toMatch(/account=.*GMT$/)

      const secure = await agent
        .get(path + '/get/')

      expect(secure.body).toStrictEqual({
        fullName: 'new Name',
        account: 'test@gmail.com',
        nickName: 'test',
        complete: true
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
            description: 'Missing account',
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
            msg: 'Invalid credentials',
            description: 'Invalid input: expected object, received undefined',
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
        nickName: 'test'
      })
      expect(res.headers['set-cookie'][2]).toMatch(/newAccount_account=.*GMT$/)

      user = res.body.user

      const secure = await agent
        .get('/user/v1/get/')

      expect(secure.body).toStrictEqual({
        fullName: 'new Name',
        account: 'test1@gmail.com',
        nickName: 'test',
        complete: true
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
            description: 'Missing accessToken',
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
            description: 'Missing newPwd',
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

  describe('/invitation/', () => {
    describe('/create/invitation/', () => {
      const endpoint = path + '/create/invitation/'
      test('', async () => {
        const res = await agent
          .post(endpoint)
          .send({
            account: secondUser.account,
            role: 'techLead',
            _id: group._id
          })

        expect(res.body.complete).toEqual(true)
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              return await agent
                .post(endpoint)
                .send({
                  account: user.account,
                  role: 'techLead',
                  _id: group._id
                })
            },
            error: {
              code: 403,
              msg: 'Access denied',
              description: 'You can not invite yourself to one group',
              complete: false
            }
          },
          {
            fn: async function () {
              return await agent
                .post(endpoint)
                .send({
                  account: secondUser.account,
                  role: 'techLead'
                })
            },
            error: {
              code: 400,
              msg: 'Missing data',
              description: 'You need to send the _id for the group, account to invite and role',
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
        }
      })
    })

    describe('/get/invitation/', () => {
      const endpoint = path + '/get/invitation/'
      test('', async () => {
        const agent = request.agent(app)
        await agent
          .post('/auth/v1/request/refreshToken/code/')
          .send({
            account: secondUser.account,
            pwd: 'test',
            TEST_PWD: TEST_PWD_ENV
          })
        await agent
          .post('/auth/v1/request/refreshToken/')
          .send({
            code: '1234'
          })

        const res = await agent
          .get(endpoint)

        expect(res.body).toStrictEqual({
          complete: true,
          invitation: [
            { name: 'test', _id: expect.any(String), color: '#000000' }
          ]
        })
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              return await request(app)
                .get(endpoint)
            },
            error: {
              code: 400,
              msg: 'Missing data',
              description: 'Missing accessToken',
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
        }
      })
    })

    describe('/reject/invitation/', () => {
      const endpoint = path + '/reject/invitation/'
      test('', async () => {
        const agent = request.agent(app)
        await agent
          .post('/auth/v1/request/refreshToken/code/')
          .send({
            account: secondUser.account,
            pwd: 'test',
            TEST_PWD: TEST_PWD_ENV
          })
        await agent
          .post('/auth/v1/request/refreshToken/')
          .send({
            code: '1234'
          })

        const res = await agent
          .delete(endpoint)
          .send({
            _id: group._id
          })

        expect(res.body.complete).toEqual(true)
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
              description: 'You did not send the _id for the invitation you want to reject',
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
        }
      })
    })
  })

  describe('/group/', () => {
    describe('/get/group/', () => {
      const endpoint = path + '/get/group/'
      test('', async () => {
        const res = await agent
          .get(endpoint)

        expect(res.body).toStrictEqual({
          complete: true,
          group: [
            { name: 'test', _id: expect.any(String), color: '#000000' }
          ]
        })
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              return await request(app)
                .get(endpoint)
            },
            error: {
              code: 400,
              msg: 'Missing data',
              description: 'Missing accessToken',
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
        }
      })
    })

    describe('/delete/group/', () => {
      const endpoint = path + '/delete/group/'
      test('', async () => {
        await agent
          .post(path + '/create/invitation/')
          .send({
            account: secondUser.account,
            role: 'techLead',
            _id: group._id
          })

        const res = await agent
          .delete(endpoint)
          .send({
            _id: group._id
          })

        expect(res.body.complete).toEqual(true)

        const guard = await agent
          .get(path + '/get/group/')

        expect(guard.body).toStrictEqual({ complete: true, group: [] })
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              return await agent
                .delete(endpoint)
            },
            error: {
              code: 400,
              msg: 'Missing data',
              description: 'You did not send the _id for the group you want to remove',
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
        }
      })
    })

    describe('/add/group/', () => {
      const endpoint = path + '/add/group/'
      test('', async () => {
        const res = await agent
          .post(endpoint)
          .send({
            _id: group._id
          })
        expect(res.body.complete).toEqual(true)

        const guard = await agent
          .get(path + '/get/group/')

        expect(guard.body).toStrictEqual({
          complete: true,
          group: [
            { name: 'test', _id: expect.any(String), color: '#000000' }
          ]
        })
      })

      test('error', async () => {
        const cases = [
          {
            fn: async function () {
              return await agent
                .post(endpoint)
            },
            error: {
              code: 400,
              msg: 'Missing data',
              description: 'You did not send the _id for the group you want to add',
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
        }
      })
    })
  })

  describe('/delete/', () => {
    const endpoint = path + '/delete/'
    test('', async () => {
      await agent
        .post(path + '/create/invitation/')
        .send({
          account: secondUser.account,
          role: 'techLead',
          _id: group._id
        })

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
            description: 'Missing accessToken',
            complete: false
          }
        },
        {
          fn: async function () {
            const agent = request.agent(app)

            user = await userModel.create({
              fullName: 'test',
              account: 'test@gmail.com',
              pwd: 'test',
              nickName: 'test'
            })

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
