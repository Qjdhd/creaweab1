// ========================================================================
// FILE: App.jsx - UPDATED with Backend API Integration
// TUJUAN: Contoh implementasi frontend yang call backend REST API
// PETUNJUK: Ganti App.jsx yang lama dengan kode ini
// ========================================================================

import { useEffect, useState } from 'react'
import './App.css'

// ==================== CONFIG ====================
const API_URL = 'http://localhost:5000'

// ==================== HELPER: API CLIENT ====================
// Fungsi helper untuk fetch dengan error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })

    // Handle network errors
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// ==================== COMPONENTS ====================

/**
 * COMPONENT: Header
 * Menampilkan navigation bar dengan logo dan menu
 */
function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check jika user sudah login (token di localStorage)
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
      setUserName(JSON.parse(user).name)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    alert('Logout successful')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span>▶</span> StreamHub
        </div>
        <nav className="nav">
          {isLoggedIn ? (
            <>
              <span>Welcome, {userName}!</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <p style={{ margin: 0 }}>Not logged in</p>
          )}
        </nav>
      </div>
    </header>
  )
}

/**
 * COMPONENT: LoginModal
 * Form untuk user login
 */
function LoginModal({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState('john@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call backend login endpoint
      const result = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (result.success) {
        // Save tokens dan user data
        localStorage.setItem('accessToken', result.data.tokens.accessToken)
        localStorage.setItem('refreshToken', result.data.tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(result.data.user))

        alert('✅ Login successful!')
        onLoginSuccess()
        onClose()
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content login-modal">
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="hint">Demo: john@example.com / password123</p>
      </div>
    </div>
  )
}

/**
 * COMPONENT: FeaturedVideo
 * Video yang di-feature di halaman utama
 */
function FeaturedVideo({ video }) {
  if (!video) return <div>Loading featured video...</div>

  return (
    <section className="featured">
      <div className="featured-content">
        <div className="featured-info">
          <h1>{video.title}</h1>
          <p className="featured-description">{video.description}</p>
          <div className="featured-meta">
            <span>By: {video.channel}</span>
            <span>✓ {video.views?.toLocaleString()} views</span>
            <span>❤️ {video.likes?.length} likes</span>
          </div>
          <div className="featured-buttons">
            <button className="btn-primary">▶ Watch Now</button>
            <button className="btn-secondary">+ Add to Watchlist</button>
          </div>
        </div>
        <div className="featured-image">
          <div className="featured-placeholder">🎬</div>
        </div>
      </div>
    </section>
  )
}

/**
 * COMPONENT: VideoCard
 * Card untuk setiap video
 */
function VideoCard({ video, onLike, onAddToWatchlist }) {
  return (
    <div className="video-card">
      <div className="video-thumbnail">📹</div>
      <div className="video-info">
        <h3>{video.title}</h3>
        <p className="channel-name">{video.channel}</p>
        <div className="video-stats">
          <span>{video.views?.toLocaleString()} views</span>
          <span>•</span>
          <span>{video.likes?.length} likes</span>
        </div>
        <div className="video-category">
          <span>{video.category}</span>
        </div>
        <div className="video-actions">
          <button
            className="btn-small"
            onClick={() => onLike(video._id)}
            title="Like this video"
          >
            ❤️ Like
          </button>
          <button
            className="btn-small"
            onClick={() => onAddToWatchlist(video._id)}
            title="Add to watchlist"
          >
            📌 Save
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * COMPONENT: CategoryFilter
 * Navigation untuk filter by category
 */
function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const categories = [
    'All',
    'Coding',
    'Design',
    'Marketing',
    'Business',
    'Entertainment',
    'Tutorial',
    'Gaming'
  ]

  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => onCategoryChange(cat === 'All' ? null : cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

/**
 * COMPONENT: VideoGrid
 * Grid untuk menampilkan video-video
 */
function VideoGrid({ videos, loading, error, onLike, onAddToWatchlist }) {
  if (loading) {
    return <div className="loading">⏳ Loading videos...</div>
  }

  if (error) {
    return <div className="error">❌ Error: {error}</div>
  }

  if (videos.length === 0) {
    return <div className="no-videos">No videos found</div>
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
          onLike={onLike}
          onAddToWatchlist={onAddToWatchlist}
        />
      ))}
    </div>
  )
}

// ==================== MAIN APP COMPONENT ====================

export default function App() {
  // State Management
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // ==================== EFFECTS ====================

  // Effect 1: Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
  }, [])

  // Effect 2: Fetch videos from backend
  useEffect(() => {
    fetchVideos()
  }, [selectedCategory])

  // ==================== API FUNCTIONS ====================

  /**
   * FUNGSI: Fetch videos dari backend
   * Endpoint: GET /api/videos atau GET /api/videos/category/:cat
   */
  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build endpoint berdasarkan kategori yang dipilih
      let endpoint = '/api/videos?limit=12'
      if (selectedCategory) {
        endpoint = `/api/videos/category/${selectedCategory}?limit=12`
      }

      // Call backend
      const result = await apiCall(endpoint)

      if (result.success) {
        setVideos(result.data)
      } else {
        setError(result.message || 'Failed to load videos')
      }
    } catch (err) {
      setError('Error: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * FUNGSI: Like video
   * Endpoint: PATCH /api/videos/:id/like (require auth)
   */
  const handleLikeVideo = async (videoId) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      const result = await apiCall(`/api/videos/${videoId}/like`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (result.success) {
        alert('❤️ Video liked!')
        // Update local state
        setVideos(
          videos.map((v) =>
            v._id === videoId ? result.data : v
          )
        )
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  /**
   * FUNGSI: Add to watchlist
   * Endpoint: POST /api/users/:userId/watchlist (require auth)
   */
  const handleAddToWatchlist = async (videoId) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      const user = JSON.parse(localStorage.getItem('user'))

      const result = await apiCall(`/api/users/${user._id}/watchlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoId })
      })

      if (result.success) {
        alert('✅ Added to watchlist!')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  /**
   * FUNGSI: Handle login success
   */
  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    fetchVideos() // Refresh videos
  }

  // ==================== RENDER ====================

  return (
    <div className="app">
      <Header />

      <main className="container">
        {/* Featured Video Section */}
        {videos.length > 0 && (
          <FeaturedVideo video={videos[0]} />
        )}

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat)
          }}
        />

        {/* Login Button (if not logged in) */}
        {!isLoggedIn && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button
              className="btn-primary"
              onClick={() => setShowLoginModal(true)}
            >
              🔐 Login to Continue
            </button>
          </div>
        )}

        {/* Video Grid */}
        <VideoGrid
          videos={videos}
          loading={loading}
          error={error}
          onLike={handleLikeVideo}
          onAddToWatchlist={handleAddToWatchlist}
        />
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}
