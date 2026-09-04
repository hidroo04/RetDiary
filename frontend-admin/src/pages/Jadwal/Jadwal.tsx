import { AlertCircle, Loader2, Plus } from 'lucide-react'
import { ScheduleFormModal } from './components/ScheduleFormModal'
import { ScheduleSummary } from './components/ScheduleSummary'
import { WeeklySchedule } from './components/WeeklySchedule'
import { useScheduleManagement } from './hooks/useScheduleManagement'
import styles from './Jadwal.module.css'

export default function JadwalPage() {
  const schedule = useScheduleManagement()

  if (schedule.isLoading) {
    return (
      <div className={styles.statePage}>
        <Loader2 className={styles.spinner} size={42} />
        <span>Menyiapkan jadwal mingguan...</span>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>PANEL PENGELOLAAN • RETDIARY</span>
          <h1 className={styles.title}>Jadwal mengajar</h1>
          <p className={styles.description}>
            Susun seluruh sesi kuliah dalam satu pekan yang tenang dan mudah dipindai.
          </p>
        </div>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => schedule.openCreateModal()}
          disabled={!schedule.courses.length}
        >
          <Plus size={18} />
          Tambah jadwal
        </button>
      </header>

      <ScheduleSummary total={schedule.schedules.length} busiestDay={schedule.busiestDay} />

      {schedule.isError && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={18} /> Data jadwal belum dapat dimuat. Coba muat ulang halaman.
        </div>
      )}

      {!schedule.courses.length && (
        <div className={styles.infoBanner}>
          <AlertCircle size={18} /> Tambahkan mata kuliah terlebih dahulu sebelum membuat jadwal.
        </div>
      )}

      <WeeklySchedule
        schedulesByDay={schedule.schedulesByDay}
        hasCourses={schedule.courses.length > 0}
        onCreate={schedule.openCreateModal}
        onEdit={schedule.openEditModal}
        onDelete={schedule.removeSchedule}
      />

      <ScheduleFormModal
        isOpen={schedule.isModalOpen}
        editingSchedule={schedule.editingSchedule}
        courses={schedule.courses}
        form={schedule.form}
        formError={schedule.formError}
        isSaving={schedule.isSaving}
        onChange={schedule.updateForm}
        onClose={schedule.closeModal}
        onSubmit={schedule.submitForm}
      />
    </div>
  )
}
