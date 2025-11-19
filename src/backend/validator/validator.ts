import user from './user/schema'
import user_group from './user/group'
import user_invitation from './user/invitation'

import group from './group/schema'

const validator = {
  user: {
    create: user.create,
    partial: user.partial,
    group: user_group,
    invitation: user_invitation
  },
  group: {
    create: group.create,
    partial: group.partial
  }
}

export default validator
