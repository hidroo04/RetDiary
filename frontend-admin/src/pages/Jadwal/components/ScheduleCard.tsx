import { Edit3, MapPin, Trash2 } from 'lucide-react'
import type { Jadwal } from '@/types/domain.types'
import { getDuration } from '../schedule.utils'
import styles from '../Jadwal.module.css'

interface ScheduleCardProps {
  schedule: Jadwal
  onEdit: (schedule: Jadwal) => void
  onDelete: (schedule: Jadwal) => void
}

export const ScheduleCard = ({ schedule, onEdit, onDelete }: ScheduleCardProps) => {
  const courseName = schedule.matakuliah?.nama || 'Mata kuliah'

  return (
    <div className={styles.scheduleCard}>
      <div className={styles.timeRow}>
        <span>{schedule.jamMulai}</span>
        <i />
        <span>{schedule.jamSelesai}</span>
      </div>
      <span className={styles.courseCode}>{schedule.matakuliah?.kode || 'MATA KULIAH'}</span>
      <h4>{courseName}</h4>
      <div className={styles.roomRow}>
        <MapPin size={14} /> {schedule.ruangan}
      </div>
      <div className={styles.cardFooter}>
        <span>{getDuration(schedule.jamMulai, schedule.jamSelesai)}</span>
        <div className={styles.cardActions}>
          <button type="button" onClick={() => onEdit(schedule)} aria-label={`Edit ${courseName}`}>
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onDelete(schedule)}
            aria-label={`Hapus ${courseName}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
