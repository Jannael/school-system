import { Types } from 'mongoose'

export interface IUserInvitation {
  _id: Types.ObjectId
  color: string
  name: string
}

export interface IUserGroup extends IUserInvitation {}

export interface IUser {
  _id?: Types.ObjectId
  fullName: string
  account: string
  pwd: string
  nickName?: string | null
  refreshToken?: string[] | null
  invitation?: IUserInvitation[] | null
  group?: IUserGroup[] | null
}

export interface IRefreshToken extends Omit<IUser, 'refreshToken' | 'pwd'> {
  _id: Types.ObjectId
}
