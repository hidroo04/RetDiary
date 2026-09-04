import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const MAX_PAGE_WIDTH = 900
const PAGE_GAP = 28
const PAGE_OVERSCAN = 1

// Streaming dinonaktifkan agar disableAutoFetch bekerja dan PDF.js meminta byte
// yang diperlukan saja melalui HTTP Range Request.
const PDF_OPTIONS = {
  disableAutoFetch: true,
  disableStream: true,
  rangeChunkSize: 64 * 1024,
}

interface VirtualPdfDocumentProps {
  fileUrl: string
  title: string
}

export default function VirtualPdfDocument({ fileUrl, title }: VirtualPdfDocumentProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [containerWidth, setContainerWidth] = useState(800)
  const [viewportHeight, setViewportHeight] = useState(720)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateViewportSize = () => {
      setContainerWidth(viewport.clientWidth)
      setViewportHeight(viewport.clientHeight)
    }

    updateViewportSize()
    const observer = new ResizeObserver(updateViewportSize)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Canvas yang dilepas akan dikosongkan oleh react-pdf. Cleanup tambahan
      // ini membebaskan resource PDF.js yang tidak lagi digunakan. Unmount pada
      // Document juga memanggil loadingTask.destroy(), yang membatalkan request
      // internal PDF.js melalui AbortController.
      const pdfDocument = pdfDocumentRef.current
      pdfDocumentRef.current = null
      void pdfDocument?.cleanup().catch(() => undefined)
    }
  }, [])

  const pageWidth = Math.min(Math.max(containerWidth - 32, 1), MAX_PAGE_WIDTH)
  const estimatedPageHeight = Math.round(pageWidth * Math.SQRT2)
  const pageSlotHeight = estimatedPageHeight + PAGE_GAP
  const currentPage = Math.min(Math.floor(scrollTop / pageSlotHeight) + 1, totalPages || 1)
  const firstVisiblePage = Math.max(1, Math.floor(scrollTop / pageSlotHeight) + 1 - PAGE_OVERSCAN)
  const lastVisiblePage = Math.min(
    totalPages,
    Math.ceil((scrollTop + viewportHeight) / pageSlotHeight) + PAGE_OVERSCAN,
  )

  // Daftar ini hanya berisi halaman di sekitar viewport, bukan seluruh PDF.
  const visiblePages = useMemo(() => {
    const visiblePageCount = Math.max(0, lastVisiblePage - firstVisiblePage + 1)
    return Array.from({ length: visiblePageCount }, (_, index) => firstVisiblePage + index)
  }, [firstVisiblePage, lastVisiblePage])

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const nextScrollTop = event.currentTarget.scrollTop
    if (animationFrameRef.current !== null) return

    animationFrameRef.current = requestAnimationFrame(() => {
      setScrollTop(nextScrollTop)
      animationFrameRef.current = null
    })
  }

  const handleLoadSuccess = (pdfDocument: PDFDocumentProxy) => {
    pdfDocumentRef.current = pdfDocument
    setTotalPages(pdfDocument.numPages)
  }

  return (
    <>
      <div className="pdf-page-indicator" aria-live="polite">
        {totalPages > 0 ? `Halaman ${currentPage} dari ${totalPages}` : 'Menyiapkan dokumen...'}
      </div>
      <div
        ref={viewportRef}
        className="pdf-document"
        aria-label={`Isi PDF ${title}`}
        onScroll={handleScroll}
      >
        <Document
          file={fileUrl}
          options={PDF_OPTIONS}
          loading={<p className="pdf-status">Memuat dokumen...</p>}
          error={
            <p className="pdf-status pdf-status-error">Dokumen PDF tidak dapat ditampilkan.</p>
          }
          onLoadSuccess={handleLoadSuccess}
        >
          <div className="pdf-virtual-pages" style={{ height: totalPages * pageSlotHeight }}>
            {visiblePages.map((pageNumber) => (
              <figure
                className="pdf-page"
                key={pageNumber}
                style={{
                  height: estimatedPageHeight,
                  top: (pageNumber - 1) * pageSlotHeight,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  devicePixelRatio={Math.min(window.devicePixelRatio || 1, 1.5)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<div className="pdf-page-loading">Memuat halaman {pageNumber}...</div>}
                />
                <figcaption>
                  Halaman {pageNumber} dari {totalPages}
                </figcaption>
              </figure>
            ))}
          </div>
        </Document>
      </div>
      <p className="pdf-memory-note">
        Hanya halaman yang terlihat yang dirender untuk menghemat memori.
      </p>
    </>
  )
}
