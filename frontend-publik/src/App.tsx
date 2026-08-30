import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { jadwalPublicApi } from '@/api/jadwal.api'
import { matakuliahPublicApi } from '@/api/matakuliah.api'
import { materiPublicApi } from '@/api/materi.api'
import { searchApi } from '@/api/search.api'
import type { Jadwal, Matakuliah, MateriListItem } from '@/types/domain.types'
import { ParticleField } from '@/components/ParticleField'

type IconName = 'arrow' | 'book' | 'calendar' | 'clock' | 'file' | 'grid' | 'home' | 'map' | 'menu' | 'search' | 'x'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    x: <><path d="m6 6 12 12M18 6 6 18"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Brand() {
  return <Link to="/" className="brand" aria-label="RetDiary beranda"><span className="brand-mark"><span /></span><span>Ret<span>Diary</span></span></Link>
}

function SearchBox({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const clean = query.trim()
    if (clean) navigate(`/search?q=${encodeURIComponent(clean)}`)
  }
  return <form className={compact ? 'nav-search' : 'big-search'} onSubmit={submit} role="search">
    <Icon name="search" size={compact ? 17 : 20} />
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari mata kuliah atau materi..." aria-label="Cari mata kuliah atau materi" />
    {!compact && <button type="submit" aria-label="Mulai pencarian"><Icon name="arrow" size={19} /></button>}
  </form>
}

function PublicLayout() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled((current) => current ? window.scrollY > 10 : window.scrollY > 32)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return <div className="site-shell">
    <header className={scrolled ? 'site-header is-scrolled' : 'site-header'}><div className="nav-wrap">
      <Brand />
      <nav className={open ? 'main-nav open' : 'main-nav'} aria-label="Navigasi utama" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setOpen(false) }}>
        <NavLink to="/" end><Icon name="home" size={17} />Beranda</NavLink>
        <NavLink to="/matakuliah"><Icon name="book" size={17} />Mata Kuliah</NavLink>
        <NavLink to="/jadwal"><Icon name="calendar" size={17} />Jadwal</NavLink>
        <NavLink to="/tentang">Tentang</NavLink>
        <div className="mobile-search"><SearchBox compact /></div>
      </nav>
      <SearchBox compact />
      <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Buka menu" aria-expanded={open}><Icon name={open ? 'x' : 'menu'} /></button>
    </div></header>
    <main key={location.pathname}><Outlet /></main>
    <Footer />
  </div>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-inner">
    <div><Brand /><p>Ruang belajar digital untuk materi perkuliahan<br />Program Studi Perkebunan Politeknik Negeri Lampung.</p></div>
    <div className="footer-links"><Link to="/matakuliah">Mata Kuliah</Link><Link to="/jadwal">Jadwal</Link><Link to="/tentang">Tentang</Link></div>
    <p className="copyright">© 2026 RetDiary. Dibuat untuk pembelajaran yang lebih terarah.</p>
  </div></footer>
}

function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="page-intro"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></div></section>
}

function LoadingCards() { return <div className="card-grid">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item}><i /><span /><span /></div>)}</div> }

function QueryState({ error, empty, children }: { error?: unknown; empty?: boolean; children: ReactNode }) {
  if (error) return <div className="state-card"><span>!</span><h3>Data belum dapat dimuat</h3><p>Pastikan layanan RetDiary aktif, lalu muat ulang halaman.</p></div>
  if (empty) return <div className="state-card"><span>○</span><h3>Belum ada data</h3><p>Konten akan tampil setelah ditambahkan oleh dosen.</p></div>
  return <>{children}</>
}

function HomePage() {
  const courses = useQuery({ queryKey: ['courses'], queryFn: matakuliahPublicApi.getAll })
  const schedules = useQuery({ queryKey: ['schedules'], queryFn: jadwalPublicApi.getAll })
  return <>
    <section className="hero-section">
      <ParticleField /><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
      <div className="hero-content"><div className="hero-kicker"><span />Catatan kuliah, tersusun rapi</div>
        <h1><span>Satu ruang</span><span>untuk setiap</span><em>proses belajar.</em></h1>
        <p>Temukan mata kuliah, buka materi, dan pantau jadwal perkuliahan dalam satu ruang belajar yang sederhana.</p>
        <div className="hero-actions"><Link to="/matakuliah" className="button primary">Jelajahi materi <Icon name="arrow" size={18} /></Link><Link to="/jadwal" className="button ghost"><Icon name="calendar" size={18} />Lihat jadwal</Link></div>
        <div className="hero-note"><span className="avatars"><i>R</i><i>D</i><i>+</i></span><span><strong>{courses.data?.length ?? '—'} mata kuliah</strong><small>tersedia untuk dipelajari</small></span></div>
      </div><div className="hero-scroll">GULIR UNTUK MENJELAJAHI <span /></div>
    </section>
    <section className="section courses-section" id="materi"><div className="container">
      <div className="section-heading"><div><span className="eyebrow">Jelajahi ruang belajar</span><h2>Mata kuliah terbaru</h2><p>Materi pilihan untuk menemani proses belajarmu.</p></div><Link to="/matakuliah" className="text-link">Lihat semua <Icon name="arrow" size={17} /></Link></div>
      {courses.isLoading ? <LoadingCards /> : <QueryState error={courses.error} empty={!courses.data?.length}><div className="card-grid">{courses.data?.slice(0, 6).map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div></QueryState>}
    </div></section>
    <section className="section schedule-teaser"><div className="container schedule-teaser-inner"><div><span className="eyebrow light">Jadwal pekan ini</span><h2>Datang siap,<br />pulang membawa paham.</h2><p>Cek waktu dan ruang kelas sebelum perkuliahan dimulai.</p><Link to="/jadwal" className="button light-button">Buka jadwal lengkap <Icon name="arrow" size={18} /></Link></div>
      <div className="mini-schedule">{(schedules.data ?? []).slice(0, 3).map((item, index) => <div className="mini-event" key={item.id}><span>0{index + 1}</span><div><small>{item.hari}, {item.jamMulai}</small><strong>{item.matakuliah?.nama}</strong><p><Icon name="map" size={14} /> {item.ruangan}</p></div></div>)}{!schedules.data?.length && <div className="mini-empty">Jadwal akan segera tersedia.</div>}</div>
    </div></section>
  </>
}

const palettes = ['mint', 'blue', 'amber', 'violet', 'rose', 'teal']
function CourseCard({ course, index = 0 }: { course: Matakuliah; index?: number }) {
  return <Link className="course-card" to={`/matakuliah/${course.id}`}><div className={`course-visual ${palettes[index % palettes.length]}`}><span className="course-code">{course.kode}</span><div className="visual-lines"><i /><i /><i /></div><Icon name={index % 2 ? 'grid' : 'book'} size={40} /></div><div className="course-body"><h3>{course.nama}</h3><p>{course.deskripsi || 'Materi pembelajaran tersusun untuk mendukung perkuliahan.'}</p><span>Jelajahi materi <Icon name="arrow" size={16} /></span></div></Link>
}

function CoursesPage() {
  const courses = useQuery({ queryKey: ['courses'], queryFn: matakuliahPublicApi.getAll })
  return <><PageIntro eyebrow="Koleksi pembelajaran" title="Mata kuliah"><span>Pilih ruang belajar dan temukan materi pertemuan yang telah disusun oleh dosen.</span></PageIntro><section className="section"><div className="container"><SearchBox /><div className="results-label"><span>{courses.data?.length ?? 0} mata kuliah tersedia</span><span>Diurutkan A–Z</span></div>
    {courses.isLoading ? <LoadingCards /> : <QueryState error={courses.error} empty={!courses.data?.length}><div className="card-grid">{courses.data?.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div></QueryState>}
  </div></section></>
}

function CourseDetailPage() {
  const { id = '' } = useParams()
  const course = useQuery({ queryKey: ['course', id], queryFn: () => matakuliahPublicApi.getById(id), enabled: Boolean(id) })
  const materials = useQuery({ queryKey: ['materials', id], queryFn: () => materiPublicApi.getAllByMatakuliah(id, 1, 50), enabled: Boolean(id) })
  return <><section className="detail-hero"><div className="container"><Link to="/matakuliah" className="back-link">← Semua mata kuliah</Link><span className="eyebrow">{course.data?.kode ?? 'Mata kuliah'}</span><h1>{course.data?.nama ?? (course.isLoading ? 'Memuat...' : 'Mata kuliah')}</h1><p>{course.data?.deskripsi}</p><div className="detail-meta"><span><Icon name="book" />{materials.data?.meta.total ?? 0} materi</span><span><Icon name="file" />Konten, foto & PDF</span></div></div></section><section className="section"><div className="container narrow"><div className="section-heading"><div><span className="eyebrow">Daftar pertemuan</span><h2>Materi pembelajaran</h2></div></div>
    {materials.isLoading ? <LoadingCards /> : <QueryState error={course.error || materials.error} empty={!materials.data?.data.length}><div className="material-list">{materials.data?.data.map((material) => <MaterialRow key={material.id} material={material} />)}</div></QueryState>}
  </div></section></>
}

function MaterialRow({ material }: { material: MateriListItem }) {
  const kinds = [material.konten && 'Catatan', material.pdfUrl && 'PDF', material.fotoMateri?.length && 'Foto'].filter(Boolean)
  return <Link to={`/materi/${material.id}`} className="material-row"><span className="material-number">{String(material.urutan).padStart(2, '0')}</span><div><small>Pertemuan {material.urutan}</small><h3>{material.judul}</h3><p>{kinds.length ? kinds.join(' · ') : 'Materi perkuliahan'}</p></div><span className="round-arrow"><Icon name="arrow" size={18} /></span></Link>
}

function MaterialDetailPage() {
  const { id = '' } = useParams()
  const material = useQuery({ queryKey: ['material', id], queryFn: () => materiPublicApi.getById(id), enabled: Boolean(id) })
  const recommendation = useQuery({ queryKey: ['recommendation', id], queryFn: () => materiPublicApi.getRekomendasi(id), enabled: Boolean(id) })
  const data = material.data
  return <><section className="article-head"><div className="container narrow"><Link to={data?.matakuliah ? `/matakuliah/${data.matakuliah.id}` : '/matakuliah'} className="back-link">← Kembali ke mata kuliah</Link><span className="eyebrow">Pertemuan {data?.urutan ?? '—'}</span><h1>{data?.judul ?? (material.isLoading ? 'Memuat materi...' : 'Materi')}</h1><p>{data?.matakuliah?.nama}</p></div></section><section className="section article-section"><div className="container article-layout"><article className="article-card">
    {material.error && <QueryState error={material.error}><span /></QueryState>}
    {data?.konten && <div className="article-copy">{data.konten.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}
    {!!data?.fotoMateri?.length && <div className="photo-grid">{data.fotoMateri.map((photo) => <img key={photo.id} src={photo.urlFoto} alt={`Dokumentasi ${data.judul}`} />)}</div>}
    {data?.pdfUrl && <a className="pdf-card" href={data.pdfUrl} target="_blank" rel="noreferrer"><Icon name="file" size={28} /><span><strong>Buka materi PDF</strong><small>Dokumen akan dibuka di tab baru</small></span><Icon name="arrow" /></a>}
    {data && !data.konten && !data.pdfUrl && !data.fotoMateri?.length && <QueryState empty><span /></QueryState>}
  </article><aside className="article-aside"><div><small>MATA KULIAH</small><strong>{data?.matakuliah?.nama ?? '—'}</strong></div><div><small>FORMAT TERSEDIA</small><p>{[data?.konten && 'Catatan', data?.pdfUrl && 'PDF', data?.fotoMateri?.length && 'Foto'].filter(Boolean).join(', ') || '—'}</p></div></aside></div>
    {recommendation.data?.rekomendasi && <div className="container narrow next-material"><span>Materi selanjutnya</span><Link to={`/materi/${recommendation.data.rekomendasi.id}`}><div><small>Pertemuan {recommendation.data.rekomendasi.urutan}</small><h3>{recommendation.data.rekomendasi.judul}</h3></div><Icon name="arrow" /></Link></div>}
  </section></>
}

const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
function SchedulePage() {
  const schedules = useQuery({ queryKey: ['schedules'], queryFn: jadwalPublicApi.getAll })
  const byDay = dayOrder.map((day) => ({ day, items: (schedules.data ?? []).filter((item) => item.hari === day) })).filter((group) => group.items.length)
  return <><PageIntro eyebrow="Agenda perkuliahan" title="Jadwal kuliah"><span>Lihat waktu, ruang, dan mata kuliah dalam tampilan mingguan yang mudah dipindai.</span></PageIntro><section className="section"><div className="container">
    {schedules.isLoading ? <LoadingCards /> : <QueryState error={schedules.error} empty={!schedules.data?.length}><div className="schedule-board">{byDay.map((group) => <div className="day-column" key={group.day}><div className="day-title"><span>{group.day.slice(0, 3).toUpperCase()}</span><strong>{group.day}</strong></div>{group.items.map((item, index) => <ScheduleCard key={item.id} item={item} index={index} />)}</div>)}</div></QueryState>}
  </div></section></>
}

function ScheduleCard({ item, index }: { item: Jadwal; index: number }) {
  return <div className={`schedule-card tone-${index % 3}`}><span className="schedule-time"><Icon name="clock" size={15} />{item.jamMulai}—{item.jamSelesai}</span><h3>{item.matakuliah?.nama}</h3><small>{item.matakuliah?.kode}</small><p><Icon name="map" size={14} />{item.ruangan}</p></div>
}

function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const results = useQuery({ queryKey: ['search', query], queryFn: () => searchApi.search(query), enabled: Boolean(query) })
  const count = (results.data?.matakuliah.length ?? 0) + (results.data?.materi.length ?? 0)
  return <><PageIntro eyebrow="Pencarian" title="Temukan yang kamu butuhkan"><span>Cari berdasarkan nama mata kuliah, kode, atau judul materi.</span></PageIntro><section className="section search-results"><div className="container narrow"><SearchBox />
    {query && <p className="search-summary">{results.isLoading ? 'Mencari...' : `${count} hasil untuk “${query}”`}</p>}
    {!query && <div className="state-card"><Icon name="search" size={30} /><h3>Mulai pencarian</h3><p>Ketik kata kunci pada kolom di atas.</p></div>}
    <QueryState error={results.error} empty={Boolean(query && !results.isLoading && count === 0)}><div className="search-groups">
      {!!results.data?.matakuliah.length && <section><h2>Mata kuliah <span>{results.data.matakuliah.length}</span></h2>{results.data.matakuliah.map((course) => <Link className="search-item" to={`/matakuliah/${course.id}`} key={course.id}><span className="search-icon"><Icon name="book" /></span><div><small>{course.kode}</small><h3>{course.nama}</h3><p>{course.deskripsi}</p></div><Icon name="arrow" /></Link>)}</section>}
      {!!results.data?.materi.length && <section><h2>Materi <span>{results.data.materi.length}</span></h2>{results.data.materi.map((item) => <Link className="search-item" to={`/materi/${item.id}`} key={item.id}><span className="search-icon"><Icon name="file" /></span><div><small>{item.matakuliah?.nama} · Pertemuan {item.urutan}</small><h3>{item.judul}</h3></div><Icon name="arrow" /></Link>)}</section>}
    </div></QueryState>
  </div></section></>
}

function AboutPage() {
  return <><PageIntro eyebrow="Tentang RetDiary" title="Belajar tanpa kehilangan arah."><span>RetDiary menyatukan materi dan jadwal perkuliahan dalam pengalaman yang tenang, ringkas, dan mudah diakses.</span></PageIntro><section className="section"><div className="container about-grid"><div className="about-statement"><span>“</span><h2>Catatan yang baik bukan hanya menyimpan informasi—ia membantu kita menemukan kembali sebuah pemahaman.</h2></div><div className="about-values"><div><Icon name="book" /><h3>Materi terstruktur</h3><p>Setiap materi dikelompokkan per mata kuliah dan urutan pertemuan.</p></div><div><Icon name="search" /><h3>Mudah ditemukan</h3><p>Pencarian tersedia di setiap halaman untuk akses yang lebih cepat.</p></div><div><Icon name="calendar" /><h3>Jadwal terpusat</h3><p>Waktu dan ruang kelas tersaji dalam satu agenda mingguan.</p></div></div></div></section></>
}

function NotFoundPage() { return <section className="not-found"><span>404</span><h1>Halaman tidak ditemukan</h1><p>Sepertinya catatan yang kamu cari tidak ada di sini.</p><Link className="button primary" to="/">Kembali ke beranda</Link></section> }

export default function App() {
  return <Routes><Route element={<PublicLayout />}><Route index element={<HomePage />} /><Route path="matakuliah" element={<CoursesPage />} /><Route path="matakuliah/:id" element={<CourseDetailPage />} /><Route path="materi/:id" element={<MaterialDetailPage />} /><Route path="jadwal" element={<SchedulePage />} /><Route path="search" element={<SearchPage />} /><Route path="tentang" element={<AboutPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
