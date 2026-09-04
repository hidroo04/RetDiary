import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { materiPublicApi } from '@/api/materi.api'
import { LearningHero } from '@/components/hero/LearningHero'
import { Icon } from '@/components/ui/Icon'
import { QueryState } from '@/components/ui/AsyncState'
import { PdfViewer } from '@/components/pdf/PdfViewer'
import { useAsyncQuery } from '@/hooks/useAsync'
import './MaterialDetail.css'

export default function MaterialDetailPage() {
  const { id = '' } = useParams()
  const material = useAsyncQuery(
    `public:material:${id}`,
    () => materiPublicApi.getById(id),
    [id],
    Boolean(id),
  )
  const recommendation = useAsyncQuery(
    `public:recommendation:${id}`,
    () => materiPublicApi.getRekomendasi(id),
    [id],
    Boolean(id),
  )
  const data = material.data
  const nextMaterial = recommendation.data?.rekomendasi
  const courseUrl = data?.matakuliah ? `/matakuliah/${data.matakuliah.id}` : '/matakuliah'
  const heroImage = data?.thumbnailUrl || data?.matakuliah?.thumbnailUrl

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id])

  return (
    <>
      <LearningHero
        eyebrow={`Pertemuan ${data?.urutan ?? '—'}`}
        title={data?.judul ?? (material.isLoading ? 'Memuat materi...' : 'Materi')}
        description={data?.matakuliah?.nama}
        image={heroImage}
        backTo={courseUrl}
        backLabel="Kembali ke mata kuliah"
      >
        {data?.konten && <span>Catatan</span>}
        {data?.pdfUrl && (
          <span>
            <Icon name="file" />
            PDF
          </span>
        )}
        {Boolean(data?.fotoMateri?.length) && <span>{data?.fotoMateri.length} foto</span>}
      </LearningHero>
      <section className="section article-section">
        <div className="container material-window">
          <article className="article-card material-card">
            {Boolean(material.error) && (
              <QueryState error={material.error}>
                <span />
              </QueryState>
            )}
            {data?.konten && (
              <div className="article-copy">
                {data.konten.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
            {!!data?.fotoMateri?.length && (
              <div className="photo-grid">
                {data.fotoMateri.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.urlFoto}
                    alt={`Dokumentasi ${data.judul}`}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
            {data?.pdfUrl && (
              <PdfViewer fileUrl={data.pdfUrl} title={data.judul} thumbnailUrl={heroImage} />
            )}
            {data && !data.konten && !data.pdfUrl && !data.fotoMateri?.length && (
              <QueryState empty>
                <span />
              </QueryState>
            )}
          </article>
        </div>
        {data && (
          <nav className="container material-navigation" aria-label="Navigasi materi">
            {recommendation.isLoading ? (
              <div className="material-navigation-loading" role="status">
                Menyiapkan materi selanjutnya...
              </div>
            ) : nextMaterial ? (
              <Link
                className="material-next-button"
                aria-label={`Lanjut ke materi ${nextMaterial.judul}`}
                to={`/materi/${nextMaterial.id}`}
              >
                <span className="material-next-copy">
                  <small>Pertemuan {nextMaterial.urutan}</small>
                  <strong>{nextMaterial.judul}</strong>
                </span>
                <span className="material-next-action">
                  Lanjut ke materi selanjutnya
                  <Icon name="arrow" />
                </span>
              </Link>
            ) : (
              <Link className="material-next-button material-complete-button" to={courseUrl}>
                <span className="material-next-copy">
                  <small>Materi terakhir</small>
                  <strong>Semua materi telah selesai</strong>
                </span>
                <span className="material-next-action">
                  Kembali ke daftar materi
                  <Icon name="arrow" />
                </span>
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  )
}
