
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Admin() {
  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/auth'
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

      <section className="mx-auto mt-16 max-w-6xl">
        <p className="text-xs font-bold tracking-[0.3em] text-red-500">
          CONTROL CENTER
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-6xl">
          WELCOME, ADMIN<span className="text-red-500">.</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
          Manage the DXE anime library and community requests from one place.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            to="/anime"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-red-500/60"
          >
            <p className="text-xs font-bold tracking-widest text-red-500">
              LIBRARY
            </p>
            <h2 className="mt-3 text-2xl font-black">Anime Collection ↗</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Open the anime library. Admin add/edit controls will be connected
              to the database next.
            </p>
          </Link>

          <Link
            to="/request"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-red-500/60"
          >
            <p className="text-xs font-bold tracking-widest text-red-500">
              COMMUNITY
            </p>
            <h2 className="mt-3 text-2xl font-black">Anime Requests ↗</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Open the request page. Admin request-review tools will be
              connected next.
            </p>
          </Link>
        </div>

        <p className="mt-8 text-xs leading-6 text-white/35">
          Dashboard layout created. Anime management and request moderation
          still need database integration.
        </p>
      </section>
    </main>
  )
}
