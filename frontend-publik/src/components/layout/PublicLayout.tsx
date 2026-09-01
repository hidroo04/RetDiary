import { Link, Outlet, useLocation } from 'react-router-dom'
import { Brand } from './Brand'
import { Navbar } from './Navbar'

function Footer() {
  return <footer className="site-footer"><div className="footer-inner">
    <div><Brand /><p>Ruang belajar digital untuk materi perkuliahan<br />Program Studi Perkebunan Politeknik Negeri Lampung.</p></div>
    <div className="footer-links"><Link to="/matakuliah">Mata Kuliah</Link><Link to="/jadwal">Jadwal</Link><Link to="/tentang">Tentang</Link></div>
    <p className="copyright">© 2026 RetDiary. Dibuat untuk pembelajaran yang lebih terarah.</p>
  </div></footer>
}

export function PublicLayout() {
  const location = useLocation()
  const hasFeatureHero = location.pathname === '/' || location.pathname.startsWith('/matakuliah') || location.pathname.startsWith('/materi/') || location.pathname === '/jadwal'

  return <div className={hasFeatureHero ? 'site-shell feature-hero-page' : 'site-shell'}>
    <Navbar />
    <main key={location.pathname}><Outlet /></main>
    <Footer />
  </div>
}
