import { Plus } from 'lucide-react';
import type { HariKuliah, Jadwal } from '@/types/domain.types';
import { ScheduleCard } from './ScheduleCard';
import styles from '../Jadwal.module.css';

interface DayColumnProps {
  day: HariKuliah;
  index: number;
  schedules: Jadwal[];
  hasCourses: boolean;
  onCreate: (day: HariKuliah) => void;
  onEdit: (schedule: Jadwal) => void;
  onDelete: (schedule: Jadwal) => void;
}

export const DayColumn = ({
  day,
  index,
  schedules,
  hasCourses,
  onCreate,
  onEdit,
  onDelete,
}: DayColumnProps) => (
  <article className={styles.dayColumn}>
    <div className={styles.dayHeader}>
      <div className={styles.dayNumber}>{String(index + 1).padStart(2, '0')}</div>
      <div>
        <h3>{day}</h3>
        <span>{schedules.length} sesi</span>
      </div>
    </div>

    <div className={styles.dayContent}>
      {schedules.length ? (
        schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <button
          className={styles.emptyDay}
          type="button"
          onClick={() => onCreate(day)}
          disabled={!hasCourses}
        >
          <Plus size={18} />
          <span>Tambahkan sesi</span>
        </button>
      )}
    </div>
  </article>
);
