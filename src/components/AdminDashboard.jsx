// ========================================================================
// FILE: src/components/AdminDashboard.jsx
// FUNGSI: Main admin dashboard with tabs for user and video management
// ========================================================================

import { useState, useEffect } from 'react'
import { logoutUser, getStoredUser } from '../services/auth.js'
import { getAdminStats } from '../services/admin.js'
import AdminUserManagement from './AdminUserManagement'
import AdminVideoManagement from './AdminVideoManagement'
import '../styles/AdminDashboard.css'

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = getStoredUser()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getAdminStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    onLogout()
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <span>⚙️</span>
          <h1>StreamHub Admin Panel</h1>
        </div>

        <div className="admin-user-info">
          <span className="user-emoji">👤</span>
          <span>{user?.name || 'Admin'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          className={`nav-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          📹 Video Management
        </button>
      </nav>

      {/* Main Content */}
      <main className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>📊 Dashboard Statistics</h2>
            
            {loading ? (
              <p>⏳ Loading statistics...</p>
            ) : stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalAdmins}</div>
                  <div className="stat-label">Total Admins</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalVideos}</div>
                  <div className="stat-label">Total Videos</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{(stats.totalViews / 1000).toFixed(1)}K</div>
                  <div className="stat-label">Total Views</div>
                </div>
              </div>
            ) : (
              <p>Error loading stats</p>
            )}

            <div className="dashboard-info">
              <h3>Welcome to Admin Panel</h3>
              <p>Manage users and videos from this dashboard.</p>
              <ul>
                <li>✅ Create, read, update, and delete users</li>
                <li>✅ Create, read, update, and delete videos</li>
                <li>✅ View system statistics and analytics</li>
                <li>✅ Manage user roles and permissions</li>
              </ul>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <AdminUserManagement onStatsUpdate={loadStats} />
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <AdminVideoManagement onStatsUpdate={loadStats} />
        )}
      </main>
    </div>
  )
}
