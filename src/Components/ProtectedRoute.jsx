
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!active) return

      setSession(error ? null : data.session)
      setLoading(false)
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (active) {
          setSession(nextSession)
          setLoading(false)
        }
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <p className="text-sm font-bold tracking-widest text-red-500">
          ENTERING THE EMPIRE...
        </p>
      </main>
    )
  }

  if (!session) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return children
}
