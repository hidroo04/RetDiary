import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { Mail, Lock, BookOpen, Calendar, PieChart, ShieldCheck } from 'lucide-react';
import illustrationImg from '../../assets/kelinci.png';
import styles from './Login.module.css';

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg('');
    try {
      const res = await authApi.login(data);
      setAuth(res);
      navigate('/');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat login';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* Kolom Kiri */}
        <div className={styles.leftSide}>
          <div className={styles.leftHeader}>
            <div className={styles.logoLeft}>R</div>
            <span className={styles.leftSubtitle}>RETDIARY • POLINELA</span>
          </div>
          <h1 className={styles.leftTitle}>
            Ruang kerja<br />pengajar,<br />
            <span className={styles.highlightText}>lebih teratur.</span>
          </h1>
          <p className={styles.leftDesc}>
            Kelola materi, jadwal, dan aktivitas pembelajaran dalam satu tempat.
          </p>
          <div className={styles.tags}>
            <span className={styles.tag}>
              <BookOpen size={14} className={styles.tagIconMateri} /> Materi
            </span>
            <span className={styles.tag}>
              <Calendar size={14} className={styles.tagIconJadwal} /> Jadwal
            </span>
            <span className={styles.tag}>
              <PieChart size={14} className={styles.tagIconLaporan} /> Laporan
            </span>
          </div>

          <div className={styles.illustrationWrapper}>
            <img src={illustrationImg} alt="Illustration" className={styles.illustration} />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className={styles.rightSide}>
          <div className={styles.headerRight}>
            <div className={styles.logoRight}>R</div>
            <span>RetDiary Admin </span>
          </div>

          <div className={styles.welcomeText}>SELAMAT DATANG KEMBALI</div>
          <h2 className={styles.mainTitle}>Masuk ke akun Anda</h2>
          <p className={styles.subTitle}>Gunakan akun dosen Anda untuk mengakses panel RetDiary.</p>

          {errorMsg && <div className={styles.alertError}>{errorMsg}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email institusi</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="nama@polinela.ac.id"
                  className={styles.inputField}
                  {...register('email')}
                />
              </div>
              {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.formLabel}>Kata sandi</label>
                <a href="#" className={styles.forgotPassword}>Lupa kata sandi?</a>
              </div>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Masukkan kata sandi"
                  className={styles.inputField}
                  {...register('password')}
                />
              </div>
              {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
            </div>

            <div className={styles.sessionInfo}>
              <ShieldCheck size={17} />
              <span>Sesi aman ini berakhir otomatis saat tab ditutup.</span>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Masuk ke dashboard \u2192'}
            </button>
          </form>

          <div className={styles.footer}>
            Butuh bantuan? Hubungi <a href="#">administrator program studi</a>
          </div>
        </div>

      </div>
    </div>
  );
}
