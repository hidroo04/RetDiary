import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <span>404</span>
      <h1>Halaman tidak ditemukan</h1>
      <p>Sepertinya catatan yang kamu cari tidak ada di sini.</p>
      <Link className="button primary" to="/">
        Kembali ke beranda
      </Link>
    </section>
  )
}
