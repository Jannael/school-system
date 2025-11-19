import { Request, Response } from 'express'
import fn from '../../function/auth/function'
import ErrorHandler from './../../error/handler'
import { CustomError } from '../../error/error'

const controller = {
  request: {
    code: async function (req: Request, res: Response) {
      try {
        const result = await fn.request.code(req, res)
        res.json({ complete: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    },
    accessToken: async function (req: Request, res: Response) {
      try {
        const result = await fn.request.accessToken(req, res)
        res.json({ complete: result })
      } catch (e) {
        (e as CustomError).link = [
          { rel: 'Code for login', href: '/auth/v1/request/refreshToken/code/' },
          { rel: 'Verify code for login', href: '/auth/v1/request/refreshToken/' }
        ]

        ErrorHandler.user(res, e as CustomError)
      }
    },
    refreshToken: {
      code: async function (req: Request, res: Response) {
        try {
          const result = await fn.request.refreshToken.code(req, res)
          res.json({ complete: result })
        } catch (e) {
          ErrorHandler.user(res, e as CustomError)
        }
      },
      confirm: async function (req: Request, res: Response) {
        try {
          const result = await fn.request.refreshToken.confirm(req, res)
          res.json({ complete: result })
        } catch (e) {
          (e as CustomError).link = [
            { rel: 'You need to use MFA for login', href: '/auth/v1/request/refreshToken/code/' }
          ]
          ErrorHandler.user(res, e as CustomError)
        }
      }
    },
    logout: async function (req: Request, res: Response) {
      try {
        const result = await fn.request.logout(req, res)
        res.json({ complete: result })
      } catch (e) {
        ErrorHandler.user(res, e as CustomError)
      }
    }
  },
  verify: {
    code: async function (req: Request, res: Response) {
      try {
        const result = await fn.verify.code(req, res)
        res.json({ complete: result })
      } catch (e) {
        (e as CustomError).link = [
          { rel: 'Missing code', href: '/auth/v1/request/code' }
        ]
        ErrorHandler.user(res, e as CustomError)
      }
    }
  },
  account: {
    request: {
      code: async function (req: Request, res: Response) {
        try {
          const result = await fn.account.request.code(req, res)
          res.json({ complete: result })
        } catch (e) {
          (e as CustomError).link = [
            { rel: 'get accessToken with refreshToken', href: '/auth/v1/request/accessToken/' },
            { rel: 'get refreshToken', href: '/auth/v1/request/refreshToken/code' },
            { rel: 'get refreshToken', href: '/auth/v1/request/refreshToken/' }
          ]
          ErrorHandler.user(res, e as CustomError)
        }
      }
    },
    verify: {
      code: async function (req: Request, res: Response) {
        try {
          const result = await fn.account.verify.code(req, res)
          res.json({ complete: result })
        } catch (e) {
          (e as CustomError).link = [
            { rel: 'get accessToken with refreshToken', href: '/auth/v1/request/accessToken/' },
            { rel: 'get refreshToken', href: '/auth/v1/request/refreshToken/code' },
            { rel: 'get refreshToken', href: '/auth/v1/request/refreshToken/' },
            { rel: 'get verification code for account change', href: '/auth/v1/account/request/code/' },
            { rel: 'validate code', href: '/auth/v1/account/verify/code/' }
          ]
          ErrorHandler.user(res, e as CustomError)
        }
      }
    }
  },
  pwd: {
    request: {
      code: async function (req: Request, res: Response) {
        try {
          const result = await fn.pwd.request.code(req, res)
          res.json({ complete: result })
        } catch (e) {
          ErrorHandler.user(res, e as CustomError)
        }
      }
    },
    verify: {
      code: async function (req: Request, res: Response) {
        try {
          const result = await fn.pwd.verify.code(req, res)
          res.json({ complete: result })
        } catch (e) {
          (e as CustomError).link = [
            { rel: 'get code', href: '/auth/v1/password/request/code/' }
          ]
          ErrorHandler.user(res, e as CustomError)
        }
      }
    }
  }
}

export default controller
