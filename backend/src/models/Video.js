// ========================================================================
// FILE: Video.js (Mongoose Model)
// FUNGSI: Define struktur dan validasi data Video di MongoDB
// PENJELASAN:
// - Schema = mendefinisikan structure dari document video
// - Model = interface untuk query dan manipulate dokumentasi
// - Timestamps = automatically add createdAt & updatedAt fields
// ========================================================================

import mongoose from 'mongoose'

/**
 * VIDEO SCHEMA - Mendefinisikan struktur document video
 * 
 * Field breakdown:
 * - title: Judul video (required, min 5 karakter)
 * - description: Deskripsi detail video
 * - channel: Nama channel/creator (required)
 * - channelId: Reference ke channel document
 * - thumbnail: URL gambar thumbnail
 * - duration: Durasi video (format HH:MM:SS)
 * - videoUrl: URL video file
 * - category: Kategori video
 * - rating: Rating 0-5 dari user
 * - views: Total view count (increment saat di-play)
 * - likes: Total likes count
 * - uploadedBy: User ID yang upload video (reference ke User)
 * - isPublished: Status publish (default: true)
 * - tags: Array tag untuk search/filter
 * - createdAt: Timestamp auto saat dibuat
 * - updatedAt: Timestamp auto saat diupdate
 */
const videoSchema = new mongoose.Schema(
  {
    // ========== BASIC INFO ==========
    title: {
      type: String,
      required: [true, 'Judul video harus diisi'],
      minlength: [5, 'Judul minimal 5 karakter'],
      maxlength: [200, 'Judul maksimal 200 karakter'],
      trim: true,
      index: true // Add index untuk faster search
    },

    description: {
      type: String,
      required: [true, 'Deskripsi harus diisi'],
      minlength: [10, 'Deskripsi minimal 10 karakter'],
      maxlength: [5000, 'Deskripsi maksimal 5000 karakter'],
      trim: true
    },

    // ========== CHANNEL/CREATOR INFO ==========
    channel: {
      type: String,
      required: [true, 'Channel name harus diisi'],
      trim: true
    },

    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference ke User model
      required: false
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference ke User yang upload
      required: [true, 'uploadedBy harus diisi']
    },

    // ========== MEDIA INFO ==========
    thumbnail: {
      type: String, // URL atau emoji placeholder
      default: '📹'
    },

    videoUrl: {
      type: String,
      required: [true, 'URL video harus diisi']
    },

    duration: {
      type: String,
      default: '0:00' // Format MM:SS atau HH:MM:SS
    },

    category: {
      type: String,
      enum: {
        values: ['Coding', 'Design', 'Marketing', 'Business', 'Entertainment', 'Tutorial', 'Gaming', 'Other'],
        message: 'Kategori tidak valid'
      },
      required: [true, 'Kategori harus dipilih'],
      index: true // Penting untuk filter by category
    },

    tags: {
      type: [String],
      default: []
    },

    // ========== ENGAGEMENT STATS ==========
    views: {
      type: Number,
      default: 0,
      min: 0
    },

    likes: {
      type: Number,
      default: 0,
      min: 0
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    comments: {
      type: Number,
      default: 0,
      min: 0
    },

    // ========== STATUS ==========
    isPublished: {
      type: Boolean,
      default: true,
      index: true // For find published videos only
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    // ========== METADATA (Auto-generated) ==========
  },
  {
    // Timestamps auto add createdAt & updatedAt
    timestamps: true,
    
    // Include virtuals when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/**
 * INDEXES - Untuk optimize database queries
 * - Compound index untuk sering diquery bersama
 */
videoSchema.index({ category: 1, isPublished: 1 })
videoSchema.index({ title: 'text', description: 'text', tags: 'text' }) // Text search

/**
 * METHODS - Custom methods pada video document
 */

/**
 * Method: incrementViews()
 * Tujuan: Increment view count dengan 1
 * Usage: const updatedVideo = await video.incrementViews()
 */
videoSchema.methods.incrementViews = async function () {
  this.views += 1
  return await this.save()
}

/**
 * Method: addLike()
 * Tujuan: Increment like count
 */
videoSchema.methods.addLike = async function () {
  this.likes += 1
  return await this.save()
}

/**
 * Method: removeLike()
 * Tujuan: Decrement like count (jika ada unlike)
 */
videoSchema.methods.removeLike = async function () {
  if (this.likes > 0) {
    this.likes -= 1
  }
  return await this.save()
}

/**
 * Method: updateRating()
 * Tujuan: Update rating berdasarkan reviews
 */
videoSchema.methods.updateRating = async function (newRating) {
  if (newRating >= 0 && newRating <= 5) {
    this.rating = newRating
    return await this.save()
  }
  throw new Error('Rating harus antara 0-5')
}

/**
 * STATICS - Custom static methods yang bisa dipanggil di model
 */

/**
 * Static: getTrendingVideos()
 * Tujuan: Get most popular videos (berdasarkan views & likes)
 * Usage: const trending = await Video.getTrendingVideos(5)
 */
videoSchema.statics.getTrendingVideos = async function (limit = 10) {
  return await this.find({ isPublished: true })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
}

/**
 * Static: getByCategory()
 * Tujuan: Get all videos dalam kategori tertentu
 * Usage: const codingVideos = await Video.getByCategory('Coding')
 */
videoSchema.statics.getByCategory = async function (category, limit = 12) {
  return await this.find({ category, isPublished: true })
    .sort({ createdAt: -1 })
    .limit(limit)
}

/**
 * Static: searchVideos()
 * Tujuan: Full-text search pada title, description, tags
 * Usage: const results = await Video.searchVideos('javascript')
 */
videoSchema.statics.searchVideos = async function (query) {
  return await this.find(
    { $text: { $search: query }, isPublished: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } })
}

/**
 * VIRTUALS - Computed properties yang tidak disimpan di database
 */

/**
 * Virtual: getViewsCount()
 * Tujuan: Format views menjadi string yang readable (125.4K, 1.2M)
 */
videoSchema.virtual('viewCount').get(function () {
  if (this.views >= 1000000) {
    return (this.views / 1000000).toFixed(1) + 'M'
  } else if (this.views >= 1000) {
    return (this.views / 1000).toFixed(1) + 'K'
  }
  return this.views.toString()
})

/**
 * HOOKS (Middleware) - Jalankan function sebelum/sesudah operation
 */

/**
 * Pre-save hook: Validate data sebelum disimpan
 */
videoSchema.pre('save', async function (next) {
  // Trim whitespace dari strings
  if (this.title) this.title = this.title.trim()
  if (this.description) this.description = this.description.trim()
  next()
})

/**
 * Post-save hook: Log saat video baru dibuat
 */
videoSchema.post('save', function (doc) {
  if (doc.isNew) {
    console.log(`📹 New video created: "${doc.title}"`)
  }
})

// Compile schema menjadi model
// Nama 'Video' akan auto plural di MongoDB menjadi 'videos' collection
const Video = mongoose.model('Video', videoSchema)

export default Video
