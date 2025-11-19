import dbModel from './../../database/schemas/node/user'
import bcrypt from 'bcrypt'
import { IRefreshToken, IUser } from '../../interface/user'
import { DatabaseError, NotFound, UserBadRequest } from '../../error/error'
import { Types } from 'mongoose'
import { verifyEmail } from '../../utils/utils'

const model = {
  verify: {
    refreshToken: async function (token: string, userId: Types.ObjectId): Promise<boolean> {
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
    },
    login: async function (account: string, pwd: string): Promise<IRefreshToken> {
      const isValidAccount = verifyEmail(account)
      if (!isValidAccount) throw new UserBadRequest('Invalid credentials', 'The account must Match example@service.ext')

      const user = await dbModel.findOne(
        { account },
        { refreshToken: 0 }
      ).lean()

      if (user === null) throw new NotFound('User not found')

      const pwdIsCorrect = await bcrypt.compare(pwd, user.pwd)
      if (!pwdIsCorrect) throw new UserBadRequest('Invalid credentials', 'Incorrect password')

      delete (user as Partial<IUser>).pwd

      return user as IRefreshToken
    },
    user: async function (account: string): Promise<boolean> {
      const exists = await dbModel.exists({ account })
      if (exists === null) throw new NotFound('User not found')
      return true
    }
  },
  auth: {
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
          if (e instanceof UserBadRequest ||
            e instanceof NotFound) throw e
          throw new DatabaseError('Failed to save')
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
          if (e instanceof UserBadRequest ||
            e instanceof NotFound
          ) throw e
          throw new DatabaseError('Failed to remove')
        }
      }
    }
  }
}

export default model
