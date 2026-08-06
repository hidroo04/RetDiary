import { Routes, Route } from 'react-router-dom'

// Dummy component untuk placeholder sementara (menunggu desain)
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>Halaman Publik (Sisi Mahasiswa) - Menunggu Desain.</p>
  </div>
)

function App() {
  return (
    <Routes>
      {/* Layout Utama Mahasiswa */}
      <Route path="/" element={<Placeholder title="Layout Publik Mahasiswa" />}>
        {/* Beranda (Daftar Matakuliah) */}
        <Route index element={<Placeholder title="Beranda (Daftar Matakuliah)" />} />
        
        {/* Detail Matakuliah (Daftar Materi per Matakuliah) */}
        <Route path="matakuliah/:id" element={<Placeholder title="Detail Matakuliah" />} />
        
        {/* Detail Materi (Buka PDF, Foto, dll) */}
        <Route path="materi/:id" element={<Placeholder title="Detail Materi (PDF & Foto)" />} />
        
        {/* Jadwal Kuliah Publik */}
        <Route path="jadwal" element={<Placeholder title="Jadwal Perkuliahan" />} />
        
        {/* Hasil Pencarian */}
        <Route path="search" element={<Placeholder title="Hasil Pencarian" />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<Placeholder title="404 - Halaman Tidak Ditemukan" />} />
    </Routes>
  )
}

export default App
