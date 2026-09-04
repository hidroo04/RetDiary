import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { useAsyncMutation, useAsyncQuery } from '@/hooks/useAsync'
import { jadwalApi } from '@/api/jadwal.api'
import { matakuliahApi } from '@/api/matakuliah.api'
import type { CreateJadwalRequest, HariKuliah, Jadwal } from '@/types/domain.types'
import { getBusiestDay, groupSchedulesByDay, INITIAL_SCHEDULE_FORM } from '../schedule.utils'

export const useScheduleManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Jadwal | null>(null)
  const [form, setForm] = useState<CreateJadwalRequest>(INITIAL_SCHEDULE_FORM)
  const [formError, setFormError] = useState('')

  const {
    data: schedules = [],
    isLoading,
    isError,
    refetch: refetchSchedules,
  } = useAsyncQuery('admin:schedules', jadwalApi.getAll)

  const { data: courses = [] } = useAsyncQuery('admin:courses', matakuliahApi.getAll)

  const schedulesByDay = useMemo(() => groupSchedulesByDay(schedules), [schedules])
  const busiestDay = useMemo(() => getBusiestDay(schedulesByDay), [schedulesByDay])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingSchedule(null)
    setFormError('')
  }, [])

  const saveMutation = useAsyncMutation({
    mutationFn: () =>
      editingSchedule ? jadwalApi.update(editingSchedule.id, form) : jadwalApi.create(form),
    onSuccess: async () => {
      refetchSchedules()
      closeModal()
    },
    onError: (error: any) => {
      setFormError(error?.response?.data?.message || 'Jadwal gagal disimpan. Silakan coba lagi.')
    },
  })

  const deleteMutation = useAsyncMutation({
    mutationFn: jadwalApi.delete,
    onSuccess: () => refetchSchedules(),
  })

  const openCreateModal = useCallback(
    (day: HariKuliah = 'Senin') => {
      setEditingSchedule(null)
      setForm({
        ...INITIAL_SCHEDULE_FORM,
        hari: day,
        matakuliahId: courses[0]?.id ?? '',
      })
      setFormError('')
      setIsModalOpen(true)
    },
    [courses],
  )

  const openEditModal = useCallback((schedule: Jadwal) => {
    setEditingSchedule(schedule)
    setForm({
      matakuliahId: schedule.matakuliahId,
      hari: schedule.hari,
      jamMulai: schedule.jamMulai,
      jamSelesai: schedule.jamSelesai,
      ruangan: schedule.ruangan,
    })
    setFormError('')
    setIsModalOpen(true)
  }, [])

  const updateForm = useCallback((updates: Partial<CreateJadwalRequest>) => {
    setForm((current) => ({ ...current, ...updates }))
  }, [])

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.matakuliahId || !form.ruangan.trim()) {
      setFormError('Mata kuliah dan ruangan wajib diisi.')
      return
    }

    if (form.jamSelesai <= form.jamMulai) {
      setFormError('Jam selesai harus lebih akhir daripada jam mulai.')
      return
    }

    setFormError('')
    saveMutation.mutate()
  }

  const removeSchedule = useCallback(
    (schedule: Jadwal) => {
      const courseName = schedule.matakuliah?.nama || 'jadwal ini'
      if (window.confirm(`Hapus jadwal ${courseName} pada hari ${schedule.hari}?`)) {
        deleteMutation.mutate(schedule.id)
      }
    },
    [deleteMutation],
  )

  return {
    schedules,
    courses,
    schedulesByDay,
    busiestDay,
    isLoading,
    isError,
    isModalOpen,
    editingSchedule,
    form,
    formError,
    isSaving: saveMutation.isPending,
    openCreateModal,
    openEditModal,
    updateForm,
    closeModal,
    submitForm,
    removeSchedule,
  }
}
