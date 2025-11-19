import { createApp } from '../../../../backend/app'
import { Express } from 'express'
import request from 'supertest'
import mongoose from 'mongoose'
import userModel from './../../../../backend/model/user/model'
import { IRefreshToken } from '../../../../backend/interface/user'
import dbModel from './../../../../backend/database/schemas/node/user'
import scoreDbModel from '../../../../backend/database/schemas/node/score'

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
