// ========================================================================
// FILE: seedAdmin.js
// FUNGSI: Create a default admin user for testing
// USAGE: node src/scripts/seedAdmin.js
// ========================================================================

import dotenv from 'dotenv'
import { connectDatabase } from '../../config/mongoConnect.js'
import User from '../../models/User.js'

dotenv.config()

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@streamhub.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123'
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Administrator'

async function seedAdmin() {
  try {
    await connectDatabase()

    const existing = await User.findOne({ email: ADMIN_EMAIL })
    if (existing) {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`)
      process.exit(0)
    }

    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isAdmin: true,
      isVerified: true
    })

    await admin.save()

    console.log('✅ Admin user created:')
    console.log(`   email: ${ADMIN_EMAIL}`)
    console.log(`   password: ${ADMIN_PASSWORD}`)
    process.exit(0)
  } catch (err) {
    console.error('Failed to create admin user:', err)
    process.exit(1)
  }
}

seedAdmin()
