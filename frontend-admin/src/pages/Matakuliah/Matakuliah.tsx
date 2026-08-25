import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Bell, 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight, 
  MoreHorizontal, 
  FileText, 
  FileDown, 
  X, 
  Loader2, 
  BookOpen, 
  GraduationCap,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3
} from 'lucide-react';
import { matakuliahApi } from '@/api/matakuliah.api';
import { jadwalApi } from '@/api/jadwal.api';
import { materiApi } from '@/api/materi.api';
import type { Matakuliah, Jadwal, MateriListItem } from '@/types/domain.types';
import styles from './Matakuliah.module.css';

const HARI_MAP = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export default function MatakuliahPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());
  const [filterTab, setFilterTab] = useState<'semua' | 'aktif' | 'selesai'>('semua');
  
  // State for Classroom Modal ("Buka ruang kelas")
  const [selectedCourseForClass, setSelectedCourseForClass] = useState<Matakuliah | null>(null);
  
  // State for Add / Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Matakuliah | null>(null);
  const [formData, setFormData] = useState({ kode: '', nama: '', deskripsi: '' });
  const [formError, setFormError] = useState('');

  // Real-time clock tick every 5 seconds to update active class automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Courses & Schedules
  const { data: matakuliahList = [], isLoading: isLoadingMK } = useQuery({
    queryKey: ['matakuliah'],
    queryFn: matakuliahApi.getAll,
  });

  const { data: jadwalList = [], isLoading: isLoadingJadwal } = useQuery({
    queryKey: ['jadwal'],
    queryFn: jadwalApi.getAll,
  });

  // Fetch Materi for Selected Course in Classroom Modal
  const { data: materiList = [], isLoading: isLoadingMateri } = useQuery({
    queryKey: ['materi', selectedCourseForClass?.id],
    queryFn: () => selectedCourseForClass ? materiApi.getAllByMatakuliah(selectedCourseForClass.id) : Promise.resolve([]),
    enabled: !!selectedCourseForClass,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: matakuliahApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matakuliah'] });
      setIsAddModalOpen(false);
      setFormData({ kode: '', nama: '', deskripsi: '' });
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Gagal menambahkan mata kuliah.');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => matakuliahApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matakuliah'] });
      setEditingCourse(null);
      setFormData({ kode: '', nama: '', deskripsi: '' });
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Gagal mengubah mata kuliah.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: matakuliahApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matakuliah'] });
    },
  });

  // ─── Real-Time Schedule Matching for Hero Card ──────────────────────────
  const currentDayName = HARI_MAP[now.getDay()];
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const { heroCourse, heroSchedule, heroStatus, heroTimeLabel } = useMemo(() => {
    if (matakuliahList.length === 0) {
      return { heroCourse: null, heroSchedule: null, heroStatus: 'none', heroTimeLabel: '' };
    }

    // 1. Check if any class is currently ONGOING today at this exact time
    const ongoingJadwal = jadwalList.find((j) => {
      const isToday = j.hari.toLowerCase() === currentDayName.toLowerCase();
      return isToday && currentTimeStr >= j.jamMulai && currentTimeStr <= j.jamSelesai;
    });

    if (ongoingJadwal) {
      const mk = matakuliahList.find((m) => m.id === ongoingJadwal.matakuliahId);
      if (mk) {
        return {
          heroCourse: mk,
          heroSchedule: ongoingJadwal,
          heroStatus: 'ongoing',
          heroTimeLabel: `Hari ini • ${ongoingJadwal.jamMulai} - ${ongoingJadwal.jamSelesai}`,
        };
      }
    }

    // 2. Check for NEXT upcoming class today
    const upcomingToday = jadwalList
      .filter((j) => j.hari.toLowerCase() === currentDayName.toLowerCase() && j.jamMulai > currentTimeStr)
      .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai))[0];

    if (upcomingToday) {
      const mk = matakuliahList.find((m) => m.id === upcomingToday.matakuliahId);
      if (mk) {
        return {
          heroCourse: mk,
          heroSchedule: upcomingToday,
          heroStatus: 'upcoming',
          heroTimeLabel: `Hari ini • ${upcomingToday.jamMulai}`,
        };
      }
    }

    // 3. Fallback: Find the nearest scheduled class or first course
    const firstScheduled = jadwalList[0];
    if (firstScheduled) {
      const mk = matakuliahList.find((m) => m.id === firstScheduled.matakuliahId);
      if (mk) {
        return {
          heroCourse: mk,
          heroSchedule: firstScheduled,
          heroStatus: 'scheduled',
          heroTimeLabel: `${firstScheduled.hari} • ${firstScheduled.jamMulai}`,
        };
      }
    }

    // Default to first matakuliah
    return {
      heroCourse: matakuliahList[0] || null,
      heroSchedule: null,
      heroStatus: 'default',
      heroTimeLabel: 'Jadwal belum ditentukan',
    };
  }, [matakuliahList, jadwalList, currentDayName, currentTimeStr]);

  // Filtered List for Cards Grid
  const filteredCourses = useMemo(() => {
    if (filterTab === 'aktif') {
      return matakuliahList.slice(0, Math.max(1, matakuliahList.length - 1));
    }
    if (filterTab === 'selesai') {
      return matakuliahList.length > 1 ? [matakuliahList[matakuliahList.length - 1]] : [];
    }
    return matakuliahList;
  }, [matakuliahList, filterTab]);

  // Helper to get Schedule info for a course card
  const getCourseScheduleInfo = (courseId: string) => {
    const sched = jadwalList.find((j) => j.matakuliahId === courseId);
    if (!sched) return { label: 'Ditutup →', isToday: false };
    const isToday = sched.hari.toLowerCase() === currentDayName.toLowerCase();
    if (isToday) {
      return { label: `Hari ini - ${sched.jamMulai} →`, isToday: true };
    }
    return { label: `${sched.hari} - ${sched.jamMulai} →`, isToday: false };
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormData({ kode: '', nama: '', deskripsi: '' });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (course: Matakuliah, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(course);
    setFormData({
      kode: course.kode,
      nama: course.nama,
      deskripsi: course.deskripsi || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleDeleteCourse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode.trim() || !formData.nama.trim()) {
      setFormError('Kode dan Nama Mata Kuliah wajib diisi.');
      return;
    }
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Progress Calculation helper (Mock/Dynamic based on meetings)
  const getProgressData = (index: number) => {
    const percentages = [91, 82, 76, 100, 88, 65];
    const p = percentages[index % percentages.length];
    const materiCounts = [12, 8, 9, 7, 10, 6];
    const m = materiCounts[index % materiCounts.length];
    const studentCounts = [38, 42, 46, 35, 40, 37];
    const s = studentCounts[index % studentCounts.length];
    return { percent: p, materiCount: m, students: s };
  };

  if (isLoadingMK || isLoadingJadwal) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary-lilac)" />
      </div>
    );
  }

  // Hero Progress Circle Calculations
  const heroProgress = heroCourse ? getProgressData(0).percent : 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (heroProgress / 100) * circumference;

  return (
    <div className={styles.container}>
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.subtitle}>PANEL PENGELOLAAN • RETDIARY</span>
          <h1 className={styles.title}>Mata kuliah</h1>
          <p className={styles.description}>Atur kelas dan informasi mata kuliah yang Anda ampu.</p>
        </div>

        <div className={styles.headerActions}>
          <button 
            type="button" 
            className={styles.notifBtn} 
            title="Notifikasi"
            onClick={() => alert("Tidak ada notifikasi baru saat ini.")}
          >
            <Bell size={19} />
          </button>
          <button 
            type="button" 
            className={styles.addBtn}
            onClick={handleOpenAddModal}
          >
            <Plus size={18} />
            <span>Tambah mata kuliah</span>
          </button>
        </div>
      </header>

      {/* ─── Hero / Main Featured Card ─────────────────────────────────── */}
      {heroCourse && (
        <section className={styles.heroCard}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadgeRow}>
              {heroStatus === 'ongoing' ? (
                <div className={styles.liveBadgeOngoing}>
                  <div className={styles.pulsingDotGreen} />
                  <span>KELAS BERLANGSUNG</span>
                </div>
              ) : heroStatus === 'upcoming' ? (
                <div className={styles.liveBadgeUpcoming}>
                  <div className={styles.pulsingDotLilac} />
                  <span>KELAS BERIKUTNYA</span>
                </div>
              ) : (
                <div className={styles.liveBadgeScheduled}>
                  <Sparkles size={13} />
                  <span>KELAS TERJADWAL</span>
                </div>
              )}
              <span className={styles.heroCourseCode}>
                {heroCourse.kode} • Minggu 14
              </span>
            </div>

            <h2 className={styles.heroCourseTitle}>{heroCourse.nama}</h2>

            <p className={styles.heroDescription}>
              {heroCourse.deskripsi ||
                'Ruang kelas Anda rapi dalam satu tampilan—pantau progres materi dan siapkan sesi berikutnya tanpa berpindah halaman.'}
            </p>

            <div className={styles.heroActionRow}>
              <button 
                type="button" 
                className={styles.openClassBtn}
                onClick={() => setSelectedCourseForClass(heroCourse)}
              >
                <span>Buka ruang kelas</span>
                <ArrowRight size={17} />
              </button>

              <div className={styles.heroTimeInfo}>
                <Clock size={16} />
                <span>{heroTimeLabel}</span>
              </div>
            </div>

            <div className={styles.heroDivider} />

            <div className={styles.heroFooterMeta}>
              <div className={styles.metaItem}>
                <Users size={16} />
                <span>38 mahasiswa</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <span>{heroSchedule?.ruangan || 'Ruang C-201'}</span>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.circleProgressWrapper}>
              <svg className={styles.circleSvg} viewBox="0 0 140 140">
                <circle
                  className={styles.circleBg}
                  cx="70"
                  cy="70"
                  r={radius}
                />
                <circle
                  className={styles.circleFill}
                  cx="70"
                  cy="70"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className={styles.circleContent}>
                <span className={styles.circlePercent}>{heroProgress}%</span>
                <span className={styles.circleLabel}>materi terisi</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Filter Tabs & Class Count ─────────────────────────────────── */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button 
            type="button"
            className={`${styles.tabBtn} ${filterTab === 'semua' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('semua')}
          >
            <span>Semua</span>
            <span className={styles.tabCount}>{matakuliahList.length}</span>
          </button>
          <button 
            type="button"
            className={`${styles.tabBtn} ${filterTab === 'aktif' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('aktif')}
          >
            <span>Aktif</span>
          </button>
          <button 
            type="button"
            className={`${styles.tabBtn} ${filterTab === 'selesai' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('selesai')}
          >
            <span>Selesai</span>
          </button>
        </div>

        <span className={styles.classCountText}>
          {filteredCourses.length} kelas ditampilkan
        </span>
      </div>

      {/* ─── Course Cards Grid ─────────────────────────────────────────── */}
      <div className={styles.grid}>
        {filteredCourses.map((course, idx) => {
          const { percent, materiCount, students } = getProgressData(idx);
          const isCompleted = filterTab === 'selesai' || idx === filteredCourses.length - 1 && idx > 2;
          const schedInfo = getCourseScheduleInfo(course.id);
          const formattedIdx = String(idx + 1).padStart(2, '0');

          return (
            <div 
              key={course.id} 
              className={styles.courseCard}
              onClick={() => setSelectedCourseForClass(course)}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardIndexRow}>
                  <span className={styles.cardIndex}>{formattedIdx}</span>
                  <span className={styles.cardCodeBadge}>{course.kode}</span>
                </div>
                <button 
                  type="button" 
                  className={styles.moreOptionsBtn}
                  onClick={(e) => handleOpenEditModal(course, e)}
                  title="Edit Mata Kuliah"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className={styles.cardStatusRow}>
                {isCompleted ? (
                  <>
                    <div className={styles.statusCompletedDot} />
                    <span className={styles.statusCompleted}>Selesai</span>
                  </>
                ) : (
                  <>
                    <div className={styles.statusActiveDot} />
                    <span className={styles.statusActive}>Aktif</span>
                  </>
                )}
              </div>

              <div>
                <h3 className={styles.cardCourseTitle}>{course.nama}</h3>
                <p className={styles.cardSubtitle}>
                  {isCompleted ? 'Semester selesai • ' : 'Minggu 14 • '}
                  {materiCount} materi diterbitkan
                </p>
              </div>

              <div className={styles.cardProgressSection}>
                <div className={styles.progressLabelRow}>
                  <span className={styles.progressText}>Progres materi</span>
                  <span className={styles.progressNumber}>{percent}%</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={
                      isCompleted 
                        ? styles.progressBarFillAmber 
                        : percent > 85 
                        ? styles.progressBarFillEmerald 
                        : styles.progressBarFillLilac
                    } 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.studentMeta}>
                  <Users size={16} />
                  <span>{students}</span>
                </div>
                <span className={styles.scheduleLink}>
                  {schedInfo.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Classroom Modal / Drawer ("Buka Ruang Kelas") ─────────────── */}
      {selectedCourseForClass && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedCourseForClass(null)}>
          <div className={styles.classroomModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <span className={styles.modalSubHeader}>RUANG KELAS DIGITAL</span>
                <h2 className={styles.modalTitle}>{selectedCourseForClass.nama}</h2>
                <div className={styles.modalMetaRow}>
                  <span>Kode: <strong>{selectedCourseForClass.kode}</strong></span>
                  <span>•</span>
                  <span>Jadwal: <strong>{getCourseScheduleInfo(selectedCourseForClass.id).label.replace('→', '').trim()}</strong></span>
                  <span>•</span>
                  <span>Total: <strong>{materiList.length} Materi</strong></span>
                </div>
              </div>
              <button 
                type="button" 
                className={styles.closeModalBtn}
                onClick={() => setSelectedCourseForClass(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalActionBar}>
                <h3 className={styles.modalSectionTitle}>Daftar Materi Pembelajaran</h3>
                <button 
                  type="button" 
                  className={styles.addMateriModalBtn}
                  onClick={() => {
                    navigate('/materi/tambah');
                  }}
                >
                  <Plus size={16} />
                  <span>Tambah materi</span>
                </button>
              </div>

              {isLoadingMateri ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Loader2 className="animate-spin" size={36} color="var(--color-primary-lilac)" />
                </div>
              ) : materiList.length === 0 ? (
                <div className={styles.emptyMateri}>
                  <BookOpen size={48} color="#C4B5FD" />
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Belum Ada Materi</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Mata kuliah ini belum memiliki materi terbit. Tambahkan materi pertama Anda sekarang.</p>
                  <button 
                    type="button" 
                    className={styles.addMateriModalBtn}
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => navigate('/materi/tambah')}
                  >
                    <Plus size={16} />
                    <span>Upload materi pertama</span>
                  </button>
                </div>
              ) : (
                <div className={styles.materiList}>
                  {materiList.map((materi, mIdx) => (
                    <div key={materi.id} className={styles.materiItem}>
                      <div className={styles.materiLeft}>
                        <div className={styles.materiUrutanBadge}>
                          {String(materi.urutan || mIdx + 1).padStart(2, '0')}
                        </div>
                        <div className={styles.materiInfo}>
                          <span className={styles.materiJudul}>{materi.judul}</span>
                          <div className={styles.materiMeta}>
                            <span>Pertemuan {materi.urutan || mIdx + 1}</span>
                            <span>•</span>
                            <span>{new Date(materi.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {materi.fotoMateri && materi.fotoMateri.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{materi.fotoMateri.length} Foto</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={styles.materiRight}>
                        {materi.pdfUrl && (
                          <a 
                            href={materi.pdfUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={styles.pdfBadge}
                            title="Unduh / Lihat PDF"
                          >
                            <FileDown size={14} />
                            <span>PDF</span>
                          </a>
                        )}
                        <button 
                          type="button" 
                          className={styles.moreOptionsBtn}
                          onClick={() => navigate('/materi')}
                          title="Buka Halaman Materi"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Course Modal Form ──────────────────────────────── */}
      {isAddModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </h3>
              <button 
                type="button" 
                className={styles.closeModalBtn}
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', fontSize: '0.85rem', fontWeight: 600 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kode Mata Kuliah</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  placeholder="Contoh: PPT 302"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Mata Kuliah</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  placeholder="Contoh: Teknologi Budidaya"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Deskripsi Singkat (Opsional)</label>
                <textarea 
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Deskripsi ringkas mengenai mata kuliah..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>

              <div className={styles.formModalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={styles.submitModalBtn}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
