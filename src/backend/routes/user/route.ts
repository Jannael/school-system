import { Router } from 'express'
import controller from './../../controller/user/controller'

const router = Router()

// User
router.post('/create/', controller.create)
router.get('/get/', controller.get)
router.put('/update/', controller.update)
router.delete('/delete/', controller.delete)

router.patch('/update/account/', controller.account.update)
router.patch('/update/password/', controller.password.update)

// Invitation
router.get('/get/invitation/', controller.invitation.get)
router.post('/create/invitation/', controller.invitation.create)
router.delete('/reject/invitation/', controller.invitation.reject)

// Group
router.get('/get/group/', controller.group.get)
router.delete('/delete/group/', controller.group.remove)
router.post('/add/group/', controller.group.add)

export default router
