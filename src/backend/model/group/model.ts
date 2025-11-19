import { Types } from 'mongoose'
import dbModel from './../../database/schemas/node/group'
import { IGroup } from '../../interface/group'
import validator from '../../validator/validator'
import { CustomError, DatabaseError, Forbidden, NotFound, UserBadRequest } from '../../error/error'
import UserModel from '../user/model'
import errorHandler from '../../error/handler'
import config from '../../config/config'
import { omit } from '../../utils/utils'
import userDbModel from '../../database/schemas/node/user'
import authModel from './../../../backend/model/auth/model'

const model = {
  get: async function (id: Types.ObjectId): Promise<IGroup> {
    try {
      const res = await dbModel.findOne({ _id: id }, { member: 0, techLead: 0 }).lean()
      if (res === null) throw new NotFound('Group not found', 'The group you are trying to access does not exist')
      return res
    } catch (e) {
      errorHandler.allErrors(
        e as CustomError,
        new DatabaseError('Failed to access data', 'The group was not retrieved, something went wrong please try again')
      )
      throw new DatabaseError('Failed to access data', 'The group was not retrieved, something went wrong please try again')
    }
  },
  exists: async function (groupId: Types.ObjectId, techLeadAccount?: string): Promise<boolean> {
    try {
      const res = await dbModel.exists({ _id: groupId })
      if (res === null || res === undefined) throw new NotFound('Group not found', 'The group you are trying to access does not exist')

      if (techLeadAccount !== undefined) {
        const isTechLead = await dbModel.exists({ _id: groupId, 'techLead.account': techLeadAccount })
        if (isTechLead === null || isTechLead === undefined) throw new Forbidden('Access denied', 'The group exists but the user is not a techLead')
      }

      return true
    } catch (e) {
      errorHandler.allErrors(
        e as CustomError,
        new DatabaseError('Failed to access data', 'The group existence could not be verified, something went wrong please try again')
      )
      throw new DatabaseError('Failed to access data', 'The group existence could not be verified, something went wrong please try again')
    }
  },
  create: async function (data: Omit<IGroup, '_id'>, techLead: { fullName: string, account: string }): Promise<IGroup & Required<Pick<IGroup, '_id'>>> {
    try {
      if (data.techLead === undefined) data.techLead = []
      if (!data.techLead.includes(techLead)) data.techLead.push(techLead)

      const user = await userDbModel.findOne({ account: techLead.account }, { _id: 1, group: 1 })
      if (user === null || user === undefined) throw new NotFound('User not found')
      if (user.group !== null &&
        user.group !== undefined &&
        user.group.length >= config.user.maxGroups
      ) throw new Forbidden('Access denied', 'The user has reached the max number of groups')

      validator.group.create(data)
      const created = await dbModel.create(data)

      if (data.techLead !== undefined) {
        for (const techLd of data.techLead) {
          if (techLd.account === techLead.account) continue
          await UserModel.invitation.create({ ...techLd, role: 'techLead' }, {
            _id: created._id,
            name: created.name,
            color: created.color
          }, techLead.account)
        }
      }

      if (data.member !== undefined) {
        for (const member of data.member) {
          await UserModel.invitation.create(member, {
            _id: created._id,
            name: created.name,
            color: created.color
          }, techLead.account)
        }
      }

      await UserModel.group.add(techLead.account, {
        _id: created._id,
        name: created.name,
        color: created.color
      })

      const res = created.toObject()
      delete res.techLead
      delete res.member

      return res
    } catch (e) {
      errorHandler.allErrors(
        e as CustomError,
        new DatabaseError('Failed to save', 'The group was not created, something went wrong please try again')
      )
      throw new DatabaseError('Failed to save', 'The group was not created, something went wrong please try again')
    }
  },
  update: async function (techLeadId: Types.ObjectId, groupId: Types.ObjectId, data: Partial<IGroup>): Promise<IGroup> {
    try {
      if (data._id !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not change the _id')
      if (data.member !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not change the member')
      if (data.techLead !== undefined) throw new UserBadRequest('Invalid credentials', 'You can not change the techLead')

      const user = await userDbModel.findOne({ _id: techLeadId }, { _id: 0, account: 1 }).lean()
      if (user === null) throw new NotFound('User not found')

      const group = await dbModel.findOne({ _id: groupId }, { _id: 1, name: 1, color: 1 }).lean()
      if (group === null) throw new NotFound('Group not found')
      await model.exists(group._id, user.account)

      validator.group.partial(data)

      const updated = await dbModel.updateOne({ _id: groupId }, data)
      if (updated.matchedCount === 0) throw new NotFound('Group not found', 'The group you are trying to update does not exist')

      const updatedGroup = await dbModel.findOne({ _id: groupId }).lean()
      if (updatedGroup === null) throw new NotFound('Group not found', 'The group you are trying to update does not exist')

      if (updatedGroup.techLead !== undefined) {
        for (const techLead of updatedGroup.techLead) {
          await UserModel.group.update(techLead.account, groupId, { name: updatedGroup.name, color: updatedGroup.color })
        }
      }

      if (updatedGroup.member !== undefined) {
        for (const member of updatedGroup.member) {
          await UserModel.group.update(member.account, groupId, { name: updatedGroup.name, color: updatedGroup.color })
        }
      }

      delete updatedGroup.techLead
      delete updatedGroup.member
      return updatedGroup
    } catch (e) {
      errorHandler.allErrors(
        e as CustomError,
        new DatabaseError('Failed to save', 'The group was not updated, something went wrong please try again')
      )
      throw new DatabaseError('Failed to save', 'The group was not updated, something went wrong please try again')
    }
  },
  delete: async function (techLeadAccount: string, groupId: Types.ObjectId): Promise<boolean> {
    try {
      await authModel.exists(techLeadAccount)
      const members = await dbModel.findOne({ _id: groupId }, { member: 1, techLead: 1 }).lean()
      if (members === null) throw new NotFound('Group not found', 'The group you are trying to delete does not exist')

      const isTechLead = await dbModel.exists({ _id: groupId, 'techLead.account': techLeadAccount })
      if (isTechLead === null) throw new Forbidden('Access denied', 'Only tech leads can delete a group')

      if (members.member !== undefined) {
        for (const member of members.member) {
          await UserModel.group.remove(member.account, groupId)
        }
      }

      if (members.techLead !== undefined) {
        for (const techLead of members.techLead) {
          await UserModel.group.remove(techLead.account, groupId)
        }
      }

      const deleted = await dbModel.deleteOne({ _id: groupId })
      if (deleted.deletedCount === 0) throw new NotFound('Group not found', 'The group you are trying to delete does not exist')
      return deleted.acknowledged
    } catch (e) {
      errorHandler.allErrors(
        e as CustomError,
        new DatabaseError('Failed to remove', 'The group was not deleted, something went wrong please try again')
      )
      throw new DatabaseError('Failed to remove', 'The group was not deleted, something went wrong please try again')
    }
  },
  member: {
    add: async function (groupId: Types.ObjectId, member: NonNullable<IGroup['member']>[number]): Promise<boolean> {
      try {
        const currentMembers = await dbModel.findOne({ _id: groupId }, { member: 1, _id: 0 })
        if (currentMembers === null) throw new NotFound('Group not found', 'The group you are trying to access was not found')
        if (currentMembers?.member !== undefined && currentMembers.member.find(m => m.account === member.account) !== undefined) return true

        if (currentMembers?.member?.length !== undefined &&
          currentMembers?.member?.length >= config.group.maxMembers
        ) throw new Forbidden('Access denied', 'The group has reached the max number of members')

        if (member.role === 'techLead') {
          const techLead = omit(member, ['role'])
          const res = await dbModel.updateOne({ _id: groupId }, {
            $push: { techLead }
          })
          if (res.matchedCount === 0) throw new NotFound('Group not found', 'The group you are trying to access was not found')
          return res.acknowledged
        }

        const res = await dbModel.updateOne({ _id: groupId }, {
          $push: { member }
        })

        if (res.matchedCount === 0) throw new NotFound('Group not found', 'The group you are trying to access was not found')

        return res.acknowledged
      } catch (e) {
        errorHandler.allErrors(
          e as CustomError,
          new DatabaseError('Failed to save', `the member with the account ${member.account} was not added`)
        )
        throw new DatabaseError('Failed to save', `the member with the account ${member.account} was not added`)
      }
    },
    remove: async function (groupId: Types.ObjectId, account: string): Promise<boolean> {
      try {
        await authModel.exists(account)

        const isTechLead = await dbModel.findOne({ _id: groupId, 'techLead.account': account }, { techLead: 1, _id: 0 })
        if (isTechLead !== null && isTechLead !== undefined) {
          if (isTechLead.techLead?.length !== undefined && isTechLead.techLead?.length <= 1) throw new Forbidden('Access denied', 'You can not remove the last techLead')
          const res = await dbModel.updateOne({ _id: groupId }, {
            $pull: { techLead: { account } }
          })

          return res.acknowledged
        }

        const res = await dbModel.updateOne({ _id: groupId }, {
          $pull: { member: { account } }
        })

        if (res.matchedCount === 0) throw new NotFound('Group not found', 'The group was not found')

        return res.acknowledged
      } catch (e) {
        errorHandler.allErrors(
          e as CustomError,
          new DatabaseError('Failed to remove', 'The member was not remove from the group please try again')
        )
        return false
      }
    },
    update: async function (groupId: Types.ObjectId,
      data: { fullName: string, account: string },
      updateData: { fullName: string, account: string }
    ): Promise<boolean> {
      try {
        const exists = await dbModel.exists({ _id: groupId })
        if (exists === null) throw new NotFound('Group not found')

        const isTechLead = await dbModel.findOne({ _id: groupId, 'techLead.account': data.account, 'techLead.fullName': data.fullName })

        if (isTechLead !== null) {
          const res = await dbModel.updateOne(
            { _id: groupId, 'techLead.account': data.account, 'techLead.fullName': data.fullName },
            { $set: { 'techLead.$.account': updateData.account, 'techLead.$.fullName': updateData.fullName } })

          return res.acknowledged
        }

        const res = await dbModel.updateOne(
          { _id: groupId, 'member.account': data.account, 'member.fullName': data.fullName },
          { $set: { 'member.$.account': updateData.account, 'member.$.fullName': updateData.fullName } })

        if (res.matchedCount === 0) throw new NotFound('User not found')

        return res.acknowledged
      } catch (e) {
        errorHandler.allErrors(
          e as CustomError,
          new DatabaseError('Failed to save', 'The user was not updated')
        )
        return false
      }
    }
  }
}

export default model
