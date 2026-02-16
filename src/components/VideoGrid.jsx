// ====================================================================
// KOMPONEN: VIDEO GRID - Grid yang menampilkan banyak video
// ====================================================================
// Fungsi: Menampilkan kumpulan video dalam format grid responsive
import { useState, useEffect } from 'react'
import { getAllVideos, getVideosByCategory, searchVideos } from '../services/videos'
import VideoCard from './VideoCard'

export function VideoGrid({ onPlayVideo, selectedCategory, searchQuery }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch videos saat component mount atau filter berubah
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true)
        setError(null)

        let fetchedVideos = []

        // Jika ada search query, gunakan search
        if (searchQuery && searchQuery.trim()) {
          console.log('Searching for:', searchQuery)
          fetchedVideos = await searchVideos(searchQuery)
        }
        // Jika ada kategori terpilih (bukan "Semua")
        else if (selectedCategory && selectedCategory !== 'Semua') {
          console.log('Filtering by category:', selectedCategory)
          fetchedVideos = await getVideosByCategory(selectedCategory)
        }
        // Jika tidak ada filter, ambil semua video
        else {
          console.log('Loading all videos')
          fetchedVideos = await getAllVideos()
        }

        setVideos(fetchedVideos)
      } catch (err) {
        console.error('Error loading videos:', err)
        setError('Gagal memuat video. Pastikan backend sedang berjalan.')
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [selectedCategory, searchQuery])

  // Loading state
  if (loading) {
    return (
      <div className="video-grid">
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
          <p>⏳ Memuat video...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="video-grid">
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#dc3545' }}>
          <p>❌ {error}</p>
          <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
            Backend tidak berjalan? Jalankan: <code>npm run dev</code> di folder backend
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="video-grid">
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
          <p>📭 Tidak ada video ditemukan</p>
        </div>
      </div>
    )
  }

  // Render video grid
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video._id || video.id} video={video} onPlay={onPlayVideo} />
      ))}
    </div>
  )
}

export default VideoGrid
