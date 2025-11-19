export type CustomError = Error & {
  code: number
  description?: string
  link?: Array<{ rel: string, href: string }>
}

export function createError<T extends string> (
  code: number,
  name: string
): new (
    message: T,
    description?: string,
    link?: Array<{ rel: string, href: string }>
  ) => CustomError {
  const capitalize = (text: string): string =>
    text.charAt(0).toUpperCase() + text.slice(1)

  return class extends Error {
    readonly code: number
    readonly description?: string
    readonly link?: Array<{ rel: string, href: string }>

    constructor (message: T, description?: string, link?: Array<{ rel: string, href: string }>) {
      super(capitalize(message))
      this.name = name
      this.code = code
      this.description = description !== undefined ? capitalize(description) : undefined
      this.link = link
    }
  }
}

type IDatabaseError = 'Connection error' | 'Failed to save' | 'Failed to remove'
export const DatabaseError = createError<IDatabaseError>(500, 'databaseError')

type IUserBadRequest = 'Missing data' | 'Invalid credentials'
export const UserBadRequest = createError<IUserBadRequest>(400, 'userBadRequest')

type IDuplicateData = 'User already exists'
export const DuplicateData = createError<IDuplicateData>(409, 'duplicateData')

type INotFound = 'User not found' | 'Score not found'
export const NotFound = createError<INotFound>(404, 'NotFound')

type IServerError = 'Operation Failed'
export const ServerError = createError<IServerError>(500, 'ServerError')

type IForbidden = 'Invalid account'
export const Forbidden = createError<IForbidden>(403, 'Forbidden')
