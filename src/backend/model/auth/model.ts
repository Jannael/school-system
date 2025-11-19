import dbModel from './../../database/schemas/node/user'
import bcrypt from 'bcrypt'
import { IRefreshToken, IUser } from '../../interface/user'
import { CustomError, DatabaseError, NotFound, UserBadRequest } from '../../error/error'
import { Types } from 'mongoose'
import { verifyEmail, omit } from '../../utils/utils'
import config from '../../config/config'
import errorHandler from '../../error/handler'

const model = {
  login: async function (account: string, pwd: string): Promise<IRefreshToken> {
    try {
      const isValidAccount = verifyEmail(account)
      if (!isValidAccount) throw new UserBadRequest('Invalid credentials', 'The account must Match example@service.ext')

      const projection = omit(config.database.projection.IRefreshToken, ['pwd'])

      const user = await dbModel.findOne(
        { account },
        projection
      ).lean()

      if (user === null) throw new NotFound('User not found')

      const pwdIsCorrect = await bcrypt.compare(pwd, user.pwd)
      if (!pwdIsCorrect) throw new UserBadRequest('Invalid credentials', 'Incorrect password')

      delete (user as Partial<IUser>).pwd

      return user
    } catch (e) {
      errorHandler.allErrors(
        e as CustomError,
        new DatabaseError('Failed to access data', 'The user was not retrieved, something went wrong please try again')
      )
      throw new DatabaseError('Failed to access data', 'The user was not retrieved, something went wrong please try again')
    }
  },
  exists: async function (account: string): Promise<boolean> {
    try {
      const exists = await dbModel.exists({ account })
      if (exists === null) throw new NotFound('User not found')
      return true
    } catch (e) {
      errorHandler.allErrors(
        e as CustomError,
        new DatabaseError('Failed to access data', 'The user was not retrieved, something went wrong please try again')
      )
      throw new DatabaseError('Failed to access data', 'The user was not retrieved, something went wrong please try again')
    }
  },
  refreshToken: {
    save: async function (token: string, userId: Types.ObjectId): Promise<boolean> {
      try {
        if (!Types.ObjectId.isValid(userId)) {
          throw new UserBadRequest('Invalid credentials', 'The _id is invalid')
        }

        const exists = await dbModel.exists({ _id: userId })
        if (exists == null) throw new NotFound('User not found')

        const { refreshToken } = await dbModel.findOne({ _id: userId }, { _id: 0, refreshToken: 1 }) as { refreshToken: string[] }

        if (Array.isArray(refreshToken) && refreshToken.length >= 3) {
          await dbModel.updateOne({ _id: userId }, { refreshToken: refreshToken.slice(1) })
        }

        const result = await dbModel.updateOne(
          { _id: userId },
          { $push: { refreshToken: token } }
        )

        return result.matchedCount === 1 && result.modifiedCount === 1
      } catch (e) {
        errorHandler.allErrors(
          e as CustomError,
          new DatabaseError('Failed to save', 'The session was not saved, something went wrong please try again')
        )
        throw new DatabaseError('Failed to save', 'The session was not saved, something went wrong please try again')
      }
    },
    remove: async function (token: string, userId: Types.ObjectId): Promise<boolean> {
      try {
        if (!Types.ObjectId.isValid(userId)) {
          throw new UserBadRequest('Invalid credentials', 'The _id is invalid')
        }

        const exists = await dbModel.exists({ _id: userId })
        if (exists == null) throw new NotFound('User not found')

        const result = await dbModel.updateOne(
          { _id: userId },
          { $pull: { refreshToken: token } }
        )

        return result.matchedCount === 1 && result.modifiedCount === 1
      } catch (e) {
        errorHandler.allErrors(
          e as CustomError,
          new DatabaseError('Failed to remove', 'The session was not removed, something went wrong please try again')
        )
        throw new DatabaseError('Failed to remove', 'The session was not removed, something went wrong please try again')
      }
    },
    verify: async function (token: string, userId: Types.ObjectId): Promise<boolean> {
      try {
        if (!Types.ObjectId.isValid(userId)) {
          throw new UserBadRequest('Invalid credentials', 'The _id is invalid')
        }

        const result = await dbModel.findOne(
          { _id: userId },
          { refreshToken: 1, _id: 0 }
        ).lean()

        if (result === null) throw new NotFound('User not found')

        const tokens = result?.refreshToken
        return Array.isArray(tokens) && tokens.includes(token)
      } catch (e) {
        errorHandler.allErrors(
          e as CustomError,
          new DatabaseError('Failed to access data', 'The user was not retrieved, something went wrong please try again')
        )
        throw new DatabaseError('Failed to access data', 'The user was not retrieved, something went wrong please try again')
      }
    }
  }
}

export default model
