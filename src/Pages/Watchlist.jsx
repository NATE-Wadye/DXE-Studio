
import { useEffect, useState } from 'react'


const animeList = [
  {
    id: 1,
    title: 'Love Unseen Beneath',
    genres: ['Romance', 'Drama'],
    status: 'Coming Soon',
  },
  {
    id: 2,
    title: 'I Want to End This Love Game',
    genres: ['Romance', 'Comedy'],
    status: 'Coming Soon',
  },
  {
    id: 3,
    title: 'DanMachi',
    genres: ['Fantasy', 'Action', 'Adventure'],
    status: 'Catalog',
  },
]

export default function Watchlist() {
  const [savedIds, setSavedIds] = useState([])

  useEffect(() => {
    try {
      setSavedIds(
        JSON.parse(localStorage.getItem('dxe-watchlist') || '[]')
      )
    } catch {
      setSavedIds([])
    }
  }, [])

  function removeAnime(id) {
    const updated = savedIds.filter((savedId) => savedId !== id)
    setSavedIds(updated)
    localStorage.setItem('dxe-watchlist', JSON.stringify(updated))
  }

  const savedAnime = animeList.filter((anime) => savedIds.includes(anime.id))

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <section className="mx-auto max-w-7xl px-5 py-16">
        <p className="text-xs font-black tracking-[0.35em] text-red-500">
          YOUR COLLECTION
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-6xl">
          MY WATCHLIST<span className="text-red-500">.</span>
        </h1>

        <p className="mt-4 text-sm text-gray-400">
          Your saved anime, all in one place.
        </p>

        {savedAnime.length === 0 ? (
          <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <h2 className="text-2xl font-black">YOUR LIST IS EMPTY.</h2>
            <p className="mt-3 text-sm text-gray-400">
              Visit the Anime Library and save something you want to watch.
            </p>
            <a
              href="/anime"
              className="mt-7 inline-block rounded-md bg-red-600 px-6 py-3 text-xs font-black tracking-widest hover:bg-red-500"
            >
              EXPLORE ANIME ↗
            </a>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedAnime.map((anime) => (
              <article
                key={anime.id}
                className="rounded-xl border border-white/10 bg-[#111114] p-6"
              >
                <p className="text-xs font-black tracking-widest text-red-500">
                  {anime.status.toUpperCase()}
                </p>

                <h2 className="mt-4 text-xl font-black">{anime.title}</h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => removeAnime(anime.id)}
                  className="mt-6 w-full rounded-md border border-red-500/50 px-4 py-3 text-xs font-black tracking-widest text-red-400 hover:bg-red-500/10"
                >
                  REMOVE FROM WATCHLIST
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
