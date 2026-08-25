import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Bell, 
  Search, 
  FileText, 
  MoreHorizontal, 
  Loader2, 
  GraduationCap, 
  CalendarClock,
  Clock,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { StatCard } from '@/components/StatCard/StatCard';
import { authApi } from '@/api/auth.api';
import { jadwalApi } from '@/api/jadwal.api';
import { useAuthStore } from '@/stores/auth.store';
import type { Jadwal } from '@/types/domain.types';
import styles from './Dashboard.module.css';

const HARI_MAP = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

type JadwalStatus = 'berlangsung' | 'mendatang' | 'terlewat';

export default function Dashboard() {
  const dosen = useAuthStore((state) => state.dosen);
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(new Date());

  // Real-time clock updater (tiap 1 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: dashboardData, isLoading: isLoadingDashboard, isError: isErrorDashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: authApi.getDashboard,
  });

  const { data: jadwalData, isLoading: isLoadingJadwal, isError: isErrorJadwal } = useQuery({
    queryKey: ['jadwal'],
    queryFn: jadwalApi.getAll,
  });

  const isLoading = isLoadingDashboard || isLoadingJadwal;
  const isError = isErrorDashboard || isErrorJadwal;

  if (isLoading) {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary-pink)" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: 'red' }}>Gagal memuat data dashboard.</p>
      </div>
    );
  }

  // ─── Real-Time Schedule Calculation ──────────────────────────────────────
  const todayDayName = HARI_MAP[now.getDay()];
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentFullTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const getStatus = (sched: Jadwal): JadwalStatus => {
    if (currentTimeStr > sched.jamSelesai) {
      return 'terlewat';
    }
    if (currentTimeStr >= sched.jamMulai && currentTimeStr <= sched.jamSelesai) {
      return 'berlangsung';
    }
    return 'mendatang';
  };

  const allSchedules = jadwalData || [];
  
  // Filter hanya jadwal yang ada pada hari ini (jadwal tetap berulang tiap minggu)
  const todaySchedules = allSchedules
    .filter((j) => j.hari.toLowerCase() === todayDayName.toLowerCase())
    .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

  // Jadwal yang masih tersedia / belum terlewat pada jam hari ini
  const availableTodaySchedules = todaySchedules.filter((j) => getStatus(j) !== 'terlewat');
  const availableCount = availableTodaySchedules.length;
  const totalTodayCount = todaySchedules.length;
  const passedCount = totalTodayCount - availableCount;

  // Filter aktivitas materi berdasarkan pencarian
  const recentActivities = (dashboardData?.materiTerbaru || []).filter((act) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      act.judul.toLowerCase().includes(q) ||
      (act.matakuliah?.nama && act.matakuliah.nama.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.subtitle}>PANEL PENGELOLAAN • RETDIARY</span>
          <h1 className={styles.title}>
            Selamat datang, {dosen?.nama || 'Pengajar'}
          </h1>
          <span className={styles.subtitle2}>
            Pantau aktivitas pembelajaran dan jadwal kuliah Anda secara real-time.
          </span>
        </div>
        <button className={styles.notifBtn} title="Notifikasi">
          <Bell size={20} />
        </button>
      </header>

      {/* ─── Row Statistik Utama ────────────────────────────────────────── */}
      <section className={styles.statsRow}>
        <StatCard 
          title="Mata Kuliah Aktif" 
          value={dashboardData?.jumlahMatakuliah?.toString() || "0"} 
          badge="Semester Genap" 
          icon={<GraduationCap size={28} />}
          colorTheme="pink"
        />
        <StatCard 
          title="Materi Diterbitkan" 
          value={dashboardData?.jumlahMateri?.toString() || "0"} 
          badge={`${dashboardData?.jumlahMateri || 0} Modul`} 
          icon={<FileText size={28} />}
          colorTheme="lavender"
        />
        <StatCard 
          title="Jadwal Hari Ini" 
          value={`${availableCount} Sesi`} 
          badge={
            totalTodayCount === 0
              ? `Libur (${todayDayName})`
              : availableCount === 0
              ? '✓ Semua Selesai'
              : `${availableCount} dari ${totalTodayCount} Tersedia`
          } 
          icon={<CalendarClock size={28} />}
          colorTheme="pink"
        />
      </section>

      {/* ─── Grid Utama ─────────────────────────────────────────────────── */}
      <section className={styles.mainGrid}>
        {/* Left Column: Recent Activity (Materi) */}
        <div className={styles.sectionCard}>
          <span className={styles.sectionTitle}>AKTIVITAS TERBARU</span>
          <h2 className={styles.sectionHeading}>Materi Anda</h2>
          
          <div className={styles.searchBar}>
            <Search size={18} color="var(--color-text-secondary)" />
            <input 
              type="text" 
              placeholder="Cari materi atau mata kuliah..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.activityList}>
            {recentActivities.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                {searchQuery ? 'Tidak ada materi yang sesuai dengan pencarian.' : 'Belum ada materi terbaru.'}
              </p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <FileText size={20} />
                  </div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityTitle} title={act.judul}>{act.judul}</span>
                    <span className={styles.activityDesc}>{act.matakuliah?.nama}</span>
                  </div>
                  <div className={styles.activityActions}>
                    <span className={styles.badgeTerbit}>Terbit</span>
                    <MoreHorizontal size={16} className={styles.actionIcon} />
                  </div>
                </div>
              ))
            )}
          </div>
          <button className={styles.viewAllBtn}>Lihat semua materi ({dashboardData?.jumlahMateri || 0}) →</button>
        </div>

        {/* Right Column: Real-time Schedule & Progress */}
        <div className={styles.rightGrid}>
          <div className={styles.sectionCard}>
            <div className={styles.scheduleHeader}>
              <div>
                <span className={styles.sectionTitle}>HARI INI • {todayDayName.toUpperCase()}</span>
                <h2 className={styles.sectionHeading} style={{ marginBottom: 0 }}>Jadwal Mengajar</h2>
              </div>
              <div className={styles.liveBadge} title="Waktu server / lokal real-time">
                <span className={styles.liveDot}></span>
                <span>{currentFullTimeStr}</span>
              </div>
            </div>

            <div className={styles.scheduleSummary}>
              {totalTodayCount === 0 ? (
                <span>Tidak ada jadwal mengajar pada hari {todayDayName}.</span>
              ) : (
                <span>
                  <strong>{totalTodayCount} sesi</strong> dijadwalkan hari ini · <strong>{availableCount} tersedia</strong>
                  {passedCount > 0 && ` · ${passedCount} telah terlewat`}
                </span>
              )}
            </div>

            <div className={styles.scheduleList}>
              {todaySchedules.length === 0 ? (
                <div className={styles.emptySchedule}>
                  <CalendarDays size={32} color="var(--color-text-secondary)" />
                  <p style={{ margin: 0 }}>Tidak ada perkuliahan pada hari ini.</p>
                </div>
              ) : (
                todaySchedules.map((sched) => {
                  const status = getStatus(sched);
                  const isOngoing = status === 'berlangsung';
                  const isPassed = status === 'terlewat';

                  return (
                    <div 
                      key={sched.id} 
                      className={`${styles.scheduleItem} ${isOngoing ? styles.scheduleItemOngoing : ''} ${isPassed ? styles.scheduleItemPassed : ''}`}
                    >
                      <div className={styles.scheduleTimeCol}>
                        <span className={styles.scheduleTimeStart}>{sched.jamMulai}</span>
                        <span className={styles.scheduleTimeEnd}>{sched.jamSelesai}</span>
                      </div>
                      
                      <div 
                        className={`${styles.scheduleDivider} ${isOngoing ? styles.scheduleDividerOngoing : isPassed ? '' : styles.scheduleDividerUpcoming}`}
                      />
                      
                      <div className={styles.scheduleInfo}>
                        <span className={styles.scheduleTitle} title={sched.matakuliah?.nama}>
                          {sched.matakuliah?.nama || 'Mata Kuliah'}
                        </span>
                        <span className={styles.scheduleDesc}>
                          Ruang {sched.ruangan}
                        </span>
                      </div>

                      {/* Status Badge */}
                      {isOngoing && (
                        <span className={styles.statusBadgeOngoing}>
                          <Clock size={12} className="animate-spin" /> Sedang Berlangsung
                        </span>
                      )}
                      {status === 'mendatang' && (
                        <span className={styles.statusBadgeUpcoming}>
                          Mendatang
                        </span>
                      )}
                      {isPassed && (
                        <span className={styles.statusBadgePassed} title="Jam jadwal sudah terlewat">
                          <CheckCircle2 size={12} /> Selesai
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className={styles.recurringNote}>
              * Jadwal bersifat tetap dan berulang setiap pekan
            </div>
          </div>

          {/* Progress Card */}
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.sectionTitle}>PROGRES SEMESTER</span>
              <span className={styles.progressTitle}>Minggu ke-14</span>
            </div>
            
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>Materi terisi</span>
              <span className={styles.progressPercent}>85%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

