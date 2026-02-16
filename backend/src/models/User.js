// ========================================================================
// FILE: User.js (Mongoose Model)
// FUNGSI: Define struktur dan validasi data User di MongoDB
// PENJELASAN:
// - User schema untuk profile, authentication, preferences
// - Include password hashing dengan bcrypt
// - Virtual untuk computed fields
// ========================================================================

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * USER SCHEMA - Mendefinisikan struktur document user
 * 
 * Field breakdown:
 * - name: Nama user
 * - email: Email unik untuk login & contact
 * - password: Password di-hash dengan bcrypt
 * - avatar: URL avatar atau emoji
 * - bio: Biography singkat
 * - subscribers: Berapa orang subscribe ke channel user
 * - subscribedChannels: Array channel ID yang di-subscribe
 * - watchlist: Array video ID yang di-bookmark
 * - isVerified: Email sudah diverifikasi?
 * - isAdmin: User adalah admin?
 * - createdAt: Timestamp saat register
 * - updatedAt: Timestamp saat diupdate
 */
const userSchema = new mongoose.Schema(
  {
    // ========== BASIC INFO ==========
    name: {
      type: String,
      required: [true, 'Nama harus diisi'],
      minlength: [2, 'Nama minimal 2 karakter'],
      maxlength: [100, 'Nama maksimal 100 karakter'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email harus diisi'],
      unique: [true, 'Email sudah terdaftar'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Format email tidak valid'
      ],
      index: true // Index untuk faster login lookup
    },

    password: {
      type: String,
      required: [true, 'Password harus diisi'],
      minlength: [6, 'Password minimal 6 karakter'],
      select: false // Jangan include password saat query by default
    },

    // ========== PROFILE INFO ==========
    avatar: {
      type: String,
      default: '👤' // Default emoji
    },

    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio maksimal 500 karakter']
    },

    // ========== SOCIAL INFO ==========
    subscribers: {
      type: Number,
      default: 0,
      min: 0
    },

    subscribedChannels: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },

    // ========== PREFERENCES ==========
    watchlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Video',
      default: []
    },

    // Saved/liked videos (untuk rating & recommendations)
    likedVideos: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Video',
      default: []
    },

    // Watch history (untuk resume watching)
    watchHistory: [
      {
        videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Video'
        },
        watchedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // ========== STATUS ==========
    isVerified: {
      type: Boolean,
      default: false // Email belum diverifikasi
    },

    isAdmin: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true // Account active atau suspended
    },

    // ========== SECURITY ==========
    lastLogin: {
      type: Date,
      default: null
    },

    passwordChangedAt: {
      type: Date,
      default: null
    },

    passwordResetToken: {
      type: String,
      select: false
    },

    passwordResetExpires: {
      type: Date,
      select: false
    },

    // ========== METADATA (Auto-generated) ==========
  },
  {
    timestamps: true, // Auto add createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/**
 * INDEXES - Optimize queries
 */
userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })

/**
 * METHODS - Custom methods
 */

/**
 * Method: comparePassword()
 * Tujuan: Compare input password dengan hashed password
 * Usage: const isMatch = await user.comparePassword(inputPassword)
 * Return: Boolean
 */
userSchema.methods.comparePassword = async function (inputPassword) {
  try {
    // bcrypt.compare(plaintext, hash) return boolean
    return await bcrypt.compare(inputPassword, this.password)
  } catch (error) {
    throw new Error('Error comparing password')
  }
}

/**
 * Method: addToWatchlist()
 * Tujuan: Tambah video ke watchlist
 * Usage: await user.addToWatchlist(videoId)
 */
userSchema.methods.addToWatchlist = async function (videoId) {
  // Cek apakah sudah ada di watchlist
  if (!this.watchlist.includes(videoId)) {
    this.watchlist.push(videoId)
    return await this.save()
  }
  throw new Error('Video sudah ada di watchlist')
}

/**
 * Method: removeFromWatchlist()
 * Tujuan: Hapus video dari watchlist
 */
userSchema.methods.removeFromWatchlist = async function (videoId) {
  const index = this.watchlist.indexOf(videoId)
  if (index !== -1) {
    this.watchlist.splice(index, 1)
    return await this.save()
  }
  throw new Error('Video tidak ada di watchlist')
}

/**
 * Method: subscribeChannel()
 * Tujuan: Subscribe ke channel/creator
 */
userSchema.methods.subscribeChannel = async function (channelId) {
  if (!this.subscribedChannels.includes(channelId)) {
    this.subscribedChannels.push(channelId)
    return await this.save()
  }
  throw new Error('Sudah subscribe channel ini')
}

/**
 * Method: unsubscribeChannel()
 * Tujuan: Unsubscribe dari channel
 */
userSchema.methods.unsubscribeChannel = async function (channelId) {
  const index = this.subscribedChannels.indexOf(channelId)
  if (index !== -1) {
    this.subscribedChannels.splice(index, 1)
    return await this.save()
  }
  throw new Error('Belum subscribe channel ini')
}

/**
 * Method: addToWatchHistory()
 * Tujuan: Add/update video yang sedang ditonton
 */
userSchema.methods.addToWatchHistory = async function (videoId) {
  // Remove jika sudah ada (untuk update timestamp)
  this.watchHistory = this.watchHistory.filter(h => !h.videoId.equals(videoId))
  
  // Add ke awal dengan timestamp sekarang
  this.watchHistory.unshift({
    videoId,
    watchedAt: new Date()
  })
  
  // Limit history ke 50 items
  if (this.watchHistory.length > 50) {
    this.watchHistory = this.watchHistory.slice(0, 50)
  }
  
  return await this.save()
}

/**
 * STATICS - Static methods
 */

/**
 * Static: findByEmail()
 * Tujuan: Find user by email dengan password included (untuk login)
 * Usage: const user = await User.findByEmail(email)
 */
userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email }).select('+password')
}

/**
 * Static: generateResetToken()
 * Tujuan: Generate random token untuk reset password
 * Usage: const token = User.generateResetToken()
 */
userSchema.statics.generateResetToken = function () {
  // Generate random string 32 characters
  return require('crypto').randomBytes(16).toString('hex')
}

/**
 * VIRTUALS
 */

/**
 * Virtual: fullProfile
 * Tujuan: Get complete user profile untuk client
 */
userSchema.virtual('fullProfile').get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    subscribers: this.subscribers,
    isVerified: this.isVerified,
    joinedAt: this.createdAt
  }
})

/**
 * HOOKS - Auto hash password sebelum save
 */

/**
 * Pre-save: Hash password jika berubah
 */
userSchema.pre('save', async function (next) {
  // Hash password HANYA jika password berubah atau baru
  if (!this.isModified('password')) {
    return next()
  }

  try {
    // Generate salt (round 10 = balanced security & speed)
    // PENTING: Convert BCRYPT_ROUNDS ke number karena process.env adalah string
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
    const salt = await bcrypt.genSalt(rounds)
    
    // Hash password dengan salt
    this.password = await bcrypt.hash(this.password, salt)
    
    // Set passwordChangedAt jika bukan password baru
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000 // -1000 untuk account token timing
    }
    
    next()
  } catch (error) {
    next(error)
  }
})

/**
 * Pre-save: Trim whitespace
 */
userSchema.pre('save', function (next) {
  if (this.name) this.name = this.name.trim()
  if (this.bio) this.bio = this.bio.trim()
  next()
})

/**
 * Post-save: Log user baru
 */
userSchema.post('save', function (doc) {
  if (doc.isNew) {
    console.log(`👤 New user registered: ${doc.email}`)
  }
})

// Jangan tampilkan sensitive fields di default query
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.passwordResetToken
  delete obj.passwordResetExpires
  return obj
}

const User = mongoose.model('User', userSchema)

export default User
