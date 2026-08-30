import type { FormEvent } from 'react';
import { AlertCircle, Clock3, Loader2, X } from 'lucide-react';
import type {
  CreateJadwalRequest,
  HariKuliah,
  Jadwal,
  Matakuliah,
} from '@/types/domain.types';
import { DAYS, getDuration } from '../schedule.utils';
import styles from '../Jadwal.module.css';

interface ScheduleFormModalProps {
  isOpen: boolean;
  editingSchedule: Jadwal | null;
  courses: Matakuliah[];
  form: CreateJadwalRequest;
  formError: string;
  isSaving: boolean;
  onChange: (updates: Partial<CreateJadwalRequest>) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ScheduleFormModal = ({
  isOpen,
  editingSchedule,
  courses,
  form,
  formError,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}: ScheduleFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>{editingSchedule ? 'PERBARUI SESI' : 'SESI BARU'}</span>
            <h2 id="schedule-modal-title">{editingSchedule ? 'Edit jadwal' : 'Tambah jadwal'}</h2>
          </div>
          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Tutup">
            <X size={19} />
          </button>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          {formError && (
            <div className={styles.formError}>
              <AlertCircle size={16} /> {formError}
            </div>
          )}

          <label className={styles.fullField}>
            <span>Mata kuliah</span>
            <select
              value={form.matakuliahId}
              onChange={(event) => onChange({ matakuliahId: event.target.value })}
              required
            >
              <option value="" disabled>Pilih mata kuliah</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.kode} — {course.nama}</option>
              ))}
            </select>
          </label>

          <label className={styles.fullField}>
            <span>Hari</span>
            <select
              value={form.hari}
              onChange={(event) => onChange({ hari: event.target.value as HariKuliah })}
            >
              {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
          </label>

          <label>
            <span>Jam mulai</span>
            <input
              type="time"
              value={form.jamMulai}
              onChange={(event) => onChange({ jamMulai: event.target.value })}
              required
            />
          </label>

          <label>
            <span>Jam selesai</span>
            <input
              type="time"
              value={form.jamSelesai}
              onChange={(event) => onChange({ jamSelesai: event.target.value })}
              required
            />
          </label>

          <label className={styles.fullField}>
            <span>Ruangan</span>
            <input
              type="text"
              maxLength={50}
              placeholder="Contoh: Lab Komputer 2"
              value={form.ruangan}
              onChange={(event) => onChange({ ruangan: event.target.value })}
              required
            />
          </label>

          <div className={styles.durationPreview}>
            <Clock3 size={17} /> Durasi sesi:
            <strong>{getDuration(form.jamMulai, form.jamSelesai)}</strong>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.secondaryButton} type="button" onClick={onClose}>Batal</button>
            <button className={styles.primaryButton} type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className={styles.spinner} size={16} />}
              {editingSchedule ? 'Simpan perubahan' : 'Tambahkan jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
