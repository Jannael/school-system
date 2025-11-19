import { Request } from 'express'
import { decrypt } from './utils'
import { UserBadRequest } from '../error/error'
import jwt, { JwtPayload } from 'jsonwebtoken'

function getToken (req: Request,
  tokenName: string,
  jwtPwd: string,
  cryptoPwd: string
): JwtPayload {
  if (req.cookies[tokenName] === undefined) throw new UserBadRequest('Missing data', `Missing ${tokenName}`)
  const jwtToken = decrypt(req.cookies[tokenName], cryptoPwd, tokenName)
  const token = jwt.verify(jwtToken, jwtPwd)
  if (typeof token === 'string') throw new UserBadRequest('Invalid credentials', `Invalid ${tokenName}`)
  return token
}

export default getToken
