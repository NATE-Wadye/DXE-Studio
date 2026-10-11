
import { useState } from 'react'


const STORAGE_KEY = 'dxe-anime-requests'

export default function Request() {
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('')
  const [genre, setGenre] = useState('Action')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  function handleSubmit(event) {
    event.preventDefault()

    const newRequest = {
      id: `${Date.now()}-${Math.random()}`,
      title: title.trim(),
      language: language.trim(),
      genre,
      reason: reason.trim(),
      date: new Date().toLocaleDateString(),
    }

    const updated = [newRequest, ...requests]

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setRequests(updated)
      setTitle('')
      setLanguage('')
      setGenre('Action')
      setReason('')
      setMessage('Your request has been saved on this browser!')
    } catch {
      setMessage('Could not save the request. Please check your browser storage.')
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[1fr_0.8fr] lg:py-20">
        <div>
          <p className="text-xs font-black tracking-[0.35em] text-red-500">
            YOUR VOICE MATTERS
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            REQUEST A <span className="text-red-500">DUB.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400">
            Have an anime you want to hear dubbed by DXE? Tell us about it.
            Your suggestion can help inspire our future projects.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-8"
          >
            <div>
              <label htmlFor="anime-title" className="mb-2 block text-xs font-bold tracking-widest text-gray-300">
                ANIME TITLE *
              </label>
              <input
                id="anime-title"
                required
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter the anime title"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="original-language" className="mb-2 block text-xs font-bold tracking-widest text-gray-300">
                ORIGINAL LANGUAGE
              </label>
              <input
                id="original-language"
                maxLength={60}
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                placeholder="e.g. Japanese"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="anime-genre" className="mb-2 block text-xs font-bold tracking-widest text-gray-300">
                GENRE
              </label>
              <select
                id="anime-genre"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#151518] px-4 py-3 text-sm outline-none focus:border-red-500"
              >
                {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Other'].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="request-reason" className="mb-2 block text-xs font-bold tracking-widest text-gray-300">
                WHY SHOULD DXE DUB IT?
              </label>
              <textarea
                id="request-reason"
                maxLength={1000}
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Tell us why you'd love to hear this anime dubbed..."
                className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-6 py-4 text-xs font-black tracking-[0.2em] transition hover:bg-red-500"
            >
              SUBMIT REQUEST ↗
            </button>

            {message && (
              <p role="status" className="text-sm text-red-300">
                {message}
              </p>
            )}
          </form>
        </div>

        <aside>
          <div className="rounded-xl border border-white/10 bg-[#111114] p-6 sm:p-8">
            <p className="text-xs font-black tracking-[0.3em] text-red-500">
              COMMUNITY PICKS
            </p>
            <h2 className="mt-3 text-2xl font-black">YOUR REQUESTS.</h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Requests submitted from this browser appear here. They are not
              public or visible to the DXE team until a shared backend is added.
            </p>

            <div className="mt-7 space-y-4">
              {requests.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 p-5 text-sm text-gray-500">
                  No requests yet. Be the first to suggest an anime!
                </p>
              ) : (
                requests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-lg border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold">{request.title}</h3>
                      <span className="text-[10px] text-gray-500">{request.date}</span>
                    </div>
                    <p className="mt-2 text-xs text-red-400">{request.genre}</p>
                    {request.language && (
                      <p className="mt-2 text-xs text-gray-400">
                        Language: {request.language}
                      </p>
                    )}
                    {request.reason && (
                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {request.reason}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
