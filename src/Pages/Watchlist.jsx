import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const BUCKET = 'dxe-anime-posters'
const WATCHLIST_KEY = 'dxe-watchlist'

function readWatchlist() {
  try {
    const value = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function getPosterUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export default function Watchlist() {
  const [savedIds, setSavedIds] = useState(readWatchlist)
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadAnime() {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('anime')
        .select('id, title, description, poster_path, genres, status, dubbing_language, release_year, episode_count')
        .eq('is_published', true)

      if (!active) return

      if (fetchError) {
        console.error('Failed to load watchlist anime:', fetchError)
        setError('Could not load your watchlist. Please try again.')
        setLoading(false)
        return
      }

      const rows = data || []
      const availableIds = new Set(rows.map((item) => item.id))
      const currentIds = readWatchlist()
      // Remove IDs that no longer exist or are no longer publicly published.
      const validIds = currentIds.filter((id) => availableIds.has(id))
      if (validIds.length !== currentIds.length) {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(validIds))
      }
      setSavedIds(validIds)
      setAnime(rows)
      setLoading(false)
    }

    loadAnime()
    return () => {
      active = false
    }
  }, [])

  const savedAnime = useMemo(() => {
    const byId = new Map(anime.map((item) => [item.id, item]))
    return savedIds.map((id) => byId.get(id)).filter(Boolean)
  }, [anime, savedIds])

  function removeFromWatchlist(id) {
    const next = savedIds.filter((savedId) => savedId !== id)
    setSavedIds(next)
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next))
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
        <p className="text-xs font-black tracking-[0.35em] text-red-500">
          YOUR PERSONAL COLLECTION
        </p>
        <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              MY <span className="text-red-500">WATCHLIST.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400">
              Keep the anime you want to watch in one place. Your saved titles are stored in this browser.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${savedAnime.length} saved ${savedAnime.length === 1 ? 'title' : 'titles'}`}
          </p>
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
          <p className="py-24 text-center text-sm text-gray-400">Loading your watchlist...</p>
        ) : !error && savedAnime.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <h2 className="text-xl font-black">YOUR WATCHLIST IS EMPTY.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
              Browse the DXE Anime Library and press “Add to Watchlist” on a title to save it here.
            </p>
            <Link to="/anime" className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 text-xs font-black tracking-wider text-white transition hover:bg-red-500">
              EXPLORE ANIME
            </Link>
          </div>
        ) : !error ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedAnime.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#111114]">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-red-950 via-[#171116] to-black">
                  {item.poster_path ? (
                    <img src={getPosterUrl(item.poster_path)} alt={`${item.title} poster`} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="px-6 text-center">
                      <span className="text-xs font-black tracking-[0.4em] text-red-500">DXE ORIGINALS</span>
                      <h2 className="mt-4 text-2xl font-black">{item.title}</h2>
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded bg-black/70 px-3 py-1 text-[10px] font-black tracking-widest text-red-400">
                    {(item.status || 'Coming Soon').toUpperCase()}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-black">{item.title}</h2>
                  {(item.release_year || item.dubbing_language) && (
                    <p className="mt-2 text-xs text-gray-500">
                      {[item.release_year, item.dubbing_language].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(item.genres || []).map((genre) => (
                      <span key={genre} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-gray-400">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-400">{item.description || 'No description has been added yet.'}</p>
                  {item.episode_count != null && (
                    <p className="mt-2 text-xs text-gray-500">{item.episode_count} episodes</p>
                  )}
                  <button type="button" onClick={() => removeFromWatchlist(item.id)} className="mt-5 w-full rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-xs font-black tracking-widest text-red-300 transition hover:bg-red-500/20">
                    REMOVE FROM WATCHLIST
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs tracking-wider text-gray-600">
        © {new Date().getFullYear()} DUBXEMPIRE · BUILT FOR THE COMMUNITY
      </footer>
    </main>
  )
}
