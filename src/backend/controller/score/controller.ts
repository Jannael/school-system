import { CustomError } from '../../error/error'
import handler from '../../error/handler'
import { Request, Response } from 'express'
import fn from './../../function/score/function'

const controller = {
  user: {
    get: async function (req: Request, res: Response) {
      try {
        const result = await fn.user.get(req, res)
        res.json({ complete: true, result })
      } catch (e) {
        handler.user(res, e as CustomError)
      }
    },
    newSemester: async function (req: Request, res: Response) {
      try {
        const result = await fn.user.newSemester(req, res)
        res.json({ complete: result })
      } catch (e) {
        handler.user(res, e as CustomError)
      }
    }
  },
  teacher: {
    update: async function (req: Request, res: Response) {
      try {
        const result = await fn.teacher.update(req, res)
        res.json({ complete: result })
      } catch (e) {
        handler.user(res, e as CustomError)
      }
    }
  }
}

export default controller
