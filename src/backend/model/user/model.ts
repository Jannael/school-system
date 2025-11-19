import { DatabaseError, DuplicateData, NotFound, UserBadRequest } from '../../error/error'
import { IEnv } from '../../interface/env'
import { verifyEmail } from '../../utils/utils'
import dbModel from './../../database/schemas/node/user'
import { IRefreshToken, IUser } from './../../interface/user'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { Types } from 'mongoose'
import validator from '../../validator/validator'
import scoreModel from './../score/model'

dotenv.config({ quiet: true })
const { BCRYPT_SALT_HASH } = process.env as Pick<IEnv, 'BCRYPT_SALT_HASH'>

const model = {
  user: {
    create: async function (data: IUser, subjectArray: string[]): Promise<IRefreshToken> {
      try {
        if (data._id !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not put the _id yourself')
        if (data.refreshToken !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not put the refreshToken yourself')
        validator.user.create(data)

        const exists = await dbModel.exists({ account: data.account })
        if (exists != null) throw new DuplicateData('User already exists', 'This account belongs to an existing user')

        const salt = await bcrypt.genSalt(Number(BCRYPT_SALT_HASH))
        const hashedPwd = await bcrypt.hash(data.pwd, salt)
        const payload = { ...data, pwd: hashedPwd }
        const result = await dbModel.insertOne({ ...payload })
        await scoreModel.user.newSemester(result.account, subjectArray)
        const user = await dbModel.findOne({ _id: result._id },
          { pwd: 0, refreshToken: 0 }
        ).lean()

        if (user === null) throw new NotFound('User not found', 'The user appears to be created but it was not found')

        return user
      } catch (e: any) {
        if (e instanceof DuplicateData) throw e
        else if (e instanceof UserBadRequest) throw e
        else if (e instanceof NotFound) throw e

        throw new DatabaseError('Failed to save', 'The user was not created, something went wrong please try again')
      }
    },
    update: async function (data: Partial<IUser>, userId: Types.ObjectId): Promise<IRefreshToken> {
      if (!Types.ObjectId.isValid(userId)) {
        throw new UserBadRequest('Invalid credentials', 'The _id is invalid')
      }

      if (data.pwd !== undefined) {
        const salt = await bcrypt.genSalt(Number(BCRYPT_SALT_HASH))
        const pwd = await bcrypt.hash(data.pwd, salt)
        data.pwd = pwd
      }

      if (data.account !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not update the account here')
      if (data._id !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not change the _id')
      if (data.refreshToken !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not update the refreshToken')

      validator.user.partial(data)

      const user = await dbModel.updateOne({ _id: userId }, { ...data })
      if (user.matchedCount === 0) throw new NotFound('User not found')
      const refreshToken = await dbModel.findOne({ _id: userId }, { pwd: 0, refreshToken: 0 }).lean()

      if (user.acknowledged && refreshToken !== null) {
        return refreshToken
      }

      throw new NotFound('User not found')
    },
    delete: async function (userId: Types.ObjectId): Promise<boolean> {
      if (!Types.ObjectId.isValid(userId)) {
        throw new UserBadRequest('Invalid credentials', 'The _id is invalid')
      }

      const result = await dbModel.deleteOne({ _id: userId })

      if (result.acknowledged && result.deletedCount === 1) { return true }
      throw new NotFound('User not found')
    },
    account: {
      update: async function (userId: Types.ObjectId, account: string): Promise<IRefreshToken> {
        if (!Types.ObjectId.isValid(userId)) {
          throw new UserBadRequest('Invalid credentials', 'The _id is invalid')
        }

        const isValidAccount = verifyEmail(account)
        if (!isValidAccount) throw new UserBadRequest('Invalid credentials', 'The account must match example@service.ext')

        const response = await dbModel.updateOne({ _id: userId }, { account })
        if (response.matchedCount === 0) throw new NotFound('User not found')

        const user = await dbModel.findOne({ _id: userId }, { refreshToken: 0, pwd: 0 }).lean()
        if (user === null) throw new NotFound('User not found')
        return user
      }
    },
    password: {
      update: async function (account: string, pwd: string): Promise<boolean> {
        if (!verifyEmail(account)) throw new UserBadRequest('Invalid credentials', 'The account must match example@service.ext')

        const salt = await bcrypt.genSalt(Number(BCRYPT_SALT_HASH))
        const hashedPwd = await bcrypt.hash(pwd, salt)
        const response = await dbModel.updateOne({ account }, { pwd: hashedPwd })
        if (response.matchedCount === 0) throw new NotFound('User not found')

        return true
      }
    }
  }
}

export default model
