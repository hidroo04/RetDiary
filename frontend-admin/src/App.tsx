import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import Login from '@/pages/Login/Login'
import { AdminLayout } from '@/layouts/AdminLayout/AdminLayout'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Matakuliah from '@/pages/Matakuliah/Matakuliah'

// Dummy component untuk placeholder sementara (menunggu desain)
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>Halaman ini sedang dalam tahap pengembangan (Menunggu Desain).</p>
  </div>
)

// ProtectedRoute: Hanya bisa diakses jika sudah login (jika belum, redirect ke /login)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// GuestRoute: Hanya bisa diakses jika belum login (jika sudah login, langsung ke /)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token)
  if (token) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } 
      />
      
      {/* Protected Routes (Butuh Login) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Dashboard />} />
        <Route path="matakuliah" element={<Matakuliah />} />
        <Route path="materi" element={<Placeholder title="Kelola Materi" />} />
        <Route path="materi/tambah" element={<Placeholder title="Tambah Materi Baru" />} />
        <Route path="jadwal" element={<Placeholder title="Kelola Jadwal" />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<Placeholder title="404 - Halaman Tidak Ditemukan" />} />
    </Routes>
  )
}

export default App
