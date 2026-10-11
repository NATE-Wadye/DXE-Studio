
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading')
  const location = useLocation()

  useEffect(() => {
    let active = true

    async function checkAdmin() {
      const { data, error } = await supabase.auth.getUser()

      if (!active) return

      if (error || !data.user) {
        setStatus('denied')
        return
      }

      setStatus(
        data.user.app_metadata?.role === 'admin'
          ? 'admin'
          : 'denied'
      )
    }

    checkAdmin()

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return

        setStatus(
          session?.user?.app_metadata?.role === 'admin'
            ? 'admin'
            : 'denied'
        )
      })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <p className="font-bold tracking-widest text-red-500">
          VERIFYING ACCESS...
        </p>
      </main>
    )
  }

  if (status !== 'admin') {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location }}
      />
    )
  }

  return children
}
