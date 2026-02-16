// ====================================================================
// KOMPONEN: HEADER - Navigasi utama platform streaming
// ====================================================================
// Fungsi: Menampilkan logo, menu navigasi, search bar, dan user profile
import { useState } from 'react'

export function Header({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Fungsi untuk handle pencarian video
  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    onSearch(searchQuery)
  }

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <span className="logo-icon">▶️</span>
        <span className="logo-text">StreamHub</span>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <a href="#" className="nav-item active">Beranda</a>
        <a href="#" className="nav-item">Trending</a>
        <a href="#" className="nav-item">Kategori</a>
        <a href="#" className="nav-item">Langganan</a>
      </nav>

      {/* Search Bar - Input pencarian */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Cari video..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">🔍</button>
      </form>

      {/* User Profile */}
      <div className="user-profile">
        <span className="notification-icon">🔔</span>
        <div className="profile-avatar">👤</div>
      </div>
    </header>
  )
}

export default Header
