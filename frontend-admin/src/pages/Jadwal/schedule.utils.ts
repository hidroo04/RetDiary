import type { CreateJadwalRequest, HariKuliah, Jadwal } from '@/types/domain.types'

export const DAYS: HariKuliah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const DAY_INDEX = new Map(DAYS.map((day, index) => [day, index]))

export const INITIAL_SCHEDULE_FORM: CreateJadwalRequest = {
  matakuliahId: '',
  hari: 'Senin',
  jamMulai: '08:00',
  jamSelesai: '09:40',
  ruangan: '',
}

export type SchedulesByDay = Map<HariKuliah, Jadwal[]>

export interface BusiestDay {
  day: HariKuliah | 'Belum ada'
  count: number
}

export const getDuration = (start: string, end: string) => {
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  const minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)

  if (minutes <= 0) return 'Waktu belum valid'

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours ? `${hours} jam` : ''}${hours && rest ? ' ' : ''}${rest ? `${rest} menit` : ''}`
}

export const groupSchedulesByDay = (schedules: Jadwal[]): SchedulesByDay => {
  const grouped = new Map(DAYS.map((day) => [day, [] as Jadwal[]]))

  ;[...schedules]
    .sort((first, second) => {
      const dayDifference = (DAY_INDEX.get(first.hari) ?? 7) - (DAY_INDEX.get(second.hari) ?? 7)
      return dayDifference || first.jamMulai.localeCompare(second.jamMulai)
    })
    .forEach((schedule) => grouped.get(schedule.hari)?.push(schedule))

  return grouped
}

export const getBusiestDay = (schedulesByDay: SchedulesByDay): BusiestDay => {
  return DAYS.reduce<BusiestDay>(
    (result, day) => {
      const count = schedulesByDay.get(day)?.length ?? 0
      return count > result.count ? { day, count } : result
    },
    { day: 'Belum ada', count: 0 },
  )
}
