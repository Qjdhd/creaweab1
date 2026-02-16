// ========================================================================
// FILE: mongoConnect.js
// FUNGSI: Setup dan connect ke MongoDB menggunakan Mongoose
// PENJELASAN:
// - Mongoose = ODM (Object Document Mapper) untuk MongoDB
// - Menangani connection pooling dan error handling
// - Setup schema validation dan data type checking
// ========================================================================

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streamhub'
const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * FUNGSI: connectDatabase
 * TUJUAN: Establish connection ke MongoDB server
 * RETURN: Promise yang resolve dengan connection object
 * 
 * NOTES:
 * - Connection pooling = reuse connections untuk efficiency
 * - Automatic reconnection = auto reconnect jika connection drop
 * - Validation = data harus sesuai schema sebelum disimpan
 */
export const connectDatabase = async () => {
  try {
    // Attempt connection ke MongoDB
    const conn = await mongoose.connect(MONGODB_URI, {
      // Options configuration
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Connection pooling
      maxPoolSize: 11,           // Max 11 connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Auto reconnection
      autoIndex: true,
      retryWrites: true
    })

    console.log(`
╔════════════════════════════════════════════════════════╗
║          ✅ MongoDB Connected Successfully ✅          ║
╚════════════════════════════════════════════════════════╝

📊 Connection Details:
   • Host: ${conn.connection.host}
   • Port: ${conn.connection.port}
   • Database: ${conn.connection.db.databaseName}
   • Environment: ${NODE_ENV}

`)
    return conn
  } catch (error) {
    console.error(`
╔════════════════════════════════════════════════════════╗
║          ❌ MongoDB Connection Failed ❌               ║
╚════════════════════════════════════════════════════════╝

⚠️  Error Details:
   ${error.message}

🔧 Troubleshooting Steps:
   1. Make sure MongoDB server is running
      • Windows: mongod (atau MongoDB Service)
      • Mac: brew services start mongodb-community
      • Linux: systemctl start mongod
   
   2. Check MONGODB_URI in .env file
      URL Pattern: mongodb://localhost:27017/dbname
   
   3. For MongoDB Atlas (cloud):
      URL Pattern: mongodb+srv://user:password@cluster.mongodb.net/dbname
   
   4. Verify connection string:
      Current URI: ${MONGODB_URI}

`)
    process.exit(1)
  }
}

/**
 * FUNGSI: disconnectDatabase
 * TUJUAN: Graceful disconnect dari MongoDB (cleanup)
 * RETURN: Promise
 * 
 * NOTES:
 * - Gunakan saat shutdown server atau testing
 * - Close semua connections secara proper
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect()
    console.log('✅ MongoDB disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message)
    process.exit(1)
  }
}

/**
 * FUNGSI: getConnection
 * TUJUAN: Get current MongoDB connection object
 * RETURN: Current mongoose connection
 */
export const getConnection = () => {
  return mongoose.connection
}

/**
 * EVENT: Connection events untuk monitoring
 */
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB')
})

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectDatabase()
  process.exit(0)
})

export default {
  connectDatabase,
  disconnectDatabase,
  getConnection
}
