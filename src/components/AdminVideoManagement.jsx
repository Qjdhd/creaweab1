// ========================================================================
// FILE: src/components/AdminVideoManagement.jsx
// FUNGSI: Video management CRUD interface
// ========================================================================

import { useState, useEffect } from 'react'
import {
  getAllVideosAdmin,
  getVideoByIdAdmin,
  createVideoAdmin,
  updateVideoAdmin,
  deleteVideoAdmin
} from '../services/admin.js'
import { getAllUsersAdmin } from '../services/admin.js'
import '../styles/AdminManagement.css'

export default function AdminVideoManagement({ onStatsUpdate }) {
  const [mode, setMode] = useState('view') // 'view' atau 'create'
  const [videos, setVideos] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Coding',
    duration: '0:00',
    thumbnail: '📹',
    videoUrl: '',
    uploadedBy: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')

  const categories = ['Coding', 'Design', 'Marketing', 'Business', 'Entertainment']

  useEffect(() => {
    loadVideos()
    loadUsers()
  }, [page, search, category])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllVideosAdmin(page, 10, search, category)
      setVideos(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await getAllUsersAdmin(1, 100)
      setUsers(data.data)
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const handleCreateVideo = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title || !formData.category || !formData.uploadedBy) {
      setFormError('Title, category, and uploader required')
      return
    }

    try {
      await createVideoAdmin(formData)
      setFormData({
        title: '',
        description: '',
        category: 'Coding',
        duration: '0:00',
        thumbnail: '📹',
        videoUrl: '',
        uploadedBy: ''
      })
      setMode('view')
      loadVideos()
      onStatsUpdate()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleUpdateVideo = async (e) => {
    e.preventDefault()
    setFormError('')

    try {
      await updateVideoAdmin(editingId, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration,
        thumbnail: formData.thumbnail,
        videoUrl: formData.videoUrl
      })
      setFormData({
        title: '',
        description: '',
        category: 'Coding',
        duration: '0:00',
        thumbnail: '📹',
        videoUrl: '',
        uploadedBy: ''
      })
      setEditingId(null)
      setMode('view')
      loadVideos()
      onStatsUpdate()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleEditVideo = async (videoId) => {
    try {
      const video = await getVideoByIdAdmin(videoId)
      setFormData({
        title: video.title,
        description: video.description,
        category: video.category,
        duration: video.duration,
        thumbnail: video.thumbnail,
        videoUrl: video.videoUrl,
        uploadedBy: video.uploadedBy?._id || ''
      })
      setEditingId(videoId)
      setMode('create')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      await deleteVideoAdmin(videoId)
      loadVideos()
      onStatsUpdate()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Coding',
      duration: '0:00',
      thumbnail: '📹',
      videoUrl: '',
      uploadedBy: ''
    })
    setEditingId(null)
    setMode('view')
    setFormError('')
  }

  return (
    <div className="management-container">
      <h2>📹 Video Management</h2>

      <div className="management-tabs">
        <button
          className={`tab-btn ${mode === 'view' ? 'active' : ''}`}
          onClick={() => { handleReset(); setMode('view') }}
        >
          📋 View Videos
        </button>
        <button
          className={`tab-btn ${mode === 'create' ? 'active' : ''}`}
          onClick={() => { handleReset(); setMode('create') }}
        >
          ➕ {editingId ? 'Edit Video' : 'Create Video'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {mode === 'create' && (
        <div className="form-section">
          <h3>{editingId ? '✏️ Edit Video' : '➕ Create New Video'}</h3>
          {formError && <div className="error-message">{formError}</div>}

          <form onSubmit={editingId ? handleUpdateVideo : handleCreateVideo}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Video title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Video description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="0:00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thumbnail</label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="📹"
                  maxLength={2}
                />
              </div>

              {!editingId && (
                <div className="form-group">
                  <label>Uploader *</label>
                  <select
                    value={formData.uploadedBy}
                    onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
                    required
                  >
                    <option value="">Select user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Video URL</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '💾 Update' : '✅ Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View/List Videos */}
      {mode === 'view' && (
        <div className="list-section">
          <div className="filter-box">
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="search-input"
            />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="category-filter"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <p>⏳ Loading videos...</p>
          ) : videos.length === 0 ? (
            <p>📭 No videos found</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Views</th>
                    <th>Uploader</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video._id}>
                      <td>{video.title}</td>
                      <td>{video.category}</td>
                      <td>{video.duration}</td>
                      <td>{video.views}</td>
                      <td>{video.uploadedBy?.name || 'N/A'}</td>
                      <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                      <td className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditVideo(video._id)}
                          title="Edit video"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteVideo(video._id)}
                          title="Delete video"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
