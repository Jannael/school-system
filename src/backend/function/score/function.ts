import { Request, Response } from 'express'
import model from './../../model/score/model'
import getToken from '../../utils/token'
import dotenv from 'dotenv'
import { IEnv } from '../../interface/env'
import { UserBadRequest } from '../../error/error'
dotenv.config({ quiet: true })
const {
  CRYPTO_ACCESS_TOKEN_ENV,
  JWT_ACCESS_TOKEN_ENV
} = process.env as Pick<IEnv,
'CRYPTO_ACCESS_TOKEN_ENV' |
'JWT_ACCESS_TOKEN_ENV'>

const functions = {
  user: {
    get: async function (req: Request, res: Response) {
      const accessToken = getToken(req, 'accessToken', JWT_ACCESS_TOKEN_ENV, CRYPTO_ACCESS_TOKEN_ENV)
      if (req.body.semester === undefined) throw new UserBadRequest('Missing data', 'You need to send the semester you want')
      return await model.user.get(accessToken.account, req.body.semester)
    }
  }
}

export default functions
