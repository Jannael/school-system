import { Router } from 'express'
import controller from './../../controller/auth/controller'

const router = Router()

router.post('/request/code/', controller.request.code)
router.post('/verify/code/', controller.verify.code)

router.get('/request/accessToken/', controller.request.accessToken)
router.post('/request/refreshToken/code/', controller.request.refreshToken.code)
router.post('/request/refreshToken/', controller.request.refreshToken.confirm)

router.patch('/account/request/code/', controller.account.request.code)
router.patch('/account/verify/code/', controller.account.verify.code)

router.patch('/password/request/code/', controller.pwd.request.code)
router.patch('/password/verify/code/', controller.pwd.verify.code)

router.post('/request/logout/', controller.request.logout)

export default router
