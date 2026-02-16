// ========================================================================
// FILE: server.js
// FUNGSI: Entry point utama backend - setup Express server
// PENJELASAN:
// - File ini men-setup server Express
// - Connect ke MongoDB
// - Import routes dan middleware
// - Start server di port tertentu
// ========================================================================

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDatabase } from './config/mongoConnect.js'

// Import routes
import videosRoute from './routes/videos.js'
import usersRoute from './routes/users.js'
import authRoute from './routes/auth.js'
import adminRoute from './routes/admin.js'

// Import middleware
import {
  errorHandler,
  notFoundHandler,
  corsConfig,
  requestLogger
} from './middleware/errorHandler.js'

import { config } from './config/database.js'

// Load environment variables dari .env file
dotenv.config()

// ==================== INISIALISASI EXPRESS ====================

// Buat instance Express app
const app = express()

// ==================== MIDDLEWARE SETUP ====================

// Middleware untuk parse JSON request body
// Contoh: POST /api/users dengan body { name: "John" }
app.use(express.json())

// Middleware untuk parse URL-encoded data
app.use(express.urlencoded({ extended: true }))

// CORS Middleware - Allow frontend akses API
// Frontend di localhost:5173 bisa request ke backend di localhost:5000
app.use(cors(corsConfig))

// Request Logger - log semua request (untuk debugging)
app.use(requestLogger)

// Serve static files dari public folder
app.use(express.static('public'))

// ==================== HEALTH CHECK ENDPOINT ====================

/**
 * GET /
 * Serve CRUD Test Interface
 */
app.get('/', (req, res) => {
  res.sendFile('public/crud.html', { root: '.' })
})

/**
 * GET /api/health
 * Endpoint health check API
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// ==================== API ROUTES ====================

// ROUTE STRUCTURE:
// GET /api/videos              - Get all videos
// GET /api/videos/:id          - Get one video
// POST /api/videos             - Create video
// PUT /api/videos/:id          - Update video
// DELETE /api/videos/:id       - Delete video

/**
 * Routes untuk Video Management
 * BASE PATH: /api/videos
 */
app.use('/api/videos', videosRoute)

/**
 * Routes untuk User Management
 * BASE PATH: /api/users
 */
app.use('/api/users', usersRoute)

/**
 * Routes untuk Authentication
 * BASE PATH: /api/auth
 */
app.use('/api/auth', authRoute)

/**
 * Routes untuk Admin Management
 * BASE PATH: /api/admin
 */
app.use('/api/admin', adminRoute)

// ==================== ERROR HANDLING ====================

// 404 - Route tidak ditemukan
app.use(notFoundHandler)

// Error handler middleware - HARUS diletakkan paling akhir
// Catch semua error dan return response yang konsisten
app.use(errorHandler)

// ==================== START SERVER ====================

const PORT = config.PORT
const NODE_ENV = config.NODE_ENV

/**
 * ASYNC FUNCTION: startServer
 * Tujuan: Connect DB dan start server
 */
async function startServer() {
  try {
    // ===== STEP 1: Connect to MongoDB =====
    console.log('\n📊 Initializing Database Connection...')
    await connectDatabase()

    // ===== STEP 2: Start Express Server =====
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║          🚀 StreamHub Backend API Started 🚀          ║
╚════════════════════════════════════════════════════════╝

📡 Server URL: http://localhost:${PORT}
🔧 Environment: ${NODE_ENV}
🌐 CORS Origin: ${config.CORS_ORIGIN}

📚 API Endpoints:
   • Videos:       GET  /api/videos
   • Videos:       GET  /api/videos/:id
   • Videos Search:GET  /api/videos/search?query=...
   • Users:        GET  /api/users/:userId
   • Users:        POST /api/users (Register)
   • Auth:         POST /api/auth/login
   • Auth:         POST /api/auth/logout

🧪 Test Health:  http://localhost:${PORT}/api/health

📖 API Docs:     Lihat backend/README.md

⚙️  Database Setup:
   ✅ MongoDB Connected
   ✅ Collections ready (users, videos)
   ✅ Indexes created
   ✅ Password hashing enabled (bcrypt)

💡 First Time Setup:
   • Populate database: npm run seed
   • Reset database: npm run seed -- --force

`)
    })
  } catch (error) {
    console.error(`
❌ Failed to start server:
${error.message}

Please check:
1. MongoDB server is running
2. .env file is configured correctly
3. MONGODB_URI points to valid database
    `)
    process.exit(1)
  }
}

// Run server
startServer()

export default app
