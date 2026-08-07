import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import Login from '@/pages/Login/Login'

// Dummy component untuk placeholder sementara (menunggu desain)
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>Halaman ini sedang dalam tahap pengembangan (Menunggu Desain).</p>
  </div>
)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes (Butuh Login) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Placeholder title="Dashboard Admin (Layout Utama)" />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Placeholder title="Dashboard" />} />
        <Route path="matakuliah" element={<Placeholder title="Kelola Matakuliah" />} />
        <Route path="materi" element={<Placeholder title="Kelola Materi" />} />
        <Route path="jadwal" element={<Placeholder title="Kelola Jadwal" />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<Placeholder title="404 - Halaman Tidak Ditemukan" />} />
    </Routes>
  )
}

export default App
