import z from 'zod'
import { IUser } from '../../interface/user'
import { UserBadRequest } from '../../error/error'

const create = z.object({
  school: z.string('school is required'),
  fullName: z.string('fullName is required'),
  account: z.string('the Account is required').email(),
  pwd: z.string('Password is required').min(3).max(255),
  role: z.array(z.enum(['teacher', 'student'] as const, 'role is required and it has to be \'teacher\', \'student\''))
})

const validator = {
  create: function (obj: IUser) {
    try {
      const result = create.parse(obj)
      return result
    } catch (e) {
      throw new UserBadRequest('Invalid credentials', JSON.parse((e as Error).message)[0].message)
    }
  },
  partial: function (obj: Partial<IUser>) {
    try {
      const result = create.partial().parse(obj)
      return result
    } catch {
      return null
    }
  }
}

export default validator
