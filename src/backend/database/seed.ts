import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { IEnv } from '../interface/env'

dotenv.config({ quiet: true })
const { DB_URL_ENV } = process.env as Pick<IEnv, 'DB_URL_ENV'>

async function seed (): Promise<void> {
  await mongoose.connect(DB_URL_ENV)
}

seed()
  .catch(e => console.error(e))
