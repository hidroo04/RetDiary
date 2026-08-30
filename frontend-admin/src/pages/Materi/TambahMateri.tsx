import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  X, 
  Loader2 
} from 'lucide-react';
import { materiApi } from '@/api/materi.api';
import { matakuliahApi } from '@/api/matakuliah.api';
import styles from './TambahMateri.module.css';

export default function TambahMateriPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ─── Form State ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'tulis' | 'pdf'>('tulis');
  const [judul, setJudul] = useState('');
  const [matakuliahId, setMatakuliahId] = useState('');
  const [konten, setKonten] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');

  // ─── Fetch Courses ─────────────────────────────────────────────────────
  const { data: matakuliahList = [], isLoading: isLoadingMK } = useQuery({
    queryKey: ['matakuliah'],
    queryFn: matakuliahApi.getAll,
  });

  // ─── Live Checklist Calculations ───────────────────────────────────────
  const isJudulFilled = judul.trim().length > 0;
  const isContentOrPdfFilled = activeTab === 'tulis' ? konten.trim().length > 0 : !!pdfFile;
  const isMatakuliahFilled = matakuliahId.trim().length > 0;

  // ─── Handle Photos ─────────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...previews]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ─── Mutation: Save / Publish ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!judul.trim()) {
        throw new Error('Judul materi wajib diisi.');
      }
      if (!matakuliahId) {
        throw new Error('Silakan pilih mata kuliah.');
      }
      if (activeTab === 'tulis' && !konten.trim()) {
        throw new Error('Isi materi tidak boleh kosong saat memilih tab Tulis materi.');
      }
      if (activeTab === 'pdf' && !pdfFile) {
        throw new Error('Silakan unggah berkas PDF saat memilih tab Unggah PDF.');
      }

      // Automatically determine next urutan or default to 1
      const created = await materiApi.create(
        {
          matakuliahId,
          judul: judul.trim(),
          konten: activeTab === 'tulis' ? konten.trim() : undefined,
          urutan: 1,
        },
        activeTab === 'pdf' && pdfFile ? pdfFile : undefined
      );

      // Upload photos if any
      if (photos.length > 0) {
        await materiApi.uploadFoto(created.id, photos);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materi-all'] });
      navigate('/materi');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err?.message || 'Gagal menyimpan materi.');
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      {/* ─── Top Header ────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.subtitle}>PANEL PENGELOLAAN • RETDIARY</span>
          <h1 className={styles.title}>Tambah materi</h1>
          <p className={styles.description}>
            Lengkapi informasi di bawah untuk menyimpan data baru.
          </p>
        </div>

        <button 
          type="button" 
          className={styles.notifBtn}
          title="Pemberitahuan"
          aria-label="Pemberitahuan"
        >
          <Bell size={19} />
        </button>
      </header>

      {/* ─── Two-Column Form Layout ────────────────────────────────── */}
      <div className={styles.formLayout}>
        {/* ─── Left Column: Main Form ──────────────────────────────── */}
        <div className={styles.mainCard}>
          {/* Segmented Tab Switcher */}
          <div className={styles.segmentedTabContainer}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'tulis' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                setActiveTab('tulis');
                setError('');
              }}
            >
              Tulis materi
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'pdf' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                setActiveTab('pdf');
                setError('');
              }}
            >
              Unggah PDF
            </button>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* Form Fields */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}
          >
            {/* Field: Judul materi */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Judul materi</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Pengenalan sistem irigasi tetes"
                className={styles.formInput}
                required
              />
            </div>

            {/* Field: Mata kuliah */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mata kuliah</label>
              <div className={styles.selectWrapper}>
                <select
                  value={matakuliahId}
                  onChange={(e) => setMatakuliahId(e.target.value)}
                  className={styles.formSelect}
                  required
                  disabled={isLoadingMK}
                >
                  <option value="">Pilih mata kuliah</option>
                  {matakuliahList.map((mk) => (
                    <option key={mk.id} value={mk.id}>
                      {mk.nama}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className={styles.selectChevron} />
              </div>
            </div>

            {/* Tab 1: Isi materi (Textarea) */}
            {activeTab === 'tulis' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Isi materi</label>
                <textarea
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  placeholder="Tulis materi, instruksi, atau sumber pembelajaran untuk mahasiswa..."
                  className={styles.formTextarea}
                />
              </div>
            )}

            {/* Tab 2: Unggah PDF (Dropzone) */}
            {activeTab === 'pdf' && (
              <div className={styles.formGroup}>
                {pdfFile ? (
                  <div className={styles.filePreviewCard}>
                    <div className={styles.filePreviewInfo}>
                      <FileText size={26} color="#7c3aed" />
                      <div className={styles.filePreviewDetails}>
                        <span className={styles.filePreviewName}>{pdfFile.name}</span>
                        <span className={styles.filePreviewSize}>{formatFileSize(pdfFile.size)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.removePdfBtn}
                      onClick={() => setPdfFile(null)}
                      title="Hapus berkas PDF"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className={styles.pdfDropzone}>
                    <FileText size={30} className={styles.pdfDropzoneIcon} />
                    <h4 className={styles.pdfDropzoneTitle}>Tarik berkas PDF ke sini</h4>
                    <p className={styles.pdfDropzoneSub}>
                      atau pilih berkas dari perangkat • maksimal 10 MB
                    </p>
                    <span className={styles.pdfSelectBtn}>Pilih PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            )}

            {/* Foto Pendukung (Dropzone) */}
            <div className={styles.formGroup}>
              <label className={styles.fotoDropzone}>
                <ImageIcon size={26} className={styles.fotoDropzoneIcon} />
                <h4 className={styles.fotoDropzoneTitle}>Foto pendukung</h4>
                <p className={styles.fotoDropzoneSub}>
                  Unggah satu atau beberapa foto untuk melengkapi materi.
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </label>

              {photoPreviews.length > 0 && (
                <div className={styles.photoGrid}>
                  {photoPreviews.map((previewUrl, idx) => (
                    <div key={idx} className={styles.photoThumbnail}>
                      <img src={previewUrl} alt={`Foto pendukung ${idx + 1}`} />
                      <button
                        type="button"
                        className={styles.removePhotoBtn}
                        onClick={() => removePhoto(idx)}
                        title="Hapus foto"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ─── Right Column: Sidebar Widgets ───────────────────────── */}
        <aside className={styles.sidebarColumn}>
          {/* Widget 1: Status Publikasi */}
          <div className={styles.statusCard}>
            <span className={`${styles.cardEyebrow} ${styles.eyebrowPurple}`}>
              STATUS PUBLIKASI
            </span>
            <h3 className={styles.cardTitle}>Simpan sebagai draf</h3>
            <p className={styles.cardDesc}>
              Materi dapat dilengkapi kembali sebelum diterbitkan ke mahasiswa.
            </p>
          </div>

          {/* Widget 2: Checklist */}
          <div className={styles.checklistCard}>
            <span className={`${styles.cardEyebrow} ${styles.eyebrowGreen}`}>
              CHECKLIST
            </span>
            <ul className={styles.checklistList}>
              <li className={`${styles.checklistItem} ${isJudulFilled ? styles.checklistItemActive : ''}`}>
                <Check 
                  size={17} 
                  className={`${styles.checkIcon} ${isJudulFilled ? styles.checkIconActive : ''}`} 
                />
                <span>Judul materi</span>
              </li>
              <li className={`${styles.checklistItem} ${isContentOrPdfFilled ? styles.checklistItemActive : ''}`}>
                <Check 
                  size={17} 
                  className={`${styles.checkIcon} ${isContentOrPdfFilled ? styles.checkIconActive : ''}`} 
                />
                <span>Konten atau PDF</span>
              </li>
              <li className={`${styles.checklistItem} ${isMatakuliahFilled ? styles.checklistItemActive : ''}`}>
                <Check 
                  size={17} 
                  className={`${styles.checkIcon} ${isMatakuliahFilled ? styles.checkIconActive : ''}`} 
                />
                <span>Mata kuliah</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons: Batal & Simpan */}
          <div className={styles.actionButtonsRow}>
            <button
              type="button"
              className={styles.btnBatal}
              onClick={() => navigate('/materi')}
            >
              Batal
            </button>
            <button
              type="button"
              className={styles.btnSimpan}
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              <span>Simpan</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
