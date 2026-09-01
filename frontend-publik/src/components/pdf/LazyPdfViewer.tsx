import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import './LazyPdfViewer.css'

export function LazyPdfViewer({ url, title }: { url: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false)

  return <section className={`pdf-viewer lazy-pdf ${isLoaded ? 'is-loaded' : ''}`}>
    <div className="pdf-viewer-head">
      <span><Icon name="file" size={24} /><span><strong>Materi PDF</strong><small>{isLoaded ? 'Geser ke atas atau bawah untuk membaca dokumen' : 'Pratinjau dimuat hanya saat dibutuhkan agar halaman tetap ringan'}</small></span></span>
      <span className="pdf-viewer-actions">
        {isLoaded && <button type="button" className="pdf-unload-button" onClick={() => setIsLoaded(false)}>Tutup pratinjau</button>}
        <a href={url} target="_blank" rel="noreferrer">Buka penuh</a>
        <a href={url} download>Unduh PDF</a>
      </span>
    </div>
    {isLoaded ? (
      <iframe src={`${url}#view=FitH`} title={`PDF ${title}`} scrolling="yes" />
    ) : (
      <div className="lazy-pdf-placeholder">
        <span className="lazy-pdf-icon"><Icon name="file" size={34} /></span>
        <div><strong>PDF belum dimuat</strong><p>Dokumen tidak menggunakan memori browser sebelum kamu membukanya.</p></div>
        <button type="button" onClick={() => setIsLoaded(true)}>Tampilkan PDF</button>
      </div>
    )}
  </section>
}
