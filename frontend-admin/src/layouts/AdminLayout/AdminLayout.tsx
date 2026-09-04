import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import styles from './AdminLayout.module.css'

const PAGE_NAMES: Record<string, string> = {
  '/': 'Ringkasan',
  '/matakuliah': 'Mata kuliah',
  '/materi': 'Semua materi',
  '/materi/tambah': 'Tambah materi',
  '/jadwal': 'Jadwal',
}

const getInitials = (name?: string) => {
  if (!name) return 'DS'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export const AdminLayout = () => {
  const { dosen, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [materiOpen, setMateriOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (location.pathname.startsWith('/materi')) setMateriOpen(true)
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isMateriActive = location.pathname.startsWith('/materi')
  const currentPageName = PAGE_NAMES[location.pathname] ?? 'RetDiary'

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.mobileTopBar}>
        <div className={styles.mobileBrand}>
          <span className={styles.brandMark}>R</span>
          <div>
            <strong>RetDiary</strong>
            <span>{currentPageName}</span>
          </div>
        </div>
        <button
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {mobileMenuOpen && (
        <button
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Tutup navigasi"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${mobileMenuOpen ? styles.mobileSidebarOpen : ''}`}
      >
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarTop}>
            <div className={styles.brandRow}>
              <div className={styles.brandIdentity}>
                <span className={styles.brandMark}>R</span>
                <div className={styles.brandCopy}>
                  <strong>RetDiary</strong>
                  <span>Panel pengajar</span>
                </div>
              </div>
              <button
                className={styles.collapseButton}
                onClick={() => setIsCollapsed((collapsed) => !collapsed)}
                aria-label={isCollapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
              >
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            </div>

            <span className={styles.navSectionLabel}>Ruang kerja</span>
            <nav className={styles.nav} aria-label="Navigasi utama">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <LayoutDashboard size={19} />
                <span>Ringkasan</span>
                <i />
              </NavLink>

              <NavLink
                to="/matakuliah"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <BookOpen size={19} />
                <span>Mata kuliah</span>
                <i />
              </NavLink>

              <div className={`${styles.navGroup} ${isMateriActive ? styles.navGroupActive : ''}`}>
                <button
                  type="button"
                  className={`${styles.navItem} ${isMateriActive ? styles.groupTriggerActive : ''}`}
                  onClick={() => {
                    if (isCollapsed) setIsCollapsed(false)
                    setMateriOpen((open) => !open)
                  }}
                >
                  <FolderOpen size={19} />
                  <span>Materi</span>
                  <ChevronDown
                    className={`${styles.chevron} ${materiOpen ? styles.chevronOpen : ''}`}
                    size={16}
                  />
                </button>
                <div
                  className={`${styles.subNav} ${materiOpen && !isCollapsed ? styles.subNavOpen : ''}`}
                >
                  <NavLink
                    to="/materi"
                    end
                    className={({ isActive }) =>
                      `${styles.subNavItem} ${isActive ? styles.subNavActive : ''}`
                    }
                  >
                    <FileText size={15} /> Semua materi
                  </NavLink>
                  <NavLink
                    to="/materi/tambah"
                    className={({ isActive }) =>
                      `${styles.subNavItem} ${isActive ? styles.subNavActive : ''}`
                    }
                  >
                    <Plus size={15} /> Tambah materi
                  </NavLink>
                </div>
              </div>

              <NavLink
                to="/jadwal"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <CalendarDays size={19} />
                <span>Jadwal</span>
                <i />
              </NavLink>
            </nav>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.sessionNote}>
              <span className={styles.sessionDot} />
              <div>
                <strong>Sesi aktif</strong>
                <span>Berakhir saat tab ditutup</span>
              </div>
            </div>

            <div className={styles.userCard}>
              <span className={styles.userAvatar}>{getInitials(dosen?.nama)}</span>
              <div className={styles.userDetails}>
                <strong>{dosen?.nama || 'Dosen'}</strong>
                <span>{dosen?.email || 'Pengajar Polinela'}</span>
              </div>
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.desktopTopBar}>
          <div className={styles.topBarStart}>
            {isCollapsed && (
              <button
                type="button"
                className={styles.sidebarOpenButton}
                onClick={() => setIsCollapsed(false)}
                aria-label="Buka sidebar"
                title="Buka sidebar"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            <div className={styles.welcomeGreeting}>
              <span className={styles.greetingAccent} aria-hidden="true" />
              <h1>Selamat datang kembali</h1>
            </div>
          </div>
        </div>

        <div className={styles.mainScrollable}>
          <div className={styles.pageTransition} key={location.pathname}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
