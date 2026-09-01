import { Link } from 'react-router-dom'
import { jadwalPublicApi } from '@/api/jadwal.api'
import { matakuliahPublicApi } from '@/api/matakuliah.api'
import { ParticleField } from '@/components/ParticleField'
import { CourseCard } from '@/components/course/CourseCard'
import { Icon } from '@/components/ui/Icon'
import { LoadingCards, QueryState } from '@/components/ui/AsyncState'
import { useAsyncQuery } from '@/hooks/useAsync'
import './Home.css'

export default function HomePage() {
  const courses = useAsyncQuery('public:courses', matakuliahPublicApi.getAll)
  const schedules = useAsyncQuery('public:schedules', jadwalPublicApi.getAll)
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
