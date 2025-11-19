import userValidator from './user/schema'

const validator = {
  user: {
    create: userValidator.create,
    partial: userValidator.partial
  }
}

export default validator
