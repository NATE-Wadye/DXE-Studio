
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('anime_requests')
      .select('id, title, language, genre, reason, status, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRequests(data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function updateStatus(id, status) {
    setBusyId(id)
    setError('')
    setMessage('')

    const { error: updateError } = await supabase
      .from('anime_requests')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setRequests((current) =>
        current.map((request) =>
          request.id === id ? { ...request, status } : request
        )
      )
      setMessage(`Request ${status}.`)
    }

    setBusyId(null)
  }

  async function logout() {
    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      setError(logoutError.message)
      return
    }

    window.location.href = '/auth'
  }

  const visibleRequests =
    filter === 'all'
      ? requests
      : requests.filter((request) => request.status === filter)

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-10 text-white sm:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="font-black tracking-widest">
          <span className="text-red-500">DXE</span> ADMIN
        </Link>
        <button
          onClick={logout}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-red-500 hover:text-white"
        >
          LOG OUT
        </button>
      </header>

      <section className="mx-auto mt-12 max-w-6xl">
        <p className="text-xs font-bold tracking-[0.3em] text-red-500">
          CONTROL CENTER
        </p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">
          WELCOME, ADMIN<span className="text-red-500">.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
          Manage community anime requests and keep the DXE library moving.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            ['PENDING', counts.pending],
            ['APPROVED', counts.approved],
            ['REJECTED', counts.rejected],
          ].map(([label, count]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-[10px] font-bold tracking-widest text-white/40 sm:text-xs">
                {label}
              </p>
              <p className="mt-2 text-2xl font-black">{count}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black">Anime Requests</h2>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-red-500 disabled:opacity-50"
          >
            {loading ? 'LOADING...' : '↻ REFRESH'}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                filter === value
                  ? 'bg-red-600 text-white'
                  : 'border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-5 rounded-lg border border-white/10 p-4 text-sm text-white/80">
            {message}
          </p>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-white/50">
            Loading requests...
          </p>
        ) : visibleRequests.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 p-10 text-center">
            <p className="text-lg font-bold">No requests here yet.</p>
            <p className="mt-2 text-sm text-white/40">
              New community submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">{request.title}</h3>
                    <p className="mt-2 text-xs text-white/45">
                      {request.genre || 'Unspecified genre'}
                      {request.language ? ` · ${request.language}` : ''}
                      {' · '}
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      request.status === 'approved'
                        ? 'border-emerald-500/30 text-emerald-300'
                        : request.status === 'rejected'
                          ? 'border-red-500/30 text-red-300'
                          : 'border-amber-500/30 text-amber-300'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                {request.reason && (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/65">
                    {request.reason}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {request.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(request.id, 'approved')}
                      disabled={busyId === request.id}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {busyId === request.id ? 'SAVING...' : '✓ APPROVE'}
                    </button>
                  )}

                  {request.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(request.id, 'rejected')}
                      disabled={busyId === request.id}
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold transition hover:bg-red-500 disabled:opacity-50"
                    >
                      {busyId === request.id ? 'SAVING...' : '✕ REJECT'}
                    </button>
                  )}

                  {request.status !== 'pending' && (
                    <button
                      onClick={() => updateStatus(request.id, 'pending')}
                      disabled={busyId === request.id}
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-white/60 transition hover:text-white disabled:opacity-50"
                    >
                      RESET TO PENDING
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            to="/anime"
            className="rounded-2xl border border-white/10 p-6 transition hover:border-red-500/60"
          >
            <p className="text-xs font-bold tracking-widest text-red-500">
              LIBRARY
            </p>
            <h2 className="mt-3 text-xl font-black">Anime Collection ↗</h2>
            <p className="mt-2 text-sm text-white/50">
              Open the anime library. Adding and editing anime is a separate
              step.
            </p>
          </Link>

          <Link
            to="/request"
            className="rounded-2xl border border-white/10 p-6 transition hover:border-red-500/60"
          >
            <p className="text-xs font-bold tracking-widest text-red-500">
              COMMUNITY
            </p>
            <h2 className="mt-3 text-xl font-black">Public Request Page ↗</h2>
            <p className="mt-2 text-sm text-white/50">
              Check the submission experience.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
