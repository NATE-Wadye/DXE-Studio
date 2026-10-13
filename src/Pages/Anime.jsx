import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'dxe-anime-posters'
const WATCHLIST_KEY = 'dxe-watchlist'

function getPosterUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

function readWatchlist() {
  try {
    const value = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export default function Anime() {
  const [animeList, setAnimeList] = useState([])
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [watchlist, setWatchlist] = useState(readWatchlist)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadAnime() {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('anime')
        .select('id, title, description, poster_path, genres, aliases, status, dubbing_language, release_year, episode_count, is_published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (!active) return

      if (fetchError) {
        console.error('Failed to load anime:', fetchError)
        setError('Could not load the anime library. Please try again.')
        setLoading(false)
        return
      }

      const rows = (data || []).map((item) => ({
        ...item,
        poster: getPosterUrl(item.poster_path),
        genres: item.genres || [],
        aliases: item.aliases || [],
      }))

      setAnimeList(rows)
      setLoading(false)
    }

    loadAnime()
    return () => {
      active = false
    }
  }, [])

  const genres = useMemo(() => {
    const allGenres = animeList.flatMap((item) => item.genres)
    return ['All', ...new Set(allGenres)].sort((a, b) => {
      if (a === 'All') return -1
      if (b === 'All') return 1
      return a.localeCompare(b)
    })
  }, [animeList])

  const filteredAnime = useMemo(() => {
    const term = search.trim().toLowerCase()
    return animeList.filter((anime) => {
      const matchesSearch =
        !term ||
        anime.title.toLowerCase().includes(term) ||
        anime.aliases.some((alias) => alias.toLowerCase().includes(term))
      const matchesGenre =
        selectedGenre === 'All' || anime.genres.includes(selectedGenre)
      return matchesSearch && matchesGenre
    })
  }, [animeList, search, selectedGenre])

  function toggleWatchlist(id) {
    const updated = watchlist.includes(id)
      ? watchlist.filter((item) => item !== id)
      : [...watchlist, id]

    setWatchlist(updated)
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated))
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
        <p className="text-xs font-black tracking-[0.35em] text-red-500">
          THE DXE COLLECTION
        </p>

        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              ANIME <span className="text-red-500">LIBRARY.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400">
              Explore anime selected for the DXE community. Discover your next
              favorite and save it to your personal watchlist.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading library...' : `${filteredAnime.length} titles in the catalog`}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search anime..."
            aria-label="Search anime"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-red-500 sm:max-w-sm"
          />
          <select
            value={selectedGenre}
            onChange={(event) => setSelectedGenre(event.target.value)}
            aria-label="Filter by genre"
            className="rounded-lg border border-white/10 bg-[#151518] px-4 py-3 text-sm text-white outline-none focus:border-red-500"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre === 'All' ? 'All genres' : genre}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div role="alert" className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
            <button type="button" onClick={() => window.location.reload()} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-24 text-center text-sm text-gray-400">Loading the DXE anime library...</p>
        ) : !error && (
          <>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAnime.map((anime) => {
                const saved = watchlist.includes(anime.id)
                return (
                  <article key={anime.id} className="group overflow-hidden rounded-xl border border-white/10 bg-[#111114] transition duration-300 hover:-translate-y-1 hover:border-red-500/50">
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-red-950 via-[#171116] to-black">
                      {anime.poster ? (
                        <img src={anime.poster} alt={`${anime.title} poster`} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="px-6 text-center">
                          <span className="text-xs font-black tracking-[0.4em] text-red-500">DXE ORIGINALS</span>
                          <h2 className="mt-4 text-2xl font-black sm:text-3xl">{anime.title}</h2>
                          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-red-500" />
                        </div>
                      )}
                      <span className="absolute left-4 top-4 rounded bg-black/70 px-3 py-1 text-[10px] font-black tracking-widest text-red-400">
                        {(anime.status || 'Coming Soon').toUpperCase()}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-black">{anime.title}</h2>
                      {(anime.release_year || anime.dubbing_language) && (
                        <p className="mt-2 text-xs text-gray-500">
                          {[anime.release_year, anime.dubbing_language].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {anime.genres.map((genre) => (
                          <span key={genre} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-gray-400">{genre}</span>
                        ))}
                      </div>
                      <p className="mt-4 min-h-12 text-sm leading-6 text-gray-400">{anime.description}</p>
                      {anime.episode_count != null && (
                        <p className="mt-2 text-xs text-gray-500">{anime.episode_count} episodes</p>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleWatchlist(anime.id)}
                        aria-pressed={saved}
                        className={`mt-5 w-full rounded-md px-4 py-3 text-xs font-black tracking-widest transition ${saved ? 'border border-red-500 bg-red-500/10 text-red-400' : 'bg-red-600 text-white hover:bg-red-500'}`}
                      >
                        {saved ? '✓ ADDED TO WATCHLIST' : '+ ADD TO WATCHLIST'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {filteredAnime.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-xl font-black">NO ANIME FOUND.</p>
                <p className="mt-2 text-sm text-gray-500">Try another title or select a different genre.</p>
              </div>
            )}
          </>
        )}
      </section>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs tracking-wider text-gray-600">
        © {new Date().getFullYear()} DUBXEMPIRE · BUILT FOR THE COMMUNITY
      </footer>
    </main>
  )
}
