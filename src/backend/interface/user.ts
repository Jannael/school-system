import { Types } from 'mongoose'

export interface IUser {
  _id?: Types.ObjectId
  fullName: string
  account: string
  pwd: string
  role: string[]
  nickName?: string | null
  refreshToken?: string[] | null
}

export interface IRefreshToken extends Omit<IUser, 'refreshToken' | 'pwd'> {
  _id: Types.ObjectId
}
