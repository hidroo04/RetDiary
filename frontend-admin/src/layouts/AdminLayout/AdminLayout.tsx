import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { LayoutGrid, FileText, Folder, Calendar, ChevronLeft, LogOut } from 'lucide-react';
import styles from './AdminLayout.module.css';

export const AdminLayout = () => {
  const { logout, dosen } = useAuthStore();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Ringkasan', icon: LayoutGrid },
    { path: '/matakuliah', label: 'Mata kuliah', icon: FileText },
    { path: '/materi', label: 'Materi', icon: Folder },
    { path: '/jadwal', label: 'Jadwal', icon: Calendar },
  ];

  return (
    <div className={styles.layout}>
      <GlassCard className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div>
          <div className={styles.header}>
            <div className={styles.avatar}>R</div>
            <div className={styles.userInfo}>
              <span className={styles.appName}>RetDiary</span>
              <span className={styles.userRole}>Polinela - Admin</span>
            </div>
            <button className={styles.collapseBtn} onClick={() => setIsCollapsed(!isCollapsed)}>
              <ChevronLeft size={16} />
            </button>
          </div>

          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                data-tooltip={item.label}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive && item.path === '/' ? styles.active : ''}`
                }
                // Karena NavLink defaultnya partial match, untuk "/" kita butuh exact match logic manual jika ada nested
                style={({ isActive }) => (isActive && item.path === '/' ? { background: 'white', color: '#6a4c9c', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' } : {})}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} />
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout} data-tooltip="Log out">
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <span className={styles.navLabel}>Log out</span>
        </button>
      </GlassCard>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
