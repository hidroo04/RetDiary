import type { ReactNode } from 'react'

export function LoadingCards() {
  return (
    <div className="card-grid">
      {[1, 2, 3].map((item) => (
        <div className="skeleton-card" key={item}>
          <i />
          <span />
          <span />
        </div>
      ))}
    </div>
  )
}

export function QueryState({
  error,
  empty,
  children,
}: {
  error?: unknown
  empty?: boolean
  children: ReactNode
}) {
  if (error)
    return (
      <div className="state-card">
        <span>!</span>
        <h3>Data belum dapat dimuat</h3>
        <p>Pastikan layanan RetDiary aktif, lalu muat ulang halaman.</p>
      </div>
    )
  if (empty)
    return (
      <div className="state-card">
        <span>○</span>
        <h3>Belum ada data</h3>
        <p>Konten akan tampil setelah ditambahkan oleh dosen.</p>
      </div>
    )
  return <>{children}</>
}
