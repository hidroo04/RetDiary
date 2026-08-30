import { CalendarDays, Sparkles } from 'lucide-react';
import type { BusiestDay } from '../schedule.utils';
import styles from '../Jadwal.module.css';

interface ScheduleSummaryProps {
  total: number;
  busiestDay: BusiestDay;
}

export const ScheduleSummary = ({ total, busiestDay }: ScheduleSummaryProps) => (
  <section className={styles.summaryGrid} aria-label="Ringkasan jadwal">
    <div className={styles.summaryPrimary}>
      <div className={styles.summaryIcon}><CalendarDays size={22} /></div>
      <div>
        <span className={styles.summaryLabel}>Total pekan ini</span>
        <strong>{total} sesi kuliah</strong>
      </div>
      <Sparkles className={styles.summarySparkle} size={24} />
    </div>

    <div className={styles.summaryCard}>
      <span className={styles.summaryLabel}>Hari terpadat</span>
      <strong>{busiestDay.count ? busiestDay.day : 'Belum ada jadwal'}</strong>
      <small>
        {busiestDay.count ? `${busiestDay.count} sesi terjadwal` : 'Tambahkan sesi pertama Anda'}
      </small>
    </div>

    <div className={styles.summaryCard}>
      <span className={styles.summaryLabel}>Cakupan jadwal</span>
      <strong>Senin — Minggu</strong>
      <small>Jadwal berulang setiap pekan</small>
    </div>
  </section>
);
