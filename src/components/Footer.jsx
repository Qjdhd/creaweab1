// ====================================================================
// KOMPONEN: FOOTER - Footer aplikasi
// ====================================================================
// Fungsi: Menampilkan informasi footer dan links
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2026 StreamHub. Semua hak dilindungi.</p>
        <div className="footer-links">
          <a href="#">Tentang Kami</a>
          <a href="#">Privasi</a>
          <a href="#">Syarat & Ketentuan</a>
          <a href="#">Hubungi Kami</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
