import { Router } from 'express'
import controller from './../../controller/user/controller'

const router = Router()

router.get('/get/', controller.user.get)
router.post('/create/', controller.user.create)
router.put('/update/', controller.user.update)
router.delete('/delete/', controller.user.delete)

router.patch('/update/account/', controller.user.account.update)
router.patch('/update/password/', controller.user.password.update)

export default router
