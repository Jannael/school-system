import { Router } from 'express'
import controller from './../../controller/score/controller'
const router = Router()

router.get('/get/:semester', controller.user.get)
router.post('/new-semester/', controller.user.newSemester)
router.post('/update/', controller.teacher.update)

export default router
