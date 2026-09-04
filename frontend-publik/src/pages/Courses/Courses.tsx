import { matakuliahPublicApi } from '@/api/matakuliah.api'
import { CourseCard } from '@/components/course/CourseCard'
import { SearchBox } from '@/components/ui/SearchBox'
import { LoadingCards, QueryState } from '@/components/ui/AsyncState'
import { useAsyncQuery } from '@/hooks/useAsync'
import './Courses.css'

export default function CoursesPage() {
  const courses = useAsyncQuery('public:courses', matakuliahPublicApi.getAll)
  return (
    <>
      <section className="courses-hero">
        <div className="courses-hero-image" />
        <div className="courses-hero-shade" />
        <div className="container courses-hero-content">
          <span className="eyebrow light">Koleksi pembelajaran</span>
          <h1>Mata kuliah</h1>
          <p>Pilih ruang belajar dan temukan materi pertemuan yang telah disusun oleh dosen.</p>
          <div className="courses-hero-divider" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
        </div>
      </section>
      <section className="section courses-catalog">
        <div className="container">
          <SearchBox />
          <div className="results-label">
            <span>{courses.data?.length ?? 0} mata kuliah tersedia</span>
            <span>Diurutkan A–Z</span>
          </div>
          {courses.isLoading ? (
            <LoadingCards />
          ) : (
            <QueryState error={courses.error} empty={!courses.data?.length}>
              <div className="card-grid">
                {courses.data?.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </div>
            </QueryState>
          )}
        </div>
      </section>
    </>
  )
}
