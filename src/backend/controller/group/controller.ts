import { Request, Response } from 'express'

const controller = {
  get: async function (req: Request, res: Response) {},
  create: async function (req: Request, res: Response) {},
  update: async function (req: Request, res: Response) {},
  delete: async function (req: Request, res: Response) {},
  member: {
    add: async function (req: Request, res: Response) {},
    remove: async function (req: Request, res: Response) {}
  }
}

export default controller
