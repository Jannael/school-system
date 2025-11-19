import { Response } from 'express'
import { CustomError, DatabaseError, DuplicateData, Forbidden, NotFound, ServerError, UserBadRequest } from './error'

function jwtHandler (e: CustomError):
{ code: number, msg: string, description: string, link: Array<{ rel: string, href: string }> | undefined } | undefined {
  let isNull = true
  const status = { code: 500, msg: '', description: '', link: e.link }

  if (e.name === 'TokenExpiredError') {
    isNull = false
    status.code = 401
    status.msg = 'Expired token'
    status.description = 'The token has expired and is no longer valid'
  } else if (e.name === 'JsonWebTokenError') {
    isNull = false
    status.code = 400
    status.msg = 'Invalid token'
    status.description = 'The token is malformed or has been tampered with'
  } else if (e.name === 'NotBeforeError') {
    isNull = false
    status.code = 403
    status.msg = 'Invalid token'
    status.description = 'The token is not active yet; check the "nbf" claim'
  }

  if (isNull) { return undefined }
  return status
}

const handler = {
  user: function (res: Response, e: CustomError) {
    let status: {
      code: number
      msg: string
      description: string | undefined
      link: Array<{ rel: string, href: string }> | undefined
    } = { code: 500, msg: '', description: '', link: undefined }

    status.code = e.code
    status.msg = e.message
    status.description = e.description
    status.link = e.link

    const jwtError = jwtHandler(e)
    if (jwtError !== undefined) status = jwtError

    res.status(status.code).json({
      complete: false,
      msg: status.msg,
      description: status.description,
      link: status.link
    })
  },
  allErrors: function (e: CustomError, lastError: CustomError) {
    if (e instanceof DatabaseError) throw e
    else if (e instanceof UserBadRequest) throw e
    else if (e instanceof DuplicateData) throw e
    else if (e instanceof NotFound) throw e
    else if (e instanceof ServerError) throw e
    else if (e instanceof Forbidden) throw e

    throw lastError
  }
}

export default handler
