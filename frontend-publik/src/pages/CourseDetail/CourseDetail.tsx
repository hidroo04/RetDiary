import { Link, useParams } from 'react-router-dom'
import { matakuliahPublicApi } from '@/api/matakuliah.api'
import { materiPublicApi } from '@/api/materi.api'
import { LearningHero } from '@/components/hero/LearningHero'
import { Icon } from '@/components/ui/Icon'
import { LoadingCards, QueryState } from '@/components/ui/AsyncState'
import { useAsyncQuery } from '@/hooks/useAsync'
import type { MateriListItem } from '@/types/domain.types'
import './CourseDetail.css'

function MaterialRow({ material }: { material: MateriListItem }) {
  const kinds = [
    material.konten && 'Catatan',
    material.pdfUrl && 'PDF',
    material.fotoMateri?.length && 'Foto',
  ].filter(Boolean)
  return (
    <Link
      to={`/materi/${material.id}`}
      className={`material-row ${material.thumbnailUrl ? 'has-thumbnail' : ''}`}
    >
      {material.thumbnailUrl ? (
        <img className="material-thumbnail" src={material.thumbnailUrl} alt="" loading="lazy" />
      ) : (
        <span className="material-number">{String(material.urutan).padStart(2, '0')}</span>
      )}
      <div>
        <small>Pertemuan {material.urutan}</small>
        <h3>{material.judul}</h3>
        <p>{kinds.length ? kinds.join(' · ') : 'Materi perkuliahan'}</p>
      </div>
      <span className="round-arrow">
        <Icon name="arrow" size={18} />
      </span>
    </Link>
  )
}

export default function CourseDetailPage() {
  const { id = '' } = useParams()
  const course = useAsyncQuery(
    `public:course:${id}`,
    () => matakuliahPublicApi.getById(id),
    [id],
    Boolean(id),
  )
  const materials = useAsyncQuery(
    `public:materials:${id}`,
    () => materiPublicApi.getAllByMatakuliah(id, 1, 50),
    [id],
    Boolean(id),
  )
  const data = course.data
  return (
    <>
      <LearningHero
        eyebrow={data?.kode ?? 'Mata kuliah'}
        title={data?.nama ?? (course.isLoading ? 'Memuat...' : 'Mata kuliah')}
        description={
          data?.deskripsi || 'Materi perkuliahan tersusun rapi untuk membantu proses belajar.'
        }
        image={data?.thumbnailUrl}
        backTo="/matakuliah"
        backLabel="Semua mata kuliah"
      >
        <span>
          <Icon name="book" />
          {materials.data?.meta.total ?? 0} materi
        </span>
        <span>
          <Icon name="file" />
          Konten, foto & PDF
        </span>
      </LearningHero>
      <section className="section course-material-section">
        <div className="container course-material-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Daftar pertemuan</span>
              <h2>Materi pembelajaran</h2>
            </div>
          </div>
          {materials.isLoading ? (
            <LoadingCards />
          ) : (
            <QueryState
              error={course.error || materials.error}
              empty={!materials.data?.data.length}
            >
              <div className="material-list">
                {materials.data?.data.map((material) => (
                  <MaterialRow key={material.id} material={material} />
                ))}
              </div>
            </QueryState>
          )}
        </div>
      </section>
    </>
  )
}
