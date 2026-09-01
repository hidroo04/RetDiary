import { Link, useParams } from 'react-router-dom'
import { materiPublicApi } from '@/api/materi.api'
import { LearningHero } from '@/components/hero/LearningHero'
import { Icon } from '@/components/ui/Icon'
import { QueryState } from '@/components/ui/AsyncState'
import { LazyPdfViewer } from '@/components/pdf/LazyPdfViewer'
import { useAsyncQuery } from '@/hooks/useAsync'
import './MaterialDetail.css'

export default function MaterialDetailPage() {
  const { id = '' } = useParams()
  const material = useAsyncQuery(`public:material:${id}`, () => materiPublicApi.getById(id), [id], Boolean(id))
  const recommendation = useAsyncQuery(`public:recommendation:${id}`, () => materiPublicApi.getRekomendasi(id), [id], Boolean(id))
  const data = material.data
  const courseUrl = data?.matakuliah ? `/matakuliah/${data.matakuliah.id}` : '/matakuliah'
  const heroImage = data?.thumbnailUrl || data?.matakuliah?.thumbnailUrl

  return <><LearningHero eyebrow={`Pertemuan ${data?.urutan ?? '—'}`} title={data?.judul ?? (material.isLoading ? 'Memuat materi...' : 'Materi')} description={data?.matakuliah?.nama} image={heroImage} backTo={courseUrl} backLabel="Kembali ke mata kuliah">
    {data?.konten && <span>Catatan</span>}{data?.pdfUrl && <span><Icon name="file" />PDF</span>}{Boolean(data?.fotoMateri?.length) && <span>{data?.fotoMateri.length} foto</span>}
  </LearningHero><section className="section article-section"><div className="container material-window"><article className="article-card material-card">
    {Boolean(material.error) && <QueryState error={material.error}><span /></QueryState>}
    {data?.konten && <div className="article-copy">{data.konten.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}
    {!!data?.fotoMateri?.length && <div className="photo-grid">{data.fotoMateri.map((photo) => <img key={photo.id} src={photo.urlFoto} alt={`Dokumentasi ${data.judul}`} loading="lazy" />)}</div>}
    {data?.pdfUrl && <LazyPdfViewer url={data.pdfUrl} title={data.judul} />}
    {data && !data.konten && !data.pdfUrl && !data.fotoMateri?.length && <QueryState empty><span /></QueryState>}
  </article></div>
    {recommendation.data?.rekomendasi && <div className="container next-material material-next"><span>Materi selanjutnya</span><Link to={`/materi/${recommendation.data.rekomendasi.id}`}><div><small>Pertemuan {recommendation.data.rekomendasi.urutan}</small><h3>{recommendation.data.rekomendasi.judul}</h3></div><Icon name="arrow" /></Link></div>}
  </section></>
}
