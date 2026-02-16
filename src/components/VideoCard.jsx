// ====================================================================
// KOMPONEN: VIDEO CARD - Kartu video individual
// ====================================================================
// Fungsi: Menampilkan thumbnail video dengan informasi dasar
// Props: Menerima data video (title, duration, views, dll)
export function VideoCard({ video, onPlay }) {
  // Format views count
  const formatViews = (views) => {
    if (typeof views === 'number') {
      if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
      if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
      return views.toString()
    }
    return views || '0'
  }

  return (
    <div className="video-card">
      {/* Thumbnail - gambar video */}
      <div className="video-thumbnail">
        <div style={{ fontSize: '3em', textAlign: 'center', lineHeight: '100px' }}>
          {video.thumbnail}
        </div>
        <div className="video-duration">{video.duration || '0:00'}</div>
        <div className="video-hover-play" onClick={() => onPlay(video)}>
          ▶️
        </div>
      </div>

      {/* Video info */}
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-channel">{video.channel}</p>
        <div className="video-stats">
          {/* Menampilkan views, likes, dan tanggal upload */}
          <span>{formatViews(video.views)} views</span>
          <span>•</span>
          <span>{video.date || 'Recently-added'}</span>
        </div>
      </div>
    </div>
  )
}

export default VideoCard
