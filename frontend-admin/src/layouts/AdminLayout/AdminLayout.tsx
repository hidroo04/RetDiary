import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderOpen, 
  CalendarDays, 
  LogOut,
  ChevronDown,
  FileText,
  Plus,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import styles from './AdminLayout.module.css';

export const AdminLayout = () => {
  const { dosen, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [materiOpen, setMateriOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-expand materi dropdown if currently in a /materi route
  useEffect(() => {
    if (location.pathname.startsWith('/materi')) {
      setMateriOpen(true);
    }
  }, [location.pathname]);

  // Tutup drawer mobile saat rute berubah
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isMateriActive = location.pathname.startsWith('/materi');

  return (
    <div className={styles.layoutWrapper}>
      {/* ─── Mobile Top App Bar ────────────────────────────────────────── */}
      <header className={styles.mobileTopBar}>
        <div className={styles.mobileBrand}>
          <div className={styles.avatarMini}>
            <Sparkles size={18} className={styles.sparkleIcon} />
          </div>
          <div className={styles.mobileBrandInfo}>
            <span className={styles.mobileAppName}>RetDiary</span>
            <span className={styles.mobileUserName}>{dosen?.nama || 'Dosen'}</span>
          </div>
        </div>

        <button 
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ─── Mobile Backdrop Overlay ───────────────────────────────────── */}
      {mobileMenuOpen && (
        <div 
          className={styles.mobileBackdrop} 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Modern Floating Pill Sidebar (Desktop & Mobile Drawer) ────── */}
      <aside 
        className={`
          ${styles.sidebar} 
          ${isCollapsed ? styles.collapsed : ''} 
          ${mobileMenuOpen ? styles.mobileSidebarOpen : ''}
        `}
      >
        <div className={styles.sidebarInner}>
          {/* ─── Header / Brand ────────────────────────────────────────── */}
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <div className={styles.logoBadge}>
                <Sparkles size={20} className={styles.sparkleIcon} />
              </div>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.appName}>RetDiary</span>
              <span className={styles.userRole}>POLINELA • DOSEN</span>
            </div>
          </div>

          {/* ─── Main Navigation List ──────────────────────────────────── */}
          <nav className={styles.nav}>
            {/* Dashboard / Ringkasan */}
            <div className={styles.navItemWrapper}>
              <NavLink
                to="/"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                end
              >
                <div className={styles.iconContainer}>
                  <LayoutDashboard size={20} className={styles.navIcon} />
                </div>
                <span className={styles.navLabel}>Ringkasan</span>
              </NavLink>
              {isCollapsed && <div className={styles.tooltipBadge}>Ringkasan</div>}
            </div>
            
            {/* Mata Kuliah */}
            <div className={styles.navItemWrapper}>
              <NavLink
                to="/matakuliah"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.iconContainer}>
                  <BookOpen size={20} className={styles.navIcon} />
                </div>
                <span className={styles.navLabel}>Mata kuliah</span>
              </NavLink>
              {isCollapsed && <div className={styles.tooltipBadge}>Mata kuliah</div>}
            </div>

            {/* Dropdown Materi (Accordion when expanded, Flyout popover when collapsed) */}
            <div className={`${styles.dropdownContainer} ${isMateriActive ? styles.dropdownActiveGroup : ''}`}>
              <div className={styles.navItemWrapper}>
                <button 
                  type="button"
                  className={`${styles.navItem} ${styles.dropdownTrigger} ${isMateriActive ? styles.activeTrigger : ''}`}
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false);
                      setMateriOpen(true);
                    } else {
                      setMateriOpen(!materiOpen);
                    }
                  }}
                >
                  <div className={styles.triggerIconGroup}>
                    <div className={styles.iconContainer}>
                      <FolderOpen size={20} className={styles.navIcon} />
                    </div>
                    <span className={styles.navLabel}>Materi</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`${styles.chevron} ${materiOpen && !isCollapsed ? styles.chevronOpen : ''}`} 
                  />
                </button>

                {/* Flyout Submenu for Collapsed Mode */}
                {isCollapsed && (
                  <div className={styles.flyoutSubmenu}>
                    <div className={styles.flyoutHeader}>Materi</div>
                    <NavLink
                      to="/materi"
                      end
                      className={({ isActive }) => `${styles.flyoutItem} ${isActive ? styles.activeFlyout : ''}`}
                    >
                      <FileText size={15} />
                      <span>Semua materi</span>
                    </NavLink>
                    <NavLink
                      to="/materi/tambah"
                      className={({ isActive }) => `${styles.flyoutItem} ${isActive ? styles.activeFlyout : ''}`}
                    >
                      <Plus size={15} />
                      <span>Tambah materi</span>
                    </NavLink>
                  </div>
                )}
              </div>
              
              {/* Accordion Submenu for Expanded Mode */}
              <div className={`${styles.dropdownContent} ${materiOpen && !isCollapsed ? styles.dropdownOpen : ''}`}>
                <NavLink
                  to="/materi"
                  end
                  className={({ isActive }) => `${styles.subNavItem} ${isActive ? styles.activeSub : ''}`}
                >
                  <FileText size={16} className={styles.navIcon} />
                  <span>Semua materi</span>
                </NavLink>
                <NavLink
                  to="/materi/tambah"
                  className={({ isActive }) => `${styles.subNavItem} ${isActive ? styles.activeSub : ''}`}
                >
                  <Plus size={16} className={styles.navIcon} />
                  <span>Tambah materi</span>
                </NavLink>
              </div>
            </div>

            {/* Jadwal */}
            <div className={styles.navItemWrapper}>
              <NavLink
                to="/jadwal"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.iconContainer}>
                  <CalendarDays size={20} className={styles.navIcon} />
                </div>
                <span className={styles.navLabel}>Jadwal</span>
              </NavLink>
              {isCollapsed && <div className={styles.tooltipBadge}>Jadwal</div>}
            </div>

            {/* Integrated Collapse Toggle */}
            <div className={styles.collapseWrapper}>
              <button 
                type="button"
                className={styles.collapseNavItem}
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div className={styles.iconContainer}>
                  {isCollapsed ? (
                    <PanelLeftOpen size={20} className={styles.navIcon} />
                  ) : (
                    <PanelLeftClose size={20} className={styles.navIcon} />
                  )}
                </div>
                <span className={styles.navLabel}>
                  {isCollapsed ? 'Expand' : 'Collapse Sidebar'}
                </span>
              </button>
              {isCollapsed && <div className={styles.tooltipBadge}>Buka Sidebar</div>}
            </div>
          </nav>

          {/* ─── Footer Section: Log Out Only ─── */}
          <div className={styles.footerSection}>
            <div className={styles.navItemWrapper}>
              <button 
                type="button" 
                className={`${styles.navItem} ${styles.logoutBtn}`}
                onClick={handleLogout}
                aria-label="Log out"
              >
                <div className={styles.iconContainer}>
                  <LogOut size={20} className={styles.navIcon} />
                </div>
                <span className={styles.navLabel}>Log out</span>
              </button>
              {isCollapsed && <div className={styles.tooltipBadge}>Log out</div>}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ────────────────────────────────────────── */}
      <main className={styles.mainContent}>
        <div className={styles.mainScrollable}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
