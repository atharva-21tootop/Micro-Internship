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

// CORS origin validator that supports:
// - Exact matches (localhost, production domains)
// - Vercel preview domains (*.vercel.app)
const isCorsOriginAllowed = (origin) => {
  if (!origin) return true // Allow non-browser requests
  if (allowedOrigins.includes(origin)) return true
  // Allow any *.vercel.app preview domain
  if (origin.endsWith('.vercel.app')) return true
  return false
}

app.use(helmet())

// CORS configuration with comprehensive origin support
app.use(
  cors({
    origin(origin, callback) {
      if (isCorsOriginAllowed(origin)) {
        callback(null, true)
        return
      }
      // Log rejected origins for debugging
      console.warn(`[CORS] Rejected origin: ${origin}`)
      callback(new Error('CORS origin not allowed'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 86400,
    preflightContinue: false, // Let CORS handle OPTIONS
  }),
)
app.use(express.json({ limit: '1mb' }))

// Rate limiter - skip OPTIONS (preflight requests)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT || 300),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
})

app.use('/api', apiLimiter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/internships', internshipRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/applications', applicationRoutes)

app.use((err, _req, res, _next) => {
  // Handle CORS errors specifically
  if (err.message === 'CORS origin not allowed') {
    res.status(403).json({ error: 'CORS origin not allowed' })
    return
  }
  
  const status = err.status || 500
  const message = status >= 500 ? 'Internal server error' : err.message
  if (status >= 500) {
    console.error(err)
  }
  res.status(status).json({ error: message || 'Internal server error' })
})

export default app
