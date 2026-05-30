import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import internshipRoutes from './routes/internshipRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import communityRoutes from './routes/communityRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('CORS origin not allowed'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.API_RATE_LIMIT || 300),
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/internships', internshipRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/applications', applicationRoutes)

app.use((err, _req, res, _next) => {
  const status = err.status || 500
  const message = status >= 500 ? 'Internal server error' : err.message
  if (status >= 500) {
    console.error(err)
  }
  res.status(status).json({ error: message || 'Internal server error' })
})

export default app
