
import { useMemo, useState } from 'react'

const animeList = [
  {
    id: 1,
    title: 'Love Unseen Beneath',
    genres: ['Romance', 'Drama'],
    status: 'Coming Soon',
    description: 'A romance waiting to be discovered.',
    poster: '',
  },
  {
    id: 2,
    title: 'I Want to End This Love Game',
    genres: ['Romance', 'Comedy'],
    status: 'Coming Soon',
    description: 'Two hearts. One game. Who will confess first?',
    poster: '',
  },
  {
    id: 3,
    title: 'DanMachi',
    genres: ['Fantasy', 'Action', 'Adventure'],
    status: 'Catalog',
    description: 'An adventurer begins a journey through a dangerous dungeon.',
    poster: '',
  },
]

const genres = ['All', 'Romance', 'Drama', 'Comedy', 'Fantasy', 'Action', 'Adventure']

export default function Anime() {
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dxe-watchlist') || '[]')
    } catch {
      return []
    }
  })

  const filteredAnime = useMemo(() => {
    return animeList.filter((anime) => {
      const matchesSearch = anime.title
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesGenre =
        selectedGenre === 'All' || anime.genres.includes(selectedGenre)

      return matchesSearch && matchesGenre
    })
  }, [search, selectedGenre])

  function toggleWatchlist(id) {
    const updated = watchlist.includes(id)
      ? watchlist.filter((item) => item !== id)
      : [...watchlist, id]

    setWatchlist(updated)
    localStorage.setItem('dxe-watchlist', JSON.stringify(updated))
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
            {filteredAnime.length} titles in the catalog
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

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAnime.map((anime) => {
            const saved = watchlist.includes(anime.id)

            return (
              <article
                key={anime.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-[#111114] transition duration-300 hover:-translate-y-1 hover:border-red-500/50"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-red-950 via-[#171116] to-black">
                  {anime.poster ? (
                    <img
                      src={anime.poster}
                      alt={`${anime.title} poster`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="px-6 text-center">
                      <span className="text-xs font-black tracking-[0.4em] text-red-500">
                        DXE ORIGINALS
                      </span>
                      <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                        {anime.title}
                      </h2>
                      <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-red-500" />
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded bg-black/70 px-3 py-1 text-[10px] font-black tracking-widest text-red-400">
                    {anime.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-black">{anime.title}</h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-gray-400"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 min-h-12 text-sm leading-6 text-gray-400">
                    {anime.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => toggleWatchlist(anime.id)}
                    aria-pressed={saved}
                    className={`mt-5 w-full rounded-md px-4 py-3 text-xs font-black tracking-widest transition ${saved
                        ? 'border border-red-500 bg-red-500/10 text-red-400'
                        : 'bg-red-600 text-white hover:bg-red-500'
                      }`}
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
            <p className="mt-2 text-sm text-gray-500">
              Try another title or select a different genre.
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs tracking-wider text-gray-600">
        © {new Date().getFullYear()} DUBXEMPIRE · BUILT FOR THE COMMUNITY
      </footer>
    </main>
  )
}
