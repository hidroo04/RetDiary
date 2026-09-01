import { Icon } from '@/components/ui/Icon'
import { PageIntro } from '@/components/ui/PageIntro'
import './About.css'

export default function AboutPage() {
  return <><PageIntro eyebrow="Tentang RetDiary" title="Belajar tanpa kehilangan arah."><span>RetDiary menyatukan materi dan jadwal perkuliahan dalam pengalaman yang tenang, ringkas, dan mudah diakses.</span></PageIntro><section className="section"><div className="container about-grid"><div className="about-statement"><span>“</span><h2>Catatan yang baik bukan hanya menyimpan informasi—ia membantu kita menemukan kembali sebuah pemahaman.</h2></div><div className="about-values"><div><Icon name="book" /><h3>Materi terstruktur</h3><p>Setiap materi dikelompokkan per mata kuliah dan urutan pertemuan.</p></div><div><Icon name="search" /><h3>Mudah ditemukan</h3><p>Pencarian tersedia di setiap halaman untuk akses yang lebih cepat.</p></div><div><Icon name="calendar" /><h3>Jadwal terpusat</h3><p>Waktu dan ruang kelas tersaji dalam satu agenda mingguan.</p></div></div></div></section></>
}
