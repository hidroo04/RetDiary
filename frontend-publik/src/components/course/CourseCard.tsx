import { Link } from 'react-router-dom'
import type { Matakuliah } from '@/types/domain.types'
import { Icon } from '@/components/ui/Icon'

const palettes = ['mint', 'blue', 'amber', 'violet', 'rose', 'teal']

export function CourseVisual({
  course,
  index = 0,
  className = '',
}: {
  course?: Matakuliah
  index?: number
  className?: string
}) {
  const style = course?.thumbnailUrl
    ? { backgroundImage: `url("${course.thumbnailUrl}")` }
    : undefined
  return (
    <div
      className={`course-visual ${course?.thumbnailUrl ? 'has-image' : palettes[index % palettes.length]} ${className}`}
      style={style}
    >
      {course?.kode && <span className="course-code">{course.kode}</span>}
      {!course?.thumbnailUrl && (
        <>
          <div className="visual-lines">
            <i />
            <i />
            <i />
          </div>
          <Icon name={index % 2 ? 'grid' : 'book'} size={40} />
        </>
      )}
    </div>
  )
}

export function CourseCard({ course, index = 0 }: { course: Matakuliah; index?: number }) {
  return (
    <Link className="course-card" to={`/matakuliah/${course.id}`}>
      <CourseVisual course={course} index={index} />
      <div className="course-body">
        <h3>{course.nama}</h3>
        <p>{course.deskripsi || 'Materi pembelajaran tersusun untuk mendukung perkuliahan.'}</p>
        <span>
          Jelajahi materi <Icon name="arrow" size={16} />
        </span>
      </div>
    </Link>
  )
}
