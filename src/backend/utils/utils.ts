import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { IEnv } from '../interface/env'
import { ServerError, UserBadRequest } from '../error/error'
import crypto from 'node:crypto'

dotenv.config({ quiet: true })
const { EMAIL_ENV, PASSWORD_ENV, TEST_PWD_ENV } = process.env as Pick<IEnv,
'EMAIL_ENV' | 'PASSWORD_ENV' | 'TEST_PWD_ENV'>

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_ENV,
    pass: PASSWORD_ENV
  }
})

export function verifyEmail (email: string): boolean {
  const rgx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!rgx.test(email)) {
    return false
  }
  return true
}

export function generateCode (testPwd?: string): string {
  if (testPwd === TEST_PWD_ENV) { return '1234' }
  return (Math.floor(Math.random() * 10000).toString().padEnd(6, '0'))
}

export async function sendEmail (email: string, code: string, msg?: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: EMAIL_ENV,
      to: email,
      subject: 'Verify your email',
      text: msg ?? `Your verification code is ${code}`
    })
    return true
  } catch (e) {
    throw new ServerError('Operation Failed', 'Something went wrong while sending emails')
  }
}

export function encrypt (text: string, key: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const ivHex = iv.toString('hex')
  return ivHex + ':' + encrypted
}

export function decrypt (encryptedText: string, key: string): string {
  try {
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    const e = error as Error
    if (e.name === 'TypeError' &&
      e.message === 'Invalid initialization vector'
    ) {
      throw new UserBadRequest('Invalid credentials', 'The token is invalid')
    }
    return ''
  }
}
