// ====================================================================
// KOMPONEN: PLAYBACK MODAL - Modal untuk memutar video
// ====================================================================
// Fungsi: Menampilkan video player dalam modal ketika pengguna klik video
export function PlaybackModal({ video, onClose }) {
  if (!video) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal content - jangan close saat user klik di sini */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-video">
          <video controls autoPlay>
            <source src={video.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} type="video/mp4" />
          </video>
        </div>

        <div className="modal-info">
          <h2>{video.title}</h2>
          <div className="modal-stats">
            <span>👁️ {video.views || 0} views</span>
            <span>⭐ {video.rating || 4.8} rating</span>
            <span>👤 {video.channel}</span>
          </div>
          <p className="modal-description">
            {video.description || 'Video pembelajaran profesional. Materi disusun secara sistematis untuk pemula hingga intermediate level. Dilengkapi dengan contoh kode dan project praktis.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlaybackModal
