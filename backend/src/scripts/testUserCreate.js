// ========================================================================
// TEST SCRIPT: testUserCreate.js
// FUNGSI: Test create user with minimal data untuk debug Mongoose error
// ========================================================================

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streamhub'

async function testUserCreate() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ Connected to MongoDB')

    // Test data MINIMAL
    console.log('\n🧪 Test 1: Minimal user create')
    const testUser1 = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }
    
    console.log('📝 Data:', JSON.stringify(testUser1, null, 2))
    
    try {
      const user1 = await User.create(testUser1)
      console.log('✅ Success! User created:', user1.email)
    } catch (err) {
      console.error('❌ Error:', err.message)
      console.error('Full error:', err)
    }

    // Test data dengan avatar
    console.log('\n🧪 Test 2: User with avatar')
    const testUser2 = {
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123',
      avatar: '👨‍💻'
    }
    
    console.log('📝 Data:', JSON.stringify(testUser2, null, 2))
    
    try {
      const user2 = await User.create(testUser2)
      console.log('✅ Success! User created:', user2.email)
    } catch (err) {
      console.error('❌ Error:', err.message)
      console.error('Full error:', err)
    }

    // Test data dengan semua field
    console.log('\n🧪 Test 3: User with all fields')
    const testUser3 = {
      name: 'John Developer',
      email: 'john@example.com',
      password: 'password123',
      avatar: '👨‍💻',
      bio: 'Full Stack Developer | React & Node.js Enthusiast',
      isVerified: true,
      isAdmin: false
    }
    
    console.log('📝 Data:', JSON.stringify(testUser3, null, 2))
    
    try {
      const user3 = await User.create(testUser3)
      console.log('✅ Success! User created:', user3.email)
    } catch (err) {
      console.error('❌ Error:', err.message)
      console.error('Full error:', err)
    }

    console.log('\n✅ Test completed!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Connection error:', error.message)
    process.exit(1)
  }
}

testUserCreate()
