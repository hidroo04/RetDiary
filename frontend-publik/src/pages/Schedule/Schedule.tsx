import { jadwalPublicApi } from '@/api/jadwal.api'
import { Icon } from '@/components/ui/Icon'
import { LoadingCards, QueryState } from '@/components/ui/AsyncState'
import { useAsyncQuery } from '@/hooks/useAsync'
import type { Jadwal } from '@/types/domain.types'
import './Schedule.css'

const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function ScheduleCard({ item, index }: { item: Jadwal; index: number }) {
  return <div className={`schedule-card tone-${index % 3}`}><span className="schedule-time"><Icon name="clock" size={15} />{item.jamMulai}—{item.jamSelesai}</span><h3>{item.matakuliah?.nama}</h3><small>{item.matakuliah?.kode}</small><p><Icon name="map" size={14} />{item.ruangan}</p></div>
}

export default function SchedulePage() {
  const schedules = useAsyncQuery('public:schedules', jadwalPublicApi.getAll)
  const byDay = dayOrder.map((day) => ({ day, items: (schedules.data ?? []).filter((item) => item.hari === day) })).filter((group) => group.items.length)
  return <><section className="courses-hero schedule-hero"><div className="courses-hero-image schedule-hero-image" /><div className="courses-hero-shade schedule-hero-shade" /><div className="container courses-hero-content"><span className="eyebrow light">Agenda perkuliahan</span><h1>Jadwal kuliah</h1><p>Lihat waktu, ruang, dan mata kuliah dalam tampilan mingguan yang mudah dipindai.</p><div className="courses-hero-divider" aria-hidden="true"><span /><i /><span /></div></div></section><section className="section schedule-page-section"><div className="container">
    {schedules.isLoading ? <LoadingCards /> : <QueryState error={schedules.error} empty={!schedules.data?.length}><div className="schedule-board">{byDay.map((group) => <div className="day-column" key={group.day}><div className="day-title"><span>{group.day.slice(0, 3).toUpperCase()}</span><strong>{group.day}</strong></div>{group.items.map((item, index) => <ScheduleCard key={item.id} item={item} index={index} />)}</div>)}</div></QueryState>}
  </div></section></>
}
