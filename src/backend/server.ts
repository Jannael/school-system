import { createApp } from './app'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

dotenv.config({ quiet: true })

const PORT = process.env.PORT ?? '3000'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many request',
  headers: true
})

async function init (PORT: string): Promise<void> {
  const app = await createApp()
  app.use(limiter)
  app.listen(PORT, () => console.log('server at PORT: ' + PORT))
}

init(PORT)
  .catch(e => console.error('something went wrong : ', e))
