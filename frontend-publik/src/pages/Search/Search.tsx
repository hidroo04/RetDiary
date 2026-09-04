import { Link, useSearchParams } from 'react-router-dom'
import { searchApi } from '@/api/search.api'
import { Icon } from '@/components/ui/Icon'
import { PageIntro } from '@/components/ui/PageIntro'
import { QueryState } from '@/components/ui/AsyncState'
import { SearchBox } from '@/components/ui/SearchBox'
import { useAsyncQuery } from '@/hooks/useAsync'
import './Search.css'

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const results = useAsyncQuery(
    `public:search:${query}`,
    () => searchApi.search(query),
    [query],
    Boolean(query),
  )
  const count = (results.data?.matakuliah.length ?? 0) + (results.data?.materi.length ?? 0)
  return (
    <>
      <PageIntro eyebrow="Pencarian" title="Temukan yang kamu butuhkan">
        <span>Cari berdasarkan nama mata kuliah, kode, atau judul materi.</span>
      </PageIntro>
      <section className="section search-results">
        <div className="container narrow">
          <SearchBox />
          {query && (
            <p className="search-summary">
              {results.isLoading ? 'Mencari...' : `${count} hasil untuk “${query}”`}
            </p>
          )}
          {!query && (
            <div className="state-card">
              <Icon name="search" size={30} />
              <h3>Mulai pencarian</h3>
              <p>Ketik kata kunci pada kolom di atas.</p>
            </div>
          )}
          <QueryState
            error={results.error}
            empty={Boolean(query && !results.isLoading && count === 0)}
          >
            <div className="search-groups">
              {!!results.data?.matakuliah.length && (
                <section>
                  <h2>
                    Mata kuliah <span>{results.data.matakuliah.length}</span>
                  </h2>
                  {results.data.matakuliah.map((course) => (
                    <Link className="search-item" to={`/matakuliah/${course.id}`} key={course.id}>
                      <span className="search-icon">
                        <Icon name="book" />
                      </span>
                      <div>
                        <small>{course.kode}</small>
                        <h3>{course.nama}</h3>
                        <p>{course.deskripsi}</p>
                      </div>
                      <Icon name="arrow" />
                    </Link>
                  ))}
                </section>
              )}
              {!!results.data?.materi.length && (
                <section>
                  <h2>
                    Materi <span>{results.data.materi.length}</span>
                  </h2>
                  {results.data.materi.map((item) => (
                    <Link className="search-item" to={`/materi/${item.id}`} key={item.id}>
                      <span className="search-icon">
                        <Icon name="file" />
                      </span>
                      <div>
                        <small>
                          {item.matakuliah?.nama} · Pertemuan {item.urutan}
                        </small>
                        <h3>{item.judul}</h3>
                      </div>
                      <Icon name="arrow" />
                    </Link>
                  ))}
                </section>
              )}
            </div>
          </QueryState>
        </div>
      </section>
    </>
  )
}
