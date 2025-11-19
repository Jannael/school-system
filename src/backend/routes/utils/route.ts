import { Request, Response, Router } from 'express'

const router = Router()

router.get('/healthChecker/', (req: Request, res: Response) => {
  res.json({ ok: 1 })
})

export default router
