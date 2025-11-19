import crypto from 'node:crypto'
import jwt, { SignOptions } from 'jsonwebtoken'

export function encrypt (
  text: Record<string, any>,
  key: string,
  jwtPwd: string,
  options: SignOptions
): string

export function encrypt (
  text: string,
  key: string
): string

export function encrypt (
  text: string | Record<string, any>,
  key: string,
  jwtPwd?: string,
  options?: SignOptions
): string {
  let payload: string

  if (jwtPwd !== undefined) {
    payload = jwt.sign(text as Record<string, any>, jwtPwd, options)
  } else {
    payload = text as string
  }

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv)
  let encrypted = cipher.update(payload, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const ivHex = iv.toString('hex')
  return ivHex + ':' + encrypted
}

export default encrypt
