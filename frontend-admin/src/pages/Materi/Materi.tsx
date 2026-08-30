import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Bell, 
  Search, 
  FileText, 
  FileDown, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Loader2, 
  BookOpen, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Upload
} from 'lucide-react';
import { materiApi } from '@/api/materi.api';
import { matakuliahApi } from '@/api/matakuliah.api';
import type { Materi, Matakuliah, FotoMateri } from '@/types/domain.types';
import styles from './Materi.module.css';

// ─── Course Code Colors Palette ──────────────────────────────────────────
const BADGE_COLOR_CLASSES = [
  styles.badgePurple,
  styles.badgeEmerald,
  styles.badgeBlue,
  styles.badgeAmber,
];

export default function MateriPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ─── Filter & View States ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ─── Modals State ──────────────────────────────────────────────────────
  const [previewMateri, setPreviewMateri] = useState<Materi | null>(null);
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);
  const [deletingMateri, setDeletingMateri] = useState<Materi | null>(null);
  const [activeGalleryZoom, setActiveGalleryZoom] = useState<string | null>(null);

  // ─── Form State (Edit) ─────────────────────────────────────────────────
  const [formMatakuliahId, setFormMatakuliahId] = useState('');
  const [formJudul, setFormJudul] = useState('');
  const [formUrutan, setFormUrutan] = useState<number>(1);
  const [formKonten, setFormKonten] = useState('');
  const [formPdfFile, setFormPdfFile] = useState<File | null>(null);
  const [formNewPhotos, setFormNewPhotos] = useState<File[]>([]);
  const [formNewPhotoPreviews, setFormNewPhotoPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<FotoMateri[]>([]);
  const [formError, setFormError] = useState('');

  // ─── Queries ───────────────────────────────────────────────────────────
  const { data: allMateri = [], isLoading: isLoadingMateri } = useQuery({
    queryKey: ['materi-all'],
    queryFn: () => materiApi.getAll(),
  });

  const { data: matakuliahList = [], isLoading: isLoadingMK } = useQuery({
    queryKey: ['matakuliah'],
    queryFn: matakuliahApi.getAll,
  });

  // Map of Course Id -> Course details for quick lookup
  const matakuliahMap = useMemo(() => {
    const map = new Map<string, Matakuliah>();
    matakuliahList.forEach((mk) => map.set(mk.id, mk));
    return map;
  }, [matakuliahList]);

  // ─── Filtered Materials ────────────────────────────────────────────────
  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return allMateri;
    const q = searchQuery.toLowerCase();
    return allMateri.filter((m) => {
      const courseName = m.matakuliah?.nama?.toLowerCase() || '';
      const courseCode = m.matakuliah?.kode?.toLowerCase() || '';
      const title = m.judul?.toLowerCase() || '';
      const content = m.konten?.toLowerCase() || '';
      return (
        title.includes(q) ||
        content.includes(q) ||
        courseName.includes(q) ||
        courseCode.includes(q)
      );
    });
  }, [allMateri, searchQuery]);

  // ─── Pagination Calculations (10 items per page) ──────────────────────
  const totalItems = filteredMaterials.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pagedMaterials = useMemo(() => {
    return filteredMaterials.slice(startIndex, endIndex);
  }, [filteredMaterials, startIndex, endIndex]);

  // ─── Group Paged Materials by Course ───────────────────────────────────
  const groupedPagedMaterials = useMemo(() => {
    const groups: {
      courseId: string;
      courseKode: string;
      courseNama: string;
      colorClass: string;
      materials: Materi[];
    }[] = [];

    const groupMap = new Map<string, typeof groups[0]>();

    pagedMaterials.forEach((materi) => {
      const mkId = materi.matakuliahId || 'unknown';
      const mk = matakuliahMap.get(mkId) || materi.matakuliah;
      const mkKode = mk?.kode || 'MK';
      const mkNama = mk?.nama || 'Mata Kuliah';

      if (!groupMap.has(mkId)) {
        // Assign color based on index or hash
        const colorIdx = Math.abs(
          mkKode.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
        ) % BADGE_COLOR_CLASSES.length;

        const newGroup = {
          courseId: mkId,
          courseKode: mkKode,
          courseNama: mkNama,
          colorClass: BADGE_COLOR_CLASSES[colorIdx],
          materials: [],
        };
        groupMap.set(mkId, newGroup);
        groups.push(newGroup);
      }

      groupMap.get(mkId)!.materials.push(materi);
    });

    return groups;
  }, [pagedMaterials, matakuliahMap]);

  // ─── Setup Edit Form ───────────────────────────────────────────────────
  const openEditModal = (materi: Materi) => {
    setEditingMateri(materi);
    setFormMatakuliahId(materi.matakuliahId);
    setFormJudul(materi.judul);
    setFormUrutan(materi.urutan || 1);
    setFormKonten(materi.konten || '');
    setFormPdfFile(null);
    setFormNewPhotos([]);
    setFormNewPhotoPreviews([]);
    setExistingPhotos(materi.fotoMateri || []);
    setFormError('');
  };

  // ─── Handle New Photos Selection ───────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = [...formNewPhotos, ...files];
      setFormNewPhotos(newFiles);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setFormNewPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewPhoto = (index: number) => {
    setFormNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setFormNewPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ─── Mutations ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingMateri) return;
      if (!formMatakuliahId) throw new Error('Silakan pilih mata kuliah.');
      if (!formJudul.trim()) throw new Error('Judul materi tidak boleh kosong.');

      const updated = await materiApi.update(
        editingMateri.id,
        {
          matakuliahId: formMatakuliahId,
          judul: formJudul.trim(),
          konten: formKonten.trim(),
          urutan: Number(formUrutan) || 1,
        },
        formPdfFile || undefined
      );

      // Upload newly added photos if any
      if (formNewPhotos.length > 0) {
        await materiApi.uploadFoto(editingMateri.id, formNewPhotos);
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materi-all'] });
      setEditingMateri(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Gagal mengubah materi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => materiApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materi-all'] });
      setDeletingMateri(null);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (fotoId: string) => materiApi.deleteFoto(fotoId),
    onSuccess: (_, fotoId) => {
      setExistingPhotos((prev) => prev.filter((p) => p.id !== fotoId));
      queryClient.invalidateQueries({ queryKey: ['materi-all'] });
    },
  });

  // ─── Format Subtitle Helper ────────────────────────────────────────────
  const getMaterialTypeSubtitle = (m: Materi) => {
    const hasPdf = !!m.pdfUrl;
    const hasPhotos = !!m.fotoMateri && m.fotoMateri.length > 0;
    const dateStr = new Date(m.createdAt).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    let typeStr = 'Modul & catatan';
    if (hasPdf && hasPhotos) typeStr = 'Modul & gambar';
    else if (hasPdf) typeStr = 'Modul PDF';
    else if (hasPhotos) typeStr = 'Galeri foto';
    else if (m.konten) typeStr = 'Instruksi materi';

    return `${typeStr} • ${dateStr}`;
  };

  // ─── Get File Icon Helper ──────────────────────────────────────────────
  const renderMaterialIcon = (m: Materi) => {
    const hasPdf = !!m.pdfUrl;
    const hasPhotos = !!m.fotoMateri && m.fotoMateri.length > 0;

    if (hasPdf && hasPhotos) {
      return (
        <div className={`${styles.iconBox} ${styles.iconBoxPurple}`}>
          <FileText size={20} />
        </div>
      );
    }
    if (hasPdf) {
      return (
        <div className={`${styles.iconBox} ${styles.iconBoxPurple}`}>
          <FileDown size={20} />
        </div>
      );
    }
    if (hasPhotos) {
      return (
        <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
          <ImageIcon size={20} />
        </div>
      );
    }
    return (
      <div className={`${styles.iconBox} ${styles.iconBoxViolet}`}>
        <BookOpen size={20} />
      </div>
    );
  };

  const isLoading = isLoadingMateri || isLoadingMK;

  return (
    <div className={styles.container}>
      {/* ─── Header Section ──────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.subtitle}>PANEL PENGELOLAAN • RETDIARY</span>
          <h1 className={styles.title}>Kelola materi</h1>
          <p className={styles.description}>
            Buat, tinjau, dan publikasikan materi untuk mahasiswa.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            type="button" 
            className={styles.notifBtn} 
            title="Pemberitahuan"
            aria-label="Pemberitahuan"
          >
            <Bell size={19} />
          </button>
          
          <button 
            type="button" 
            className={styles.addBtn}
            onClick={() => navigate('/materi/tambah')}
          >
            <Plus size={18} />
            <span>Tambah materi</span>
          </button>
        </div>
      </header>

      {/* ─── Hero / Perpustakaan Pembelajaran Banner ─────────────────── */}
      <section className={styles.heroCard}>
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>PERPUSTAKAAN PEMBELAJARAN</span>
          <h2 className={styles.heroHeading}>
            Semua materi, tersusun<br />menurut kelasnya.
          </h2>
          <p className={styles.heroSub}>
            Temukan, tinjau, dan kelola bahan ajar dari setiap mata kuliah yang Anda ampu.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{allMateri.length}</span>
            <span className={styles.statLabel}>materi</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{matakuliahList.length}</span>
            <span className={styles.statLabel}>mata kuliah</span>
          </div>
        </div>
      </section>

      {/* ─── Search & Section Header ─────────────────────────────────── */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <span className={styles.sectionEyebrow}>SELURUH MATERI</span>
          <h3 className={styles.sectionCount}>
            {filteredMaterials.length} bahan ajar ditemukan
          </h3>
        </div>

        <div className={styles.viewSwitchers}>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('grid')}
            title="Tampilan Grid 2 Kolom"
            aria-label="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('list')}
            title="Tampilan Baris Penuh"
            aria-label="List view"
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {/* ─── Search Bar ──────────────────────────────────────────────── */}
      <div className={styles.searchContainer}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Cari materi atau mata kuliah..."
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery('')}
            title="Hapus pencarian"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ─── Loading State ───────────────────────────────────────────── */}
      {isLoading && (
        <div className={styles.emptyState}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary-lilac)" />
          <p className={styles.emptyDesc}>Memuat daftar materi...</p>
        </div>
      )}

      {/* ─── Empty State ─────────────────────────────────────────────── */}
      {!isLoading && filteredMaterials.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconBox}>
            <BookOpen size={30} />
          </div>
          <h4 className={styles.emptyTitle}>
            {searchQuery ? 'Tidak ada materi yang sesuai' : 'Belum ada materi pembelajaran'}
          </h4>
          <p className={styles.emptyDesc}>
            {searchQuery 
              ? `Tidak ditemukan materi dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
              : 'Mulai unggah bahan ajar, modul PDF, dan foto pendukung untuk mahasiswa Anda.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate('/materi/tambah')}
              style={{ marginTop: '0.5rem' }}
            >
              <Plus size={16} />
              <span>Tambah Materi Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* ─── Grouped Materials List (by Course) ──────────────────────── */}
      {!isLoading && groupedPagedMaterials.length > 0 && (
        <div className={styles.courseGroupsList}>
          {groupedPagedMaterials.map((group) => (
            <div key={group.courseId} className={styles.courseGroupCard}>
              {/* Course Header Bar */}
              <div className={styles.courseGroupHeader}>
                <span className={`${styles.courseBadge} ${group.colorClass}`}>
                  {group.courseKode}
                </span>
                <div className={styles.courseInfo}>
                  <h4 className={styles.courseName}>{group.courseNama}</h4>
                  <span className={styles.courseCountSub}>
                    {group.materials.length} materi pada halaman ini
                  </span>
                </div>
              </div>

              {/* Materials Items */}
              <div className={viewMode === 'grid' ? styles.materialsGrid : styles.materialsListMode}>
                {group.materials.map((materi) => (
                  <div key={materi.id} className={styles.materialCard}>
                    {/* Left: Icon & Details */}
                    <div 
                      className={styles.materialLeft}
                      onClick={() => setPreviewMateri(materi)}
                      style={{ cursor: 'pointer' }}
                    >
                      {renderMaterialIcon(materi)}
                      <div className={styles.materialDetails}>
                        <h5 className={styles.materialTitle} title={materi.judul}>
                          {materi.judul}
                        </h5>
                        <span className={styles.materialMeta}>
                          {getMaterialTypeSubtitle(materi)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className={styles.materialRight}>
                      <span className={`${styles.statusBadge} ${styles.statusTerbit}`}>
                        Terbit
                      </span>

                      <div className={styles.actionRow}>
                        {/* Preview */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => setPreviewMateri(materi)}
                          title="Pratinjau Materi"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => openEditModal(materi)}
                          title="Ubah Materi"
                        >
                          <Edit3 size={17} />
                        </button>

                        {/* Download PDF / Link */}
                        {materi.pdfUrl ? (
                          <a
                            href={materi.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className={styles.actionIconBtn}
                            title="Unduh Modul PDF"
                          >
                            <FileDown size={17} />
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={() => setPreviewMateri(materi)}
                            title="Lihat Isi Teks"
                          >
                            <FileText size={17} />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          className={`${styles.actionIconBtn} ${styles.actionDeleteBtn}`}
                          onClick={() => setDeletingMateri(materi)}
                          title="Hapus Materi"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Pagination (10 Items per Page) ──────────────────────────── */}
      {!isLoading && totalItems > 0 && (
        <div className={styles.paginationWrapper}>
          <div className={styles.paginationInfo}>
            Menampilkan {startIndex + 1} - {endIndex} dari {totalItems} materi
          </div>

          <div className={styles.paginationControls}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage <= 1}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`${styles.pageBtn} ${pageNum === safeCurrentPage ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage >= totalPages}
              title="Halaman Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ─── MODAL: UBAH MATERI ──────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {editingMateri && (
        <div className={styles.modalBackdrop} onClick={() => setEditingMateri(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <h3 className={styles.modalTitle}>Ubah Materi Pembelajaran</h3>
                <span className={styles.modalSubtitle}>
                  Perbarui judul, berkas PDF, konten tulisan, atau kelola galeri foto.
                </span>
              </div>
              <button 
                type="button" 
                className={styles.closeModalBtn}
                onClick={() => setEditingMateri(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
            >
              <div className={styles.modalBody}>
                {formError && (
                  <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', fontSize: '0.84rem' }}>
                    {formError}
                  </div>
                )}

                {/* Mata Kuliah & Urutan */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mata Kuliah *</label>
                    <select
                      value={formMatakuliahId}
                      onChange={(e) => setFormMatakuliahId(e.target.value)}
                      className={styles.formSelect}
                      required
                    >
                      {matakuliahList.map((mk) => (
                        <option key={mk.id} value={mk.id}>
                          {mk.kode} - {mk.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nomor Pertemuan / Urutan *</label>
                    <input
                      type="number"
                      min={1}
                      value={formUrutan}
                      onChange={(e) => setFormUrutan(parseInt(e.target.value) || 1)}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>

                {/* Judul Materi */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Judul Materi *</label>
                  <input
                    type="text"
                    value={formJudul}
                    onChange={(e) => setFormJudul(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* Status PDF saat ini */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Berkas PDF</label>
                  {formPdfFile ? (
                    <div className={styles.filePreviewCard}>
                      <div className={styles.filePreviewInfo}>
                        <FileDown size={20} color="#7c3aed" />
                        <span className={styles.filePreviewName}>Ganti dengan: {formPdfFile.name}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.closeModalBtn}
                        onClick={() => setFormPdfFile(null)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : editingMateri.pdfUrl ? (
                    <div className={styles.filePreviewCard}>
                      <div className={styles.filePreviewInfo}>
                        <FileText size={20} color="#7c3aed" />
                        <span className={styles.filePreviewName}>Berkas PDF aktif terlampir</span>
                      </div>
                      <label 
                        className={styles.btnSecondary} 
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.76rem', cursor: 'pointer' }}
                      >
                        Ganti PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setFormPdfFile(e.target.files[0]);
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className={styles.dropzone}>
                      <Upload size={22} color="#8b5cf6" />
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Unggah berkas PDF baru
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setFormPdfFile(e.target.files[0]);
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>

                {/* Konten Tulisan */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ringkasan / Isi Tulisan Materi</label>
                  <textarea
                    value={formKonten}
                    onChange={(e) => setFormKonten(e.target.value)}
                    className={styles.formTextarea}
                  />
                </div>

                {/* Kelola Foto Eksisting & Baru */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Galeri Foto Materi ({existingPhotos.length} foto tersimpan)</label>
                  
                  {existingPhotos.length > 0 && (
                    <div className={styles.photoGrid}>
                      {existingPhotos.map((foto) => (
                        <div key={foto.id} className={styles.photoThumbnail}>
                          <img src={foto.urlFoto} alt="Foto Materi" />
                          <button
                            type="button"
                            className={styles.removePhotoBtn}
                            onClick={() => deletePhotoMutation.mutate(foto.id)}
                            title="Hapus foto ini"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className={styles.dropzone} style={{ marginTop: '0.65rem' }}>
                    <ImageIcon size={22} color="#10b981" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Tambah Foto Tambahan
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {formNewPhotoPreviews.length > 0 && (
                    <div className={styles.photoGrid}>
                      {formNewPhotoPreviews.map((previewUrl, idx) => (
                        <div key={idx} className={styles.photoThumbnail}>
                          <img src={previewUrl} alt={`Foto Baru ${idx + 1}`} />
                          <button
                            type="button"
                            className={styles.removePhotoBtn}
                            onClick={() => removeNewPhoto(idx)}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setEditingMateri(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  <span>Perbarui Materi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ─── MODAL: PRATINJAU (PREVIEW) MATERI ───────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {previewMateri && (
        <div className={styles.modalBackdrop} onClick={() => setPreviewMateri(null)}>
          <div className={`${styles.modalContent} ${styles.modalPreviewContent}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`${styles.courseBadge} ${styles.badgePurple}`}>
                    {previewMateri.matakuliah?.kode || 'MK'}
                  </span>
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {previewMateri.matakuliah?.nama || 'Mata Kuliah'}
                  </span>
                </div>
                <h3 className={styles.modalTitle} style={{ marginTop: '0.35rem' }}>
                  {previewMateri.judul}
                </h3>
              </div>
              <button 
                type="button" 
                className={styles.closeModalBtn}
                onClick={() => setPreviewMateri(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.previewCourseHeader}>
                <span style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
                  Pertemuan ke-{previewMateri.urutan} • {new Date(previewMateri.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>

                {previewMateri.pdfUrl && (
                  <a
                    href={previewMateri.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnPrimary}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                  >
                    <FileDown size={16} />
                    <span>Buka / Unduh Berkas PDF</span>
                  </a>
                )}
              </div>

              {/* Text Content */}
              {previewMateri.konten && (
                <div className={styles.previewBodySection}>
                  <label className={styles.formLabel}>Isi Materi & Catatan Dosen:</label>
                  <div className={styles.previewTextContent}>
                    {previewMateri.konten}
                  </div>
                </div>
              )}

              {/* Photos Gallery */}
              {previewMateri.fotoMateri && previewMateri.fotoMateri.length > 0 && (
                <div className={styles.previewBodySection}>
                  <label className={styles.formLabel}>
                    Foto Pendukung & Dokumentasi Praktikum ({previewMateri.fotoMateri.length} foto):
                  </label>
                  <div className={styles.previewGalleryGrid}>
                    {previewMateri.fotoMateri.map((foto, idx) => (
                      <img
                        key={foto.id}
                        src={foto.urlFoto}
                        alt={`Dokumentasi ${idx + 1}`}
                        className={styles.previewGalleryImg}
                        onClick={() => setActiveGalleryZoom(foto.urlFoto)}
                        title="Klik untuk memperbesar"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  const target = previewMateri;
                  setPreviewMateri(null);
                  openEditModal(target);
                }}
              >
                <Edit3 size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                Ubah Materi
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setPreviewMateri(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Lightbox Photo Zoom ─────────────────────────────────────── */}
      {activeGalleryZoom && (
        <div 
          className={styles.modalBackdrop} 
          style={{ zIndex: 1100, background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setActiveGalleryZoom(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={activeGalleryZoom} 
              alt="Zoomed" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain' }}
            />
            <button
              type="button"
              className={styles.closeModalBtn}
              style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'white' }}
              onClick={() => setActiveGalleryZoom(null)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ─── MODAL: KONFIRMASI HAPUS MATERI ─────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {deletingMateri && (
        <div className={styles.modalBackdrop} onClick={() => setDeletingMateri(null)}>
          <div className={styles.modalContent} style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <h3 className={styles.modalTitle} style={{ color: '#dc2626' }}>Hapus Materi</h3>
                <span className={styles.modalSubtitle}>Tindakan ini tidak dapat dibatalkan.</span>
              </div>
              <button 
                type="button" 
                className={styles.closeModalBtn}
                onClick={() => setDeletingMateri(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus materi <strong>"{deletingMateri.judul}"</strong>?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                Seluruh berkas PDF dan foto pendukung yang terhubung ke materi ini akan ikut dihapus secara permanen.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeletingMateri(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className={`${styles.btnPrimary} ${styles.btnDanger}`}
                onClick={() => deleteMutation.mutate(deletingMateri.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                <span>Hapus Materi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
