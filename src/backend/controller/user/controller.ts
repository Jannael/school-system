import { Request, Response } from 'express'
import fn from '../../function/user/function'
import ErrorHandler from '../../error/handler'
import { CustomError } from '../../error/error'

const controller = {
  get: async function (req: Request, res: Response) {
    try {
      const result = await fn.get(req, res)
      res.json({ complete: true, ...result })
    } catch (e) {
      (e as CustomError).link = [
        { rel: 'get accessToken', href: '/auth/v1/request/accessToken/' }
      ]
      ErrorHandler.user(res, e as CustomError)
    }
  },
  create: async function (req: Request, res: Response) {
    try {
      const result = await fn.create(req, res)
      res.status(201).json({ ...result, complete: true })
    } catch (e) {
      (e as CustomError).link = [
        { rel: 'code', href: '/auth/v1/request/code/' },
        { rel: 'code', href: '/auth/v1/verify/code/' }
      ]
      ErrorHandler.user(res, e as CustomError)
    }
  },
  update: async function (req: Request, res: Response) {
    try {
      const result = await fn.update(req, res)
      res.json({ complete: true, user: result })
    } catch (e) {
      (e as CustomError).link = [
        { rel: 'code', href: '/auth/v1/request/code/' },
        { rel: 'code', href: '/auth/v1/verify/code/' }
      ]
      ErrorHandler.user(res, e as CustomError)
    }
  },
  delete: async function (req: Request, res: Response) {
    try {
      const result = await fn.delete(req, res)
      if (result) res.json({ complete: true })
    } catch (e) {
      (e as CustomError).link = [
        { rel: 'code', href: '/auth/v1/request/code/' },
        { rel: 'code', href: '/auth/v1/verify/code/' }
      ]
      ErrorHandler.user(res, e as CustomError)
    }
  },
  account: {
    update: async function (req: Request, res: Response) {
      try {
        const result = await fn.account.update(req, res)
        res.json({ complete: true, user: result })
      } catch (e) {
        (e as CustomError).link = [
          { rel: 'code', href: '/auth/v1/account/request/code/' },
          { rel: 'code', href: '/auth/v1/account/verify/code/' }
        ]
        ErrorHandler.user(res, e as CustomError)
      }
    }
  },
  password: {
    update: async function (req: Request, res: Response) {
      try {
        const result = await fn.password.update(req, res)
        res.json({ complete: result })
      } catch (e) {
        (e as CustomError).link = [
          { rel: 'code', href: '/auth/v1/password/request/code/' },
          { rel: 'verify', href: '/auth/v1/password/verify/code/' }
        ]
        ErrorHandler.user(res, e as CustomError)
      }
    }
  },
  invitation: {
    get: async function (req: Request, res: Response) {
      try {
        const result = await fn.invitation.get(req, res)
        res.json({ complete: true, invitation: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    },
    create: async function (req: Request, res: Response) {
      try {
        const result = await fn.invitation.create(req, res)
        res.json({ complete: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    },
    reject: async function (req: Request, res: Response) {
      try {
        const result = await fn.invitation.reject(req, res)
        res.json({ complete: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    }
  },
  group: {
    get: async function (req: Request, res: Response) {
      try {
        const result = await fn.group.get(req, res)
        res.json({ complete: true, group: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    },
    remove: async function (req: Request, res: Response) {
      try {
        const result = await fn.group.remove(req, res)
        res.json({ complete: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    },
    add: async function (req: Request, res: Response) {
      try {
        const result = await fn.group.add(req, res)
        res.json({ complete: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    }
  }
}

export default controller
