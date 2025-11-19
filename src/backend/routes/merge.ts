import authRouter from './auth/route'
import userRouter from './user/route'
import utilsRouter from './utils/route'
import scoreRouter from './score/route'

export default {
  auth: authRouter,
  user: userRouter,
  utils: utilsRouter,
  score: scoreRouter
}
