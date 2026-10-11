
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Home from './Pages/Home'
import Anime from './Pages/Anime'
import Watchlist from './Pages/Watchlist'
import Request from './Pages/Request'
import Auth from './Pages/Auth'
import Admin from './Pages/Admin'
import AdminRoute from './Components/AdminRoute'
import Profile from './Pages/Profile'
import Community from './Pages/Community'
import Navbar from './Components/Navbar'

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#050914] text-[#dce6f5]">
      <Navbar />
      <Outlet />
    </div>
  )
}

function PlaceholderPage({ title, description }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-5 text-center text-white">
      <p className="text-xs font-bold tracking-[0.3em] text-red-500">
        DUBXEMPIRE
      </p>

      <h1 className="mt-4 text-4xl font-black sm:text-5xl">
        {title}
        <span className="text-red-500">.</span>
      </h1>

      <p className="mt-4 max-w-lg text-sm leading-7 text-gray-400">
        {description}
      </p>

      <a
        href="/"
        className="mt-8 rounded-md bg-red-600 px-6 py-3 text-xs font-black tracking-widest transition hover:bg-red-500"
      >
        BACK TO HOME ↗
      </a>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/request" element={<Request />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route path="/community" element={<Community />} />

          <Route
            path="*"
            element={
              <PlaceholderPage
                title="404 — NOT FOUND"
                description="That page doesn't exist yet."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
