export default {
  cookies: {
    code: { httpOnly: true, maxAge: 60 * 5 * 1000 },
    codeNewAccount: { httpOnly: true, maxAge: 60 * 10 * 1000 },
    accessToken: { httpOnly: true, maxAge: 60 * 15 * 1000 },
    refreshToken: { httpOnly: true, maxAge: 60 * 60 * 24 * 365 * 1000 }
  },
  jwt: {
    code: { expiresIn: '5m' },
    accessToken: { expiresIn: '15m' },
    refreshToken: { expiresIn: '365d' },
    codeNewAccount: { expiresIn: '10m' }
  },
  database: {
    mongodb: {
      schemaOptions: {
        versionKey: false as const,
        strict: true,
        minimize: false
      }
    },
    projection: {
      IRefreshToken: { pwd: 0, refreshToken: 0, invitation: 0, group: 0 }
    }
  },
  user: {
    maxInvitations: 5,
    maxGroups: 5
  },
  group: {
    maxMembers: 5
  }
} as const
