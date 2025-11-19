import { Router } from 'express'
import controller from './../../controller/group/controller'

const router = Router()

router.get('/get/', controller.get)
router.post('/create/', controller.create)
router.post('/update/', controller.update)
router.post('/delete/', controller.delete)

// Members
router.post('/member/add/', controller.member.add)
router.delete('/member/remove/', controller.member.remove)
export default router
