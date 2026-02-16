// ========================================================================
// FILE: database.js
// FUNGSI: Menyimpan data dummy (mock database) dan konfigurasi
// PENJELASAN:
// - Dalam aplikasi real, ini akan terhubung ke database seperti MongoDB/PostgreSQL
// - Untuk pembelajaran, kita gunakan data dalam memori (array object)
// - Setiap reload server, data akan reset (normal untuk mock)
// ========================================================================

import { v4 as uuidv4 } from 'uuid'

// ==================== MOCK DATABASE VIDEOS ====================
// Menyimpan semua data video dalam bentuk array
export const videosDatabase = [
  {
    id: uuidv4(),
    title: 'Belajar JavaScript ES6 Terbaru',
    description: 'Tutorial lengkap JavaScript ES6 dengan contoh-contoh praktis dan mudah dipahami',
    channel: 'Code Master',
    channelId: 'channel-001',
    thumbnail: '🎬',
    duration: '38:45',
    views: '125400',
    likes: '5200',
    rating: 4.8,
    date: '2 hari yang lalu',
    uploadDate: new Date('2026-02-14'),
    category: 'Coding',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Pelajari ES6 features seperti arrow functions, destructuring, async/await, dan lebih banyak lagi'
  },
  {
    id: uuidv4(),
    title: 'Web Design untuk Pemula',
    description: 'Pelajari fundamental web design dari color theory hingga responsive layout',
    channel: 'Design Hub',
    channelId: 'channel-002',
    thumbnail: '🎨',
    duration: '52:10',
    views: '87200',
    likes: '3400',
    rating: 4.7,
    date: '4 hari yang lalu',
    uploadDate: new Date('2026-02-12'),
    category: 'Design',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Panduan lengkap web design mencakup UI/UX, typography, color palette, dan layout principles'
  },
  {
    id: uuidv4(),
    title: 'Node.js Backend Development',
    description: 'Buat backend profesional dengan Node.js dan Express.js',
    channel: 'Dev Bootcamp',
    channelId: 'channel-003',
    thumbnail: '⚙️',
    duration: '1:15:30',
    views: '203800',
    likes: '8900',
    rating: 4.9,
    date: '1 minggu yang lalu',
    uploadDate: new Date('2026-02-09'),
    category: 'Coding',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Lengkapi skill backend Anda dengan Node.js, API development, authentication, dan database integration'
  },
  {
    id: uuidv4(),
    title: 'CSS Animation Tricks',
    description: 'Trik-trik CSS animation untuk membuat website lebih interaktif',
    channel: 'Creative Code',
    channelId: 'channel-004',
    thumbnail: '✨',
    duration: '28:05',
    views: '95600',
    likes: '4100',
    rating: 4.6,
    date: '3 hari yang lalu',
    uploadDate: new Date('2026-02-13'),
    category: 'Design',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Pelajari keyframes, transitions, transforms, dan create amazing animations dengan CSS pure'
  },
  {
    id: uuidv4(),
    title: 'Database SQL untuk Developers',
    description: 'Kuasai SQL dari dasar hingga query kompleks',
    channel: 'Data Academy',
    channelId: 'channel-005',
    thumbnail: '🗄️',
    duration: '1:05:20',
    views: '156300',
    likes: '7200',
    rating: 4.8,
    date: '5 hari yang lalu',
    uploadDate: new Date('2026-02-11'),
    category: 'Coding',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Dari SELECT sederhana hingga JOIN kompleks, pahami SQL secara mendalam'
  },
  {
    id: uuidv4(),
    title: 'DevOps dan Docker Fundamentals',
    description: 'Pelajari containerization dan deployment dengan Docker',
    channel: 'Cloud Masters',
    channelId: 'channel-006',
    thumbnail: '☁️',
    duration: '1:32:15',
    views: '245700',
    likes: '10800',
    rating: 4.9,
    date: '1 minggu yang lalu',
    uploadDate: new Date('2026-02-09'),
    category: 'Coding',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Docker, containers, images, compose, dan deploy aplikasi dengan confidence'
  },
  {
    id: uuidv4(),
    title: 'Digital Marketing Strategy 2026',
    description: 'Strategi marketing digital yang proven dan hasil-driven',
    channel: 'Marketing Pro',
    channelId: 'channel-007',
    thumbnail: '📱',
    duration: '45:30',
    views: '67800',
    likes: '2500',
    rating: 4.5,
    date: '6 hari yang lalu',
    uploadDate: new Date('2026-02-10'),
    category: 'Marketing',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'SEO, social media marketing, content strategy, dan analytics untuk hasil maksimal'
  },
  {
    id: uuidv4(),
    title: 'Startup Mindset Workshop',
    description: 'Mindset dan skill yang perlu dimiliki entrepreneur modern',
    channel: 'Business Academy',
    channelId: 'channel-008',
    thumbnail: '🚀',
    duration: '39:45',
    views: '45200',
    likes: '1800',
    rating: 4.4,
    date: '1 minggu yang lalu',
    uploadDate: new Date('2026-02-09'),
    category: 'Business',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Dari idea validation hingga product market fit, semua yang perlu tahu untuk startup Anda'
  }
]

// ==================== MOCK DATABASE USERS ====================
// Menyimpan data user yang sudah register
export const usersDatabase = [
  {
    id: uuidv4(),
    name: 'John Developer',
    email: 'john@example.com',
    password: 'hashed_password_123', // Dalam real app, harus di-hash dengan bcrypt
    avatar: '👨‍💻',
    bio: 'Full Stack Developer | React & Node.js Enthusiast',
    subscribers: 1250,
    subscribedChannels: ['channel-001', 'channel-003'],
    watchlist: [],
    joinDate: new Date('2025-01-15')
  },
  {
    id: uuidv4(),
    name: 'Sarah Designer',
    email: 'sarah@example.com',
    password: 'hashed_password_456',
    avatar: '👩‍🎨',
    bio: 'UI/UX Designer | CSS Wizard',
    subscribers: 850,
    subscribedChannels: ['channel-002', 'channel-004'],
    watchlist: [],
    joinDate: new Date('2025-03-22')
  },
  {
    id: uuidv4(),
    name: 'Mike Student',
    email: 'mike@example.com',
    password: 'hashed_password_789',
    avatar: '👨‍🎓',
    bio: 'Learning web development | Always curious',
    subscribers: 42,
    subscribedChannels: [],
    watchlist: [],
    joinDate: new Date('2026-01-10')
  }
]

// ==================== CONFIG CONSTANTS ====================
// Konfigurasi dan konstanta global
export const config = {
  // Port server (bisa override dari .env)
  PORT: process.env.PORT || 5000,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Pagination default
  ITEMS_PER_PAGE: 12,
  
  // Max file upload size
  MAX_FILE_SIZE: 500 * 1024 * 1024 // 500MB
}

// ==================== HELPER FUNCTIONS ====================

/**
 * FUNGSI: findVideoById
 * TUJUAN: Mencari video berdasarkan ID
 * PARAMETER: id (string) - Video ID yang dicari
 * RETURN: Object video atau undefined jika tidak ditemukan
 */
export const findVideoById = (id) => {
  return videosDatabase.find(video => video.id === id)
}

/**
 * FUNGSI: findVideosByCategory
 * TUJUAN: Mencari semua video dalam kategori tertentu
 * PARAMETER: category (string) - Nama kategori
 * RETURN: Array video yang sesuai kategori
 */
export const findVideosByCategory = (category) => {
  return videosDatabase.filter(video => video.category === category)
}

/**
 * FUNGSI: searchVideos
 * TUJUAN: Mencari video berdasarkan query (title atau description)
 * PARAMETER: query (string) - Kata kunci pencarian
 * RETURN: Array video yang cocok dengan query
 */
export const searchVideos = (query) => {
  const lowerQuery = query.toLowerCase()
  return videosDatabase.filter(video =>
    video.title.toLowerCase().includes(lowerQuery) ||
    video.description.toLowerCase().includes(lowerQuery) ||
    video.channel.toLowerCase().includes(lowerQuery)
  )
}

/**
 * FUNGSI: findUserById
 * TUJUAN: Mencari user berdasarkan ID
 * PARAMETER: id (string) - User ID
 * RETURN: Object user atau undefined
 */
export const findUserById = (id) => {
  return usersDatabase.find(user => user.id === id)
}

/**
 * FUNGSI: findUserByEmail
 * TUJUAN: Mencari user berdasarkan email (untuk login)
 * PARAMETER: email (string) - Email user
 * RETURN: Object user atau undefined
 */
export const findUserByEmail = (email) => {
  return usersDatabase.find(user => user.email === email)
}

/**
 * FUNGSI: addVideo
 * TUJUAN: Menambah video baru ke database
 * PARAMETER: videoData (object) - Data video
 * RETURN: Object video yang baru dibuat
 */
export const addVideo = (videoData) => {
  const newVideo = {
    id: uuidv4(),
    ...videoData,
    uploadDate: new Date(),
    views: '0',
    likes: '0',
    rating: 0
  }
  videosDatabase.push(newVideo)
  return newVideo
}

/**
 * FUNGSI: addUser
 * TUJUAN: Menambah user baru ke database
 * PARAMETER: userData (object) - Data user
 * RETURN: Object user yang baru dibuat
 */
export const addUser = (userData) => {
  const newUser = {
    id: uuidv4(),
    ...userData,
    subscribers: 0,
    subscribedChannels: [],
    watchlist: [],
    joinDate: new Date()
  }
  usersDatabase.push(newUser)
  return newUser
}

/**
 * FUNGSI: updateVideo
 * TUJUAN: Update data video yang sudah ada
 * PARAMETER: id (string), updates (object) - Data yang diupdate
 * RETURN: Updated video atau null jika tidak ditemukan
 */
export const updateVideo = (id, updates) => {
  const video = findVideoById(id)
  if (!video) return null
  Object.assign(video, updates)
  return video
}

/**
 * FUNGSI: deleteVideo
 * TUJUAN: Hapus video dari database
 * PARAMETER: id (string) - Video ID
 * RETURN: true jika berhasil, false jika tidak ditemukan
 */
export const deleteVideo = (id) => {
  const index = videosDatabase.findIndex(video => video.id === id)
  if (index === -1) return false
  videosDatabase.splice(index, 1)
  return true
}

export default {
  videosDatabase,
  usersDatabase,
  config,
  findVideoById,
  findVideosByCategory,
  searchVideos,
  findUserById,
  findUserByEmail,
  addVideo,
  addUser,
  updateVideo,
  deleteVideo
}
