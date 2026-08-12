import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Search, FileText, Image as ImageIcon, MoreHorizontal, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard/StatCard';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { authApi } from '@/api/auth.api';
import { jadwalApi } from '@/api/jadwal.api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
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
      <div className={styles.dashboard} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={48} color="#a0a0a0" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'red' }}>Gagal memuat data dashboard.</p>
      </div>
    );
  }

  const recentActivities = dashboardData?.materiTerbaru || [];
  const schedules = jadwalData || [];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.subtitle}>Panel Pengelolaan · Retdiary</span>
          <h1 className={styles.title}>
            Selamat pagi, pengajar <span>✨</span>
          </h1>
          <span className={styles.subtitle2}>Pantau aktivitas pembelajaran Anda hari ini.</span>
        </div>
        <button className={styles.notifBtn}>
          <Bell size={20} />
        </button>
      </header>

      <section className={styles.statsRow}>
        <StatCard title="Mata Kuliah Aktif" value={dashboardData?.jumlahMatakuliah?.toString() || "0"} badge="Semester ini" />
        <StatCard title="Materi Diterbitkan" value={dashboardData?.jumlahMateri?.toString() || "0"} badge="Total" />
        <StatCard title="Total Jadwal" value={schedules.length.toString()} badge="Minggu ini" />
      </section>

      <section className={styles.mainGrid}>
        {/* Left Column: Recent Activity */}
        <GlassCard className={styles.section}>
          <span className={styles.sectionTitle}>Aktivitas Terbaru</span>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0' }}>Materi Anda</h2>
          
          <div className={styles.searchBar}>
            <Search size={18} color="#a0a0a0" />
            <input 
              type="text" 
              placeholder="Cari materi atau mata kuliah..." 
              className={styles.searchInput}
            />
          </div>

          <div className={styles.activityList}>
            {recentActivities.length === 0 ? (
              <p style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem 0' }}>Belum ada materi terbaru.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <FileText size={20} />
                  </div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityTitle}>{act.judul}</span>
                    <span className={styles.activityDesc}>{act.matakuliah?.nama}</span>
                  </div>
                  <div className={styles.activityActions}>
                    <FileText size={16} className={styles.actionIcon} />
                    <span className={styles.badgeTerbit}>
                      Terbit
                    </span>
                    <MoreHorizontal size={16} className={styles.actionIcon} />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Right Column: Schedule & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <GlassCard>
            <div className={styles.scheduleHeader}>
              <div>
                <span className={styles.sectionTitle}>Hari Ini</span>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Jadwal mengajar</h2>
              </div>
              <span className={styles.dateBadge}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
            </div>

            <div className={styles.scheduleList}>
              {schedules.length === 0 ? (
                <p style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem 0' }}>Tidak ada jadwal.</p>
              ) : (
                schedules.map((sched) => (
                  <div key={sched.id} className={styles.scheduleItem}>
                    <div className={styles.scheduleTime}>{sched.jamMulai}</div>
                    <div className={styles.scheduleInfo}>
                      <span className={styles.scheduleTitle}>{sched.matakuliah?.nama || 'Matakuliah'}</span>
                      <span className={styles.scheduleDesc}>{sched.hari} · Ruang {sched.ruangan}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.sectionTitle}>Progres Semester</span>
              <span className={styles.progressTitle}>Minggu berjalan</span>
            </div>
            
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>Status Materi</span>
              <span className={styles.progressPercent}>{dashboardData?.jumlahMatakuliah && dashboardData.jumlahMatakuliah > 0 ? 'Aktif' : '0%'}</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: dashboardData?.jumlahMatakuliah && dashboardData.jumlahMatakuliah > 0 ? '100%' : '0%' }}></div>
            </div>
          </GlassCard>

        </div>
      </section>
    </div>
  );
}
