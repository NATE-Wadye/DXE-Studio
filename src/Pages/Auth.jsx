
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        navigate('/', { replace: true })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active && session) {
          navigate('/', { replace: true })
        }
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [navigate])

  function switchMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        })

        if (authError) throw authError

        if (data.session) {
          navigate('/', { replace: true })
        } else {
          setMessage(
            'Account created! Check your email for a confirmation link before logging in.'
          )
          setMode('login')
        }
      } else {
        const { error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })

        if (authError) throw authError

        const destination = location.state?.from || '/'
        navigate(destination, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080809] px-4 py-16 text-white">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm
                     font-semibold tracking-[0.25em] text-white/60
                     transition hover:text-white"
        >
          <span className="text-red-500">DXE</span>
          <span>DUBXEMPIRE</span>
        </Link>

        <section className="rounded-2xl border border-white/10
                            bg-[#101012] p-6 shadow-2xl sm:p-8">
          <p className="mb-3 text-xs font-bold tracking-[0.3em]
                        text-red-500">
            YOUR EMPIRE AWAITS
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {mode === 'login' ? 'WELCOME BACK.' : 'JOIN THE EMPIRE.'}
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {mode === 'login'
              ? 'Sign in to access your DXE account and submit anime requests.'
              : 'Create your DXE account to join the community and submit requests.'}
          </p>

          <div className="mt-7 grid grid-cols-2 rounded-lg
                          border border-white/10 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-md px-3 py-3 text-sm font-bold transition ${
                mode === 'login'
                  ? 'bg-red-600 text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Log In
            </button>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-md px-3 py-3 text-sm font-bold transition ${
                mode === 'signup'
                  ? 'bg-red-600 text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {message && (
            <div
              role="status"
              className="mt-5 rounded-lg border border-green-500/30
                         bg-green-500/10 p-3 text-sm text-green-300"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-500/30
                         bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="dxe-name"
                       className="mb-2 block text-sm font-medium text-white/80">
                  Display Name
                </label>
                <input
                  id="dxe-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  minLength={2}
                  maxLength={60}
                  required
                  className="w-full rounded-lg border border-white/10
                             bg-black/40 px-4 py-3 outline-none
                             transition placeholder:text-white/25
                             focus:border-red-500"
                />
              </div>
            )}

            <div>
              <label htmlFor="dxe-email"
                     className="mb-2 block text-sm font-medium text-white/80">
                Email Address
              </label>
              <input
                id="dxe-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={254}
                required
                className="w-full rounded-lg border border-white/10
                           bg-black/40 px-4 py-3 outline-none
                           transition placeholder:text-white/25
                           focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="dxe-password"
                     className="mb-2 block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="dxe-password"
                type="password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === 'signup'
                    ? 'At least 8 characters'
                    : 'Enter your password'
                }
                minLength={8}
                required
                className="w-full rounded-lg border border-white/10
                           bg-black/40 px-4 py-3 outline-none
                           transition placeholder:text-white/25
                           focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-600 px-4 py-3.5
                         text-sm font-extrabold tracking-wider
                         transition hover:bg-red-500
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'PLEASE WAIT...'
                : mode === 'login'
                  ? 'LOG IN TO DXE →'
                  : 'CREATE ACCOUNT →'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-white/35">
            By continuing, you agree to use DXE responsibly and respect
            the rights of content creators.
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-white/30">
          YOUR WORLD. YOUR VOICE.
        </p>
      </div>
    </main>
  )
}
