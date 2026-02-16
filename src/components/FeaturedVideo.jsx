// ====================================================================
// KOMPONEN: FEATURED VIDEO - Video unggulan di bagian atas
// ====================================================================
// Fungsi: Menampilkan video featured dengan deskripsi dan tombol aksi
import { useState, useEffect } from 'react'
import { getFeaturedVideos } from '../services/videos'

export function FeaturedVideo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [featuredVideo, setFeaturedVideo] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch featured video saat component mount
  useEffect(() => {
    const loadFeaturedVideo = async () => {
      try {
        setLoading(true)
        const video = await getFeaturedVideos()
        if (video) {
          setFeaturedVideo(video)
        }
      } catch (error) {
        console.error('Error loading featured video:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedVideo()
  }, [])

  if (loading) {
    return (
      <div className="featured-video">
        <div className="featured-backdrop" style={{ textAlign: 'center', padding: '50px' }}>
          <p>⏳ Loading featured video...</p>
        </div>
      </div>
    )
  }

  if (!featuredVideo) {
    return (
      <div className="featured-video">
        <div className="featured-backdrop" style={{ textAlign: 'center', padding: '50px' }}>
          <p>❌ No featured video available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="featured-video">
      {/* Background video/thumbnail */}
      <div className="featured-backdrop">
        {isPlaying ? (
          <div className="video-player">
            <video controls autoPlay>
              <source src={featuredVideo.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div className="featured-thumbnail">
            <div className="play-button" onClick={() => setIsPlaying(true)}>
              ▶️
            </div>
          </div>
        )}
      </div>

      {/* Featured content info */}
      <div className="featured-content">
        <h2 className="featured-title">{featuredVideo.title || 'Featured Video'}</h2>
        <div className="featured-meta">
          <span className="badge">{featuredVideo.category || 'FEATURED'}</span>
          <span className="duration">{featuredVideo.duration || '0:00'}</span>
          <span className="rating">⭐ {featuredVideo.rating || '4.9'}</span>
        </div>
        <p className="featured-description">
          {featuredVideo.description || 'Kualitas video premium dengan konten pembelajaran terbaik.'}
        </p>
        <div className="featured-actions">
          <button className="btn-play" onClick={() => setIsPlaying(true)}>▶️ Tonton Sekarang</button>
          <button className="btn-add">➕ Tambah ke Watchlist</button>
        </div>
      </div>
    </div>
  )
}

export default FeaturedVideo
