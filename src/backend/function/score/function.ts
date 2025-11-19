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
      if (req.params?.semester === undefined) throw new UserBadRequest('Missing data', 'You need to send the semester you want')
      return await model.user.get(accessToken.account, Number(req.params.semester))
    },
    newSemester: async function (req: Request, res: Response): Promise<boolean> {
      const accessToken = getToken(req, 'accessToken', JWT_ACCESS_TOKEN_ENV, CRYPTO_ACCESS_TOKEN_ENV)
      if (req.body?.subject === undefined || !Array.isArray(req.body?.subject)) throw new UserBadRequest('Missing data', 'You need to send the subjects you want to add to the new semester')

      return await model.user.newSemester(accessToken.account, req.body.subject)
    }
  },
  teacher: {
    update: async function (req: Request, res: Response): Promise<boolean> {
      const partials = ['One', 'Two', 'Three']
      if (req.body?.account === undefined ||
        req.body?.semester === undefined ||
        req.body?.subject === undefined ||
        req.body?.score === undefined ||
        req.body?.partial === undefined ||
        (req.body?.partial !== undefined &&
          !partials.includes(req.body?.partial)
        )
      ) throw new UserBadRequest('Missing data', 'You need to send account, semester, subject, score, partial(One, Two, Three)')

      return await model.teacher.update(req.body.account, req.body.semester, req.body.subject, req.body.score, req.body.partial)
    }
  }
}

export default functions
