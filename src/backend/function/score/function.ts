import { Request, Response } from 'express'
import model from './../../model/score/model'
import getToken from '../../utils/token'
import dotenv from 'dotenv'
import { IEnv } from '../../interface/env'
import { UserBadRequest } from '../../error/error'
import { IScore } from '../../interface/score'
dotenv.config({ quiet: true })
const {
  CRYPTO_ACCESS_TOKEN_ENV,
  JWT_ACCESS_TOKEN_ENV
} = process.env as Pick<IEnv,
'CRYPTO_ACCESS_TOKEN_ENV' |
'JWT_ACCESS_TOKEN_ENV'>

const functions = {
  user: {
    get: async function (req: Request, res: Response): Promise<IScore> {
      const accessToken = getToken(req, 'accessToken', JWT_ACCESS_TOKEN_ENV, CRYPTO_ACCESS_TOKEN_ENV)
      if (req.body.semester === undefined) throw new UserBadRequest('Missing data', 'You need to send the semester you want')
      return await model.user.get(accessToken.account, req.body.semester)
    },
    newSemester: async function (req: Request, res: Response): Promise<boolean> {
      const accessToken = getToken(req, 'accessToken', JWT_ACCESS_TOKEN_ENV, CRYPTO_ACCESS_TOKEN_ENV)
      if (req.body?.subject === undefined || Array.isArray(req.body?.subject)) throw new UserBadRequest('Missing data', 'You need to send the subjects you want to add to the new semester')

      return await model.user.newSemester(accessToken.account, req.body.subject)
    }
  }
}

export default functions
