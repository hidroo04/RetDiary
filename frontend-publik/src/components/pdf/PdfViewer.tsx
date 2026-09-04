import { lazy, Suspense, useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import './PdfViewer.css'

const VirtualPdfDocument = lazy(() => import('./VirtualPdfDocument'))

interface PdfViewerProps {
  fileUrl: string
  title: string
  thumbnailUrl?: string
}

export function PdfViewer({ fileUrl, title, thumbnailUrl }: PdfViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [fileUrl])

  return (
    <section className="pdf-viewer" aria-label={`Dokumen PDF ${title}`}>
      <header className="pdf-viewer-head">
        <span>
          <strong>Materi PDF</strong>
          <small>
            {isOpen
              ? 'PDF aktif · gulir di dalam viewer untuk membaca'
              : 'PDF baru dimuat setelah tombol pratinjau ditekan'}
          </small>
        </span>
        <span className="pdf-viewer-actions">
          <button type="button" onClick={() => setIsOpen((value) => !value)}>
            {isOpen ? 'Tutup PDF' : 'Buka PDF'}
          </button>
          <a href={fileUrl} target="_blank" rel="noreferrer">
            Buka penuh
          </a>
          <a href={fileUrl} download>
            Unduh PDF
          </a>
        </span>
      </header>

      {isOpen ? (
        <Suspense fallback={<p className="pdf-status">Menyiapkan PDF viewer...</p>}>
          <VirtualPdfDocument fileUrl={fileUrl} title={title} />
        </Suspense>
      ) : (
        <button
          type="button"
          className="pdf-placeholder"
          onClick={() => setIsOpen(true)}
          aria-label={`Buka pratinjau PDF ${title}`}
        >
          {thumbnailUrl && <img src={thumbnailUrl} alt="" loading="lazy" decoding="async" />}
          <span className="pdf-placeholder-overlay">
            <Icon name="file" size={34} />
            <strong>Buka pratinjau PDF</strong>
            <small>Dokumen belum dimuat untuk menghemat memori</small>
          </span>
        </button>
      )}
    </section>
  )
}
