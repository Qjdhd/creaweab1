import './App.css'
import { useState, useEffect } from 'react'
import { isLoggedIn, isAdmin, logoutUser } from './services/auth.js'
import LoginPage from './components/LoginPage'
import AdminDashboard from './components/AdminDashboard'
import Header from './components/Header'
import FeaturedVideo from './components/FeaturedVideo'
import CategoryFilter from './components/CategoryFilter'
import VideoGrid from './components/VideoGrid'
import PlaybackModal from './components/PlaybackModal'
import Footer from './components/Footer'



// ====================================================================
// KOMPONEN UTAMA: App - Root component dengan routing
// ====================================================================
// Fungsi: Handle authentication dan routing ke admin atau user site
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn())
  const [isAdminUser, setIsAdminUser] = useState(isAdmin())

  // Check authentication on mount
  useEffect(() => {
    setIsAuthenticated(isLoggedIn())
    setIsAdminUser(isAdmin())
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setIsAdminUser(isAdmin())
  }

  const handleLogout = () => {
    logoutUser()
    setIsAuthenticated(false)
    setIsAdminUser(false)
  }

  // Show admin panel jika user sudah login dan adalah admin
  if (isAuthenticated && isAdminUser) {
    return <AdminDashboard onLogout={handleLogout} />
  }

  // Show login page jika belum login
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // Show user site (default)
  return <MyApp onLogout={handleLogout} />
}

// ====================================================================
// KOMPONEN: MyApp - User streaming interface
// ====================================================================
function MyApp({ onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingVideo, setPlayingVideo] = useState(null)

  // Fungsi handle saat user klik tombol kategori
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSearchQuery('') // Clear search saat filter kategori
    console.log('Filter kategori:', category)
  }

  // Fungsi handle saat user search
  const handleSearch = (query) => {
    setSearchQuery(query)
    setSelectedCategory('Semua') // Reset kategori saat search
  }

  // Fungsi handle saat user klik video untuk diputar
  const handlePlayVideo = (video) => {
    setPlayingVideo(video)
  }

  const handleCloseModal = () => {
    setPlayingVideo(null)
  }

  return (
    <div className="app">
      {/* Header dengan navigasi */}
      <Header onSearch={handleSearch} />

      <div className="app-body">
        {/* Featured video section */}
        <section className="featured-section">
          <FeaturedVideo />
        </section>

        {/* Category filter */}
        <section className="filter-section">
          <h2 className="section-title">Kategori</h2>
          <CategoryFilter onCategoryChange={handleCategoryChange} />
        </section>

        {/* Video grid - menampilkan daftar video */}
        <section className="content-section">
          <h2 className="section-title">
            {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Video Populer'}
          </h2>
          <VideoGrid 
            onPlayVideo={handlePlayVideo} 
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        </section>

        {/* Playback modal - muncul saat video dipilih */}
        <PlaybackModal video={playingVideo} onClose={handleCloseModal} />
      </div>

      {/* Footer component */}
      <Footer />
    </div>
  )
}