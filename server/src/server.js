import app from './app.js'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getFirebaseAdmin } from './config/firebaseAdmin.js'

// Support Render's dynamic PORT assignment (required for deployment)
// Falls back to 5001 for local development
const PORT = Number(process.env.PORT || 5001)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../..')

getFirebaseAdmin()

// Get CORS configuration for logging
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const aiReady = Boolean(
  process.env.AI_API_KEY?.trim() ||
    process.env.VITE_AI_API_KEY?.trim(),
)

const server = app.listen(PORT, () => {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.API_URL || `http://0.0.0.0:${PORT}` 
    : `http://localhost:${PORT}`
  console.log(`✓ API server running on ${apiUrl}`)
  console.log(
    `[Startup] Firebase credentials: ${existsSync(path.join(PROJECT_ROOT, 'serviceAccountKey.json')) ? 'serviceAccountKey.json found' : 'MISSING — student API will return 401'}`,
  )
  console.log(`[Startup] AI recommendations: ${aiReady ? 'Groq/OpenAI key loaded' : 'no API key in .env'}`)
  console.log(`[Startup] CORS origins allowed:`)
  corsOrigins.forEach((origin) => console.log(`  - ${origin}`))
  console.log(`  - *.vercel.app (wildcard preview domains)`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('')
    console.log(`Port ${PORT} is already in use — the API server is probably already running.`)
    console.log(`  → Open http://localhost:${PORT}/api/health in your browser (should show {"ok":true})`)
    console.log('  → Do NOT run npm run server again in a second terminal.')
    console.log('  → To restart: npm run server:restart')
    process.exit(0)
  }
  throw err
})
