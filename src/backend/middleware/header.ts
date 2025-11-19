import { Request, Response, NextFunction } from 'express'

async function header (req: Request, res: Response, next: NextFunction): Promise<void> {
  res.removeHeader('x-powered-by')
  next()
}

export default header
