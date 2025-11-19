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

afterAll(async () => {
  await scoreDbModel.deleteMany({})
  await dbModel.deleteMany({})
  await mongoose.connection.close()
})

describe('/score/v1', () => {
  test('/get/', async () => {
    const res = await agent
      .get('/score/v1/get/1')

    expect(res.status).toBe(200)
    expect(res.body.complete).toBe(true)
    expect(res.body.result).toBeDefined()
  })

  test('/newSemester/', async () => {
    const res = await agent
      .post('/score/v1/newSemester/')
      .send({
        subject: ['Art', 'Physical Education']
      })
    expect(res.status).toBe(200)
    expect(res.body.complete).toBe(true)
  })
})
