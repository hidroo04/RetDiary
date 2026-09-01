import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from './Icon'

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const clean = query.trim()
    if (clean) navigate(`/search?q=${encodeURIComponent(clean)}`)
  }
  return <form className={compact ? 'nav-search' : 'big-search'} onSubmit={submit} role="search">
    <Icon name="search" size={compact ? 17 : 20} />
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari mata kuliah atau materi..." aria-label="Cari mata kuliah atau materi" />
    {!compact && <button type="submit" aria-label="Mulai pencarian"><Icon name="arrow" size={19} /></button>}
  </form>
}
