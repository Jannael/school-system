export interface IPartialSchema {
  subject: string
  score: number
}

export interface IScore {
  school: string
  semester: number
  One: IPartialSchema[]
  Two: IPartialSchema[]
  Three: IPartialSchema[]
}
