import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
const BUCKET = 'dxe-anime-posters'
const MAX_FEATURED = 8
const MAX_TRENDING = 15
const MAX_POSTER_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]
const emptyAnime = {
  id: null,
  title: '',
  description: '',
  poster_path: '',
  genresText: '',
  dubbing_language: '',
  status: 'Coming Soon',
  release_year: '',
  episode_count: '',
  studio_credits: '',
  aliasesText: '',
  is_featured: false,
  is_trending: false,
  is_published: false,
}
function splitList(value) {
  return [...new Set(
    value.split(',').map((item) => item.trim()).filter(Boolean)
  )]
}
function posterUrl(path) {
  if (!path) return ''
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
export default function Admin() {
  const [requests, setRequests] = useState([])
  const [animeList, setAnimeList] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [animeLoading, setAnimeLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [animeError, setAnimeError] = useState('')
  const [animeMessage, setAnimeMessage] = useState('')
  const [form, setForm] = useState(emptyAnime)
  const [posterFile, setPosterFile] = useState(null)
  const [savingAnime, setSavingAnime] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('anime_requests')
      .select('id, title, language, genre, reason, status, created_at')
      .order('created_at', { ascending: false })
    if (fetchError) setError(fetchError.message)
    else setRequests(data ?? [])
    setLoading(false)
  }, [])
  const loadAnime = useCallback(async () => {
    setAnimeLoading(true)
    setAnimeError('')
    const { data, error: fetchError } = await supabase
      .from('anime')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) setAnimeError(fetchError.message)
    else setAnimeList(data ?? [])
    setAnimeLoading(false)
  }, [])
  useEffect(() => {
    loadRequests()
    loadAnime()
  }, [loadRequests, loadAnime])
  function startNewAnime() {
    setForm({ ...emptyAnime })
    setPosterFile(null)
    setAnimeError('')
    setAnimeMessage('')
    setShowForm(true)
  }
  function startEditAnime(anime) {
    setForm({
      ...anime,
      genresText: (anime.genres ?? []).join(', '),
      aliasesText: (anime.aliases ?? []).join(', '),
      release_year: anime.release_year ?? '',
      episode_count: anime.episode_count ?? '',
    })
    setPosterFile(null)
    setAnimeError('')
    setAnimeMessage('')
    setShowForm(true)
  }
  function closeForm() {
    setShowForm(false)
    setForm({ ...emptyAnime })
    setPosterFile(null)
  }

  function changeField(event) {
    const { name, value, type, checked } = event.target

    // Count other anime already selected, excluding the anime being edited.
    if (type === 'checkbox' && checked) {
      if (name === 'is_featured' && !form.is_featured) {
        const count = animeList.filter(
          (anime) => anime.is_featured && anime.id !== form.id
        ).length

        if (count >= MAX_FEATURED) {
          setAnimeError(`You can select a maximum of ${MAX_FEATURED} featured anime.`)
          return
        }
      }

      if (name === 'is_trending' && !form.is_trending) {
        const count = animeList.filter(
          (anime) => anime.is_trending && anime.id !== form.id
        ).length

        if (count >= MAX_TRENDING) {
          setAnimeError(`You can select a maximum of ${MAX_TRENDING} trending anime.`)
          return
        }
      }
    }

    setAnimeError('')
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  async function saveAnime(event) {
    event.preventDefault()
    setAnimeError('')
    setAnimeMessage('')
    const title = form.title.trim()
    if (!title) {
      setAnimeError('Anime title is required.')
      return

    }
    if (posterFile) {
      if (!ALLOWED_TYPES.includes(posterFile.type)) {
        setAnimeError('Use a JPEG, PNG, WebP, or AVIF poster.')
        return
      }
      if (posterFile.size > MAX_POSTER_SIZE) {
        setAnimeError('Poster must be 5 MB or smaller.')
        return
      }
    }
    const featuredCount = animeList.filter(
      (anime) => anime.is_featured && anime.id !== form.id
    ).length

    const trendingCount = animeList.filter(
      (anime) => anime.is_trending && anime.id !== form.id
    ).length

    if (form.is_featured && featuredCount >= MAX_FEATURED) {
      setAnimeError(`You can select a maximum of ${MAX_FEATURED} featured anime.`)
      return
    }

    if (form.is_trending && trendingCount >= MAX_TRENDING) {
      setAnimeError(`You can select a maximum of ${MAX_TRENDING} trending anime.`)
      return
    }
    setSavingAnime(true)
    let uploadedPath = ''
    const oldPosterPath = form.poster_path || ''
    try {
      let featuredWarning = ''

      if (posterFile) {
        const safeName = posterFile.name
          .replace(/[^a-zA-Z0-9._-]/g, '-')
          .slice(-100)
        uploadedPath = `anime/${crypto.randomUUID()}-${safeName}`
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedPath, posterFile, {
            contentType: posterFile.type,
            upsert: false,
          })
        if (uploadError) throw uploadError
      }
      const payload = {
        title,
        description: form.description.trim(),
        poster_path: uploadedPath || oldPosterPath || null,
        genres: splitList(form.genresText),
        dubbing_language: form.dubbing_language.trim(),
        status: form.status,
        release_year: form.release_year === ''
          ? null
          : Number(form.release_year),
        episode_count: form.episode_count === ''
          ? null
          : Number(form.episode_count),
        studio_credits: form.studio_credits.trim(),
        aliases: splitList(form.aliasesText),
        is_featured: form.is_featured,
        is_trending: form.is_trending,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }
      if (
        payload.release_year !== null &&
        (!Number.isInteger(payload.release_year) ||
          payload.release_year < 1900 ||
          payload.release_year > 2100)
      ) {
        throw new Error('Enter a valid release year between 1900 and 2100.')
      }
      if (
        payload.episode_count !== null &&
        (!Number.isInteger(payload.episode_count) ||
          payload.episode_count < 0)
      ) {
        throw new Error('Episode count must be zero or a positive integer.')
      }
      let savedAnimeId = form.id || null
      let saveError
      if (form.id) {
        const result = await supabase
          .from('anime')
          .update(payload)
          .eq('id', form.id)
          .select('id')
          .single()
        saveError = result.error
        savedAnimeId = result.data?.id || form.id
      } else {
        const result = await supabase
          .from('anime')
          .insert(payload)
          .select('id')
          .single()
        saveError = result.error
        savedAnimeId = result.data?.id || null
      }
      if (saveError) throw saveError

      // Remove the previous image only after the database save succeeds.
      if (uploadedPath && oldPosterPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([oldPosterPath])
        if (cleanupError) {
          console.warn('Old poster cleanup failed:', cleanupError.message)
        }
      }
      setAnimeMessage((form.id ? 'Anime updated.' : 'Anime added.') + (featuredWarning || ''))
      closeForm()
      await loadAnime()
    } catch (saveError) {
      // Avoid leaving a newly uploaded file behind when saving fails.
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath])
      }
      setAnimeError(saveError.message || 'Could not save anime.')
    } finally {
      setSavingAnime(false)
    }
  }
  async function deleteAnime(anime) {
    if (!window.confirm(`Delete "${anime.title}" from the library?`)) return
    setAnimeError('')
    setAnimeMessage('')
    setBusyId(anime.id)
    try {
      const { error: deleteError } = await supabase
        .from('anime')
        .delete()
        .eq('id', anime.id)
      if (deleteError) throw deleteError
      if (anime.poster_path) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .remove([anime.poster_path])
        if (storageError) {
          setAnimeMessage(
            'Anime deleted, but its old poster could not be removed.'
          )
        } else {
          setAnimeMessage('Anime deleted.')
        }
      } else {
        setAnimeMessage('Anime deleted.')
      }
      await loadAnime()
    } catch (deleteError) {
      setAnimeError(deleteError.message || 'Could not delete anime.')
    } finally {
      setBusyId(null)
    }
  }
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
  const visibleRequests = filter === 'all'
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
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-red-500 hover:text-white"
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
          Manage the DXE anime catalog and community requests.
        </p>
        {/* Anime management */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Anime Collection</h2>
            <p className="mt-2 text-sm text-white/50">
              {animeList.length} titles · Manage posters and catalog details
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadAnime}
              disabled={animeLoading}
              className="rounded-lg border border-white/10 px-4 py-3 text-sm hover:border-red-500 disabled:opacity-50"
            >
              ↻ REFRESH
            </button>
            <button
              onClick={startNewAnime}
              className="rounded-lg bg-red-600 px-5 py-3 text-sm font-black hover:bg-red-500"
            >
              + ADD ANIME
            </button>
          </div>
        </div>
        {animeError && (
          <p role="alert" className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {animeError}
          </p>
        )}
        {animeMessage && (
          <p role="status" className="mt-5 rounded-lg border border-white/10 p-4 text-sm text-white/80">
            {animeMessage}
          </p>
        )}
        {showForm && (
          <form
            onSubmit={saveAnime}
            className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black">
                {form.id ? 'EDIT ANIME' : 'ADD NEW ANIME'}
              </h3>
              <button type="button" onClick={closeForm} className="text-sm text-white/50 hover:text-white">
                CANCEL
              </button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-white/70">
                Anime title *
                <input
                  name="title"
                  required
                  maxLength={160}
                  value={form.title}
                  onChange={changeField}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
              </label>
              <label className="block text-sm text-white/70">
                Dubbing language
                <input
                  name="dubbing_language"
                  maxLength={100}
                  value={form.dubbing_language}
                  onChange={changeField}
                  placeholder="e.g. Hindi, English"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
              </label>
              <label className="block text-sm text-white/70 sm:col-span-2">
                Synopsis / description
                <textarea
                  name="description"
                  maxLength={5000}
                  rows={4}
                  value={form.description}
                  onChange={changeField}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
              </label>
              <label className="block text-sm text-white/70">
                Genres
                <input
                  name="genresText"
                  value={form.genresText}
                  onChange={changeField}
                  placeholder="Romance, Drama, Fantasy"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
                <span className="mt-1 block text-xs text-white/40">Separate genres with commas.</span>
              </label>
              <label className="block text-sm text-white/70">
                Alternative titles / aliases
                <input
                  name="aliasesText"
                  value={form.aliasesText}
                  onChange={changeField}
                  placeholder="Alternate title, Japanese title"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
                <span className="mt-1 block text-xs text-white/40">Separate titles with commas.</span>
              </label>
              <label className="block text-sm text-white/70">
                Library status
                <select
                  name="status"
                  value={form.status}
                  onChange={changeField}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#151518] px-4 py-3 text-white outline-none focus:border-red-500"
                >
                  <option>Coming Soon</option>
                  <option>Available</option>
                  <option>Catalog</option>
                </select>
              </label>
              <label className="block text-sm text-white/70">
                Release year
                <input
                  type="number"
                  name="release_year"
                  min="1900"
                  max="2100"
                  value={form.release_year}
                  onChange={changeField}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
              </label>
              <label className="block text-sm text-white/70">
                Episode count
                <input
                  type="number"
                  name="episode_count"
                  min="0"
                  step="1"
                  value={form.episode_count}
                  onChange={changeField}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
              </label>
              <label className="block text-sm text-white/70 sm:col-span-2">
                Original studio / source credits
                <textarea
                  name="studio_credits"
                  maxLength={1000}
                  rows={2}
                  value={form.studio_credits}
                  onChange={changeField}
                  placeholder="Studio, original creator, source material..."
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-500"
                />
              </label>
              <div className="sm:col-span-2">
                <label className="block text-sm text-white/70">
                  Poster image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(event) => setPosterFile(event.target.files?.[0] ?? null)}
                    className="mt-2 block w-full text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white"
                  />
                  <span className="mt-2 block text-xs text-white/40">
                    JPEG, PNG, WebP, or AVIF · Maximum 5 MB.
                    {form.poster_path && !posterFile ? ' Existing poster will be kept.' : ''}
                  </span>
                </label>
                {(posterFile || form.poster_path) && (
                  <img
                    src={posterFile ? URL.createObjectURL(posterFile) : posterUrl(form.poster_path)}
                    alt="Anime poster preview"
                    className="mt-4 max-h-64 max-w-44 rounded-lg border border-white/10 object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={Boolean(form.is_featured)}
                  onChange={changeField}
                  className="accent-red-500"
                />
                Featured anime (homepage hero)
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  name="is_trending"
                  checked={Boolean(form.is_trending)}
                  onChange={changeField}
                  className="accent-red-500"
                />
                Show in Trending Now
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={Boolean(form.is_published)}
                  onChange={changeField}
                  className="accent-red-500"
                />
                Publish to public library
              </label>
            </div>
            <button
              type="submit"
              disabled={savingAnime}
              className="rounded-lg bg-red-600 px-6 py-3 text-sm font-black hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingAnime ? 'SAVING...' : form.id ? 'SAVE CHANGES' : 'ADD ANIME'}
            </button>
          </form>
        )}
        <div className="mt-6 space-y-3">
          {animeLoading ? (
            <p className="py-10 text-center text-sm text-white/50">Loading anime...</p>
          ) : animeList.length === 0 ? (
            <p className="rounded-xl border border-white/10 p-8 text-center text-white/50">
              No anime found. Add your first title above.
            </p>
          ) : animeList.map((anime) => (
            <article key={anime.id} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
              {anime.poster_path ? (
                <img src={posterUrl(anime.poster_path)} alt="" className="h-24 w-16 rounded object-cover" />
              ) : (
                <div className="flex h-24 w-16 items-center justify-center rounded bg-red-950 text-xs font-black">DXE</div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-black">{anime.title}</h3>
                <p className="mt-1 text-xs text-white/50">
                  {(anime.genres ?? []).join(' · ') || 'No genres'}
                  {' · '}{anime.status}
                </p>
                <p className={`mt-2 text-xs ${anime.is_published ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {anime.is_published ? 'PUBLISHED' : 'DRAFT'}
                  {anime.is_featured ? ' · FEATURED' : ''}{anime.is_trending ? ' · TRENDING' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEditAnime(anime)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:border-red-500">
                  EDIT
                </button>
                <button onClick={() => deleteAnime(anime)} disabled={busyId === anime.id} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-50">
                  {busyId === anime.id ? 'WAIT...' : 'DELETE'}
                </button>
              </div>
            </article>
          ))}
        </div>
        {/* Existing request moderation */}
        <div className="mt-16 border-t border-white/10 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Anime Requests</h2>
              <p className="mt-2 text-sm text-white/50">Review submissions from the DXE community.</p>
            </div>
            <button onClick={loadRequests} disabled={loading} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:border-red-500 disabled:opacity-50">
              {loading ? 'LOADING...' : '↻ REFRESH'}
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['PENDING', counts.pending],
              ['APPROVED', counts.approved],
              ['REJECTED', counts.rejected],
            ].map(([label, count]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-bold tracking-widest text-white/40 sm:text-xs">{label}</p>
                <p className="mt-2 text-2xl font-black">{count}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected', 'all'].map((value) => (
              <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${filter === value ? 'bg-red-600 text-white' : 'border border-white/10 text-white/50 hover:text-white'}`}>
                {value}
              </button>
            ))}
          </div>
          {error && <p role="alert" className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="mt-5 rounded-lg border border-white/10 p-4 text-sm text-white/80">{message}</p>}
          {loading ? (
            <p className="py-12 text-center text-sm text-white/50">Loading requests...</p>
          ) : visibleRequests.length === 0 ? (
            <p className="mt-6 rounded-xl border border-white/10 p-8 text-center text-white/50">No requests here yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {visibleRequests.map((request) => (
                <article key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">{request.title}</h3>
                      <p className="mt-2 text-xs text-white/45">
                        {request.genre || 'Unspecified genre'}
                        {request.language ? ` · ${request.language}` : ''}
                        {' · '}{new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      {request.status}
                    </span>
                  </div>
                  {request.reason && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/65">{request.reason}</p>}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {request.status !== 'approved' && (
                      <button onClick={() => updateStatus(request.id, 'approved')} disabled={busyId === request.id} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold disabled:opacity-50">
                        ✓ APPROVE
                      </button>
                    )}
                    {request.status !== 'rejected' && (
                      <button onClick={() => updateStatus(request.id, 'rejected')} disabled={busyId === request.id} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold disabled:opacity-50">
                        ✕ REJECT
                      </button>
                    )}
                    {request.status !== 'pending' && (
                      <button onClick={() => updateStatus(request.id, 'pending')} disabled={busyId === request.id} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-white/60 disabled:opacity-50">
                        RESET TO PENDING
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link to="/anime" className="rounded-2xl border border-white/10 p-6 transition hover:border-red-500/60">
            <p className="text-xs font-bold tracking-widest text-red-500">LIBRARY</p>
            <h2 className="mt-3 text-xl font-black">Public Anime Library ↗</h2>
          </Link>
          <Link to="/request" className="rounded-2xl border border-white/10 p-6 transition hover:border-red-500/60">
            <p className="text-xs font-bold tracking-widest text-red-500">COMMUNITY</p>
            <h2 className="mt-3 text-xl font-black">Public Request Page ↗</h2>
          </Link>
        </div>
      </section>
    </main>
  )
}
