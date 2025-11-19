import z from 'zod'
import { IUserGroup } from '../../interface/user'
import { UserBadRequest } from '../../error/error'
import { Types } from 'mongoose'

const groupSchema = z.object({
  _id: z.instanceof(Types.ObjectId, {
    message: 'Invalid _id format'
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a valid hex code'),
  name: z.string('Name is required').min(3).max(100)
})

const validator = {
  add: function (obj: IUserGroup) {
    try {
      const result = groupSchema.parse(obj)
      return result
    } catch (e) {
      throw new UserBadRequest('Invalid credentials', JSON.parse((e as Error).message)[0].message)
    }
  }
}

export default validator
