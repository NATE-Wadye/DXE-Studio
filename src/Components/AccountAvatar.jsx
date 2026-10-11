
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AccountAvatar() {
  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadAccount(currentUser) {
      if (!currentUser) {
        if (active) {
          setUser(null)
          setAvatarUrl('')
          setLoading(false)
        }
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (active) {
        setUser(currentUser)
        setAvatarUrl(data?.avatar_url || '')
        setLoading(false)
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      loadAccount(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadAccount(session?.user || null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const destination = user ? '/profile' : '/auth'

  return (
    <Link
      to={destination}
      aria-label={user ? 'Open your profile' : 'Log in to DXE'}
      title={user ? 'Your account' : 'Log in / Sign up'}
      className="relative z-10 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#151515] shadow-lg transition hover:border-red-500 hover:shadow-red-900/30"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Your profile"
          className="h-full w-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-6 w-6 text-white/80"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path
            d="M4.5 21a7.5 7.5 0 0 1 15 0"
            strokeLinecap="round"
          />
        </svg>
      )}
    </Link>
  )
}
