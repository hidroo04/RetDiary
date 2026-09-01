import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { SearchBox } from '@/components/ui/SearchBox'
import { Brand } from './Brand'
import './Navbar.css'

const navigation = [
  { to: '/', label: 'Beranda', icon: 'home' as const, end: true },
  { to: '/matakuliah', label: 'Mata Kuliah', icon: 'book' as const },
  { to: '/jadwal', label: 'Jadwal', icon: 'calendar' as const },
  { to: '/tentang', label: 'Tentang' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled((current) => current ? window.scrollY > 10 : window.scrollY > 32)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return <header className={`ret-navbar ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="ret-navbar__inner">
      <Brand />
      <nav className={`ret-navbar__links ${open ? 'is-open' : ''}`} aria-label="Navigasi utama" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setOpen(false) }}>
        {navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.end}>{item.icon && <Icon name={item.icon} size={17} />}{item.label}</NavLink>)}
        <div className="ret-navbar__mobile-search"><SearchBox compact /></div>
      </nav>
      <div className="ret-navbar__search"><SearchBox compact /></div>
      <button className="ret-navbar__menu" onClick={() => setOpen((value) => !value)} aria-label="Buka menu" aria-expanded={open}><Icon name={open ? 'x' : 'menu'} /></button>
    </div>
  </header>
}
