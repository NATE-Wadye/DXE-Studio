
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (!active) return

      if (authError || !authData.user) {
        setLoading(false)
        return
      }

      setUser(authData.user)

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, username, bio, avatar_url')
        .eq('id', authData.user.id)
        .single()

      if (!active) return

      if (profileError) {
        setError('Could not load your profile. Please refresh.')
      } else {
        setDisplayName(
          data.display_name || authData.user.user_metadata?.full_name || ''
        )
        setUsername(data.username || '')
        setBio(data.bio || '')
        setAvatarUrl(data.avatar_url || '')
      }

      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const cleanUsername = username.trim()

    if (
      cleanUsername &&
      !/^[A-Za-z0-9_]{3,24}$/.test(cleanUsername)
    ) {
      setError('Username must be 3–24 characters: letters, numbers, or underscores.')
      return
    }

    if (displayName.trim().length > 60) {
      setError('Display name must be 60 characters or fewer.')
      return
    }

    if (bio.length > 300) {
      setError('Bio must be 300 characters or fewer.')
      return
    }

    setSaving(true)

    const { error: saveError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        username: cleanUsername || null,
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)

    if (saveError) {
      setError(
        saveError.code === '23505'
          ? 'That username is already taken. Try another one.'
          : saveError.message
      )
      return
    }

    setMessage('PROFILE UPDATED SUCCESSFULLY.')
  }

  async function logout() {
    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      setError('Could not log out. Please try again.')
      return
    }

    navigate('/auth', { replace: true })
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <p className="animate-pulse font-bold tracking-[0.3em] text-red-500">
          LOADING PROFILE...
        </p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const initial = (displayName || username || user.email || 'D')
    .charAt(0)
    .toUpperCase()

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link to="/" className="text-xl font-black tracking-wider">
            DX<span className="text-red-500">E</span>
            <span className="ml-2 text-xs font-medium tracking-widest text-white/50">
              ACCOUNT
            </span>
          </Link>

          <button
            onClick={logout}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold tracking-wider text-white/70 transition hover:border-red-500 hover:text-white"
          >
            LOG OUT
          </button>
        </header>

        <section className="mt-10 grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[0.3em] text-red-500">
              YOUR IDENTITY
            </p>

            <div className="mt-7 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-red-500/40 bg-red-500/10 text-4xl font-black text-red-400">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                initial
              )}
            </div>

            <h1 className="mt-5 break-words text-2xl font-black">
              {displayName || 'DXE Member'}
            </h1>

            <p className="mt-1 break-all text-sm text-white/45">
              {username ? `@${username}` : 'Choose a username'}
            </p>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[10px] font-bold tracking-[0.25em] text-white/40">
                EMAIL ADDRESS
              </p>
              <p className="mt-2 break-all text-sm">{user.email}</p>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold tracking-[0.25em] text-white/40">
                ABOUT ME
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">
                {bio || 'Your story starts here.'}
              </p>
            </div>

            <p className="mt-8 text-[10px] tracking-widest text-white/25">
              DUBXEMPIRE MEMBER
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[0.3em] text-red-500">
              ACCOUNT SETTINGS
            </p>

            <h2 className="mt-3 text-3xl font-black">
              EDIT PROFILE<span className="text-red-500">.</span>
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Customize how you appear across the DXE community.
            </p>

            <form onSubmit={saveProfile} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-white/70">
                  DISPLAY NAME
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={60}
                  placeholder="Your display name"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-white/70">
                  USERNAME
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-black/40 focus-within:border-red-500">
                  <span className="pl-4 text-white/40">@</span>
                  <input
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/\s/g, ''))
                    }
                    minLength={3}
                    maxLength={24}
                    placeholder="your_username"
                    className="w-full bg-transparent px-2 py-3 text-sm outline-none placeholder:text-white/25"
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/35">
                  3–24 letters, numbers, or underscores. Must be unique.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-white/70">
                  BIO
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  rows={4}
                  placeholder="Tell the DXE community about yourself..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-red-500"
                />
                <p className="mt-1 text-right text-[11px] text-white/35">
                  {bio.length}/300
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-white/70">
                  AVATAR IMAGE URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-red-500"
                />
                <p className="mt-2 text-[11px] text-white/35">
                  Paste a direct image URL. Image uploads can be added later.
                </p>
              </div>

              {error && (
                <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              {message && (
                <p role="status" className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-red-600 px-5 py-4 text-xs font-black tracking-[0.2em] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
