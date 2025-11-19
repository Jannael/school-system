import express from 'express'
import cookieParser from 'cookie-parser'
import router from './../backend/routes/merge'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { IEnv } from './interface/env'
import middleware from './middleware/merge'
import cors from 'cors'

dotenv.config({ quiet: true })

const { DB_URL_ENV } = process.env as Pick<IEnv, 'DB_URL_ENV'>

export async function createApp (): Promise<express.Express> {
  await mongoose.connect(DB_URL_ENV)
    .then(() => console.log('connected to mongoose'))
    .catch(e => console.error('something went wrong connecting to mongoose', e))

  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(cookieParser())
  app.use(middleware.header)

  app.use('/auth/v1/', router.auth)
  app.use('/user/v1/', router.user)
  app.use('/utils/v1/', router.utils)
  app.use('/score/v1/', router.score)

  return app
}
