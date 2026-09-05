import { useCallback, useEffect, useRef, useState } from 'react'
import { materiPublicApi } from '@/api/materi.api'
import type { MateriPage, PdfStatus } from '@/types/domain.types'
import './PdfViewer.css'

interface PdfViewerProps {
  materiId: string
  fileUrl: string
  title: string
  status?: PdfStatus
  totalPages?: number
}

function PdfPageImage({
  page,
  totalPages,
  title,
}: {
  page: MateriPage
  totalPages: number
  title: string
}) {
  const figureRef = useRef<HTMLElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const figure = figureRef.current
    if (!figure) return
    const observer = new IntersectionObserver(([entry]) => setShouldLoad(entry.isIntersecting), {
      rootMargin: '1600px 0px',
    })
    observer.observe(figure)
    return () => observer.disconnect()
  }, [])

  return (
    <figure
      ref={figureRef}
      className="pdf-page"
      style={{ aspectRatio: `${page.width} / ${page.height}` }}
    >
      {shouldLoad && (
        <img
          src={page.imageUrl}
          width={page.width}
          height={page.height}
          alt={`${title}, halaman ${page.pageNumber}`}
          loading="lazy"
          decoding="async"
        />
      )}
      <figcaption>
        Halaman {page.pageNumber} dari {totalPages}
      </figcaption>
    </figure>
  )
}

export function PdfViewer({
  materiId,
  fileUrl,
  title,
  status = 'PENDING',
  totalPages = 0,
}: PdfViewerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const [pages, setPages] = useState<MateriPage[]>([])
  const [currentStatus, setCurrentStatus] = useState<PdfStatus>(status)
  const [knownTotal, setKnownTotal] = useState(totalPages)
  const [nextPage, setNextPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [error, setError] = useState('')

  const fetchBatch = useCallback(
    async (pageNumber: number, replace = false) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setError('')
      try {
        const response = await materiPublicApi.getPages(materiId, pageNumber, 6)
        setCurrentStatus(response.meta.status)
        setKnownTotal(response.meta.total)
        if (response.meta.status === 'READY') {
          setPages((existing) => {
            if (replace) return response.data
            const ids = new Set(existing.map((page) => page.id))
            return [...existing, ...response.data.filter((page) => !ids.has(page.id))]
          })
          setNextPage(pageNumber + 1)
          setHasNextPage(response.meta.hasNextPage)
        }
      } catch {
        setError('Halaman materi belum dapat dimuat. Silakan coba lagi.')
      } finally {
        loadingRef.current = false
      }
    },
    [materiId],
  )

  useEffect(() => {
    setPages([])
    setCurrentStatus(status)
    setKnownTotal(totalPages)
    setNextPage(1)
    setHasNextPage(true)
    void fetchBatch(1, true)
  }, [materiId, status, totalPages, fetchBatch])

  useEffect(() => {
    if (!['PENDING', 'PROCESSING'].includes(currentStatus)) return
    const timer = window.setInterval(() => void fetchBatch(1, true), 3_000)
    return () => window.clearInterval(timer)
  }, [currentStatus, fetchBatch])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || currentStatus !== 'READY' || !hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void fetchBatch(nextPage)
      },
      { rootMargin: '1200px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [currentStatus, fetchBatch, hasNextPage, nextPage])

  const statusText =
    currentStatus === 'FAILED'
      ? 'PDF gagal diproses. Pengelola dapat mencoba konversi ulang.'
      : 'PDF sedang disiapkan menjadi gambar. Halaman akan muncul otomatis.'

  return (
    <section className="pdf-viewer" aria-label={`Dokumen PDF ${title}`}>
      <header className="pdf-viewer-head">
        <span>
          <strong>Materi PDF</strong>
          <small>Gulir halaman website untuk membaca seluruh dokumen</small>
        </span>
        <span className="pdf-viewer-actions">
          <a href={fileUrl} download>
            Unduh PDF
          </a>
        </span>
      </header>

      {currentStatus === 'READY' ? (
        <div className="pdf-document">
          {pages.map((page) => (
            <PdfPageImage key={page.id} page={page} totalPages={knownTotal} title={title} />
          ))}
          <div ref={sentinelRef} className="pdf-page-sentinel" aria-hidden="true" />
          {hasNextPage && <p className="pdf-status">Memuat halaman berikutnya...</p>}
        </div>
      ) : (
        <p
          className={`pdf-status ${currentStatus === 'FAILED' ? 'pdf-status-error' : ''}`}
          role="status"
        >
          {error || statusText}
        </p>
      )}
    </section>
  )
}
