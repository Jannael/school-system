import { Types } from 'mongoose'

export interface IUser {
  _id?: Types.ObjectId
  fullName: string
  account: string
  school: string
  pwd?: string
  role: string[]
  refreshToken?: string[] | null
}

export interface IRefreshToken extends Omit<IUser, 'refreshToken' | 'pwd'> {
  _id: Types.ObjectId
}
