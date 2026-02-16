// ========================================================================
// FILE: errorHandler.js (Middleware)
// FUNGSI: Handle error responses dan CORS configuration
// PENJELASAN:
// - Middleware adalah function yang process request sebelum sampai controller
// - Error handler catch semua error dan format response yang konsisten
// ========================================================================

/**
 * FUNGSI: errorHandler
 * TUJUAN: Catch error dan return response yang konsisten
 * PARAMETER: (err, req, res, next) - Khusus untuk error middleware
 * NOTES: Error middleware harus diletakkan SETELAH semua route definitions
 */
export const errorHandler = (err, req, res, next) => {
  // Set default status code dan message
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  console.error(`[Error] ${status}: ${message}`)

  res.status(status).json({
    success: false,
    message: message,
    // Include error details hanya jika development mode
    ...(process.env.NODE_ENV === 'development' && { error: err })
  })
}

/**
 * FUNGSI: notFoundHandler
 * TUJUAN: Handle route yang tidak ditemukan (404)
 * NOTES: Middleware ini harus diletakkan SEBELUM errorHandler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} tidak ditemukan`)
  error.status = 404
  next(error)
}

/**
 * FUNGSI: corsConfig
 * TUJUAN: Konfigurasi CORS agar frontend bisa akses API
 * PENJELASAN:
 * - CORS = Cross-Origin Resource Sharing
 * - Harus dikonfigurasi agar browser allow request dari domain lain
 * - Frontend (localhost:5173) bisa akses Backend (localhost:5000)
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

/**
 * FUNGSI: requestLogger
 * TUJUAN: Log semua request untuk debugging
 */
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toLocaleString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
}

export default {
  errorHandler,
  notFoundHandler,
  corsConfig,
  requestLogger
}
