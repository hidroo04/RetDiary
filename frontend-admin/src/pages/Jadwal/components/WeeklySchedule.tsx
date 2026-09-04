import { Clock3 } from 'lucide-react'
import type { HariKuliah, Jadwal } from '@/types/domain.types'
import { DAYS, type SchedulesByDay } from '../schedule.utils'
import { DayColumn } from './DayColumn'
import styles from '../Jadwal.module.css'

interface WeeklyScheduleProps {
  schedulesByDay: SchedulesByDay
  hasCourses: boolean
  onCreate: (day: HariKuliah) => void
  onEdit: (schedule: Jadwal) => void
  onDelete: (schedule: Jadwal) => void
}

export const WeeklySchedule = ({
  schedulesByDay,
  hasCourses,
  onCreate,
  onEdit,
  onDelete,
}: WeeklyScheduleProps) => (
  <section className={styles.boardSection}>
    <div className={styles.boardHeading}>
      <div>
        <span className={styles.eyebrow}>TAMPILAN MINGGUAN</span>
        <h2>Senin sampai Minggu</h2>
      </div>
      <span className={styles.timeHint}>
        <Clock3 size={15} /> Diurutkan dari jam paling awal
      </span>
    </div>

    <div className={styles.weekGrid}>
      {DAYS.map((day, index) => (
        <DayColumn
          key={day}
          day={day}
          index={index}
          schedules={schedulesByDay.get(day) ?? []}
          hasCourses={hasCourses}
          onCreate={onCreate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  </section>
)
