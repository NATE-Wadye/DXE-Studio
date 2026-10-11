
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const anime = [
  {
    id: 1,
    title: 'One Piece',
    genres: 'Adventure · Comedy · Shounen',
    rating: '9.1',
    image:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=85',
    status: 'DUBBED',
  },
  {
    id: 2,
    title: 'Naruto Shippuden',
    genres: 'Action · Adventure · Shounen',
    rating: '8.9',
    image:
      'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?auto=format&fit=crop&w=900&q=85',
    status: 'DUBBED',
  },
  {
    id: 3,
    title: 'Attack on Titan',
    genres: 'Action · Drama · Fantasy',
    rating: '9.0',
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=900&q=85',
    status: 'DUBBED',
  },
  {
    id: 4,
    title: 'Demon Slayer',
    genres: 'Action · Adventure · Fantasy',
    rating: '8.7',
    image:
      'https://images.unsplash.com/photo-1614583225154-5fcdda07019e?auto=format&fit=crop&w=900&q=85',
    status: 'DUBBED',
  },
  {
    id: 5,
    title: 'Jujutsu Kaisen',
    genres: 'Action · Supernatural · Shounen',
    rating: '8.8',
    image:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=85',
    status: 'DUBBED',
  },
  {
    id: 6,
    title: 'Blue Lock',
    genres: 'Sports · Drama · Shounen',
    rating: '8.6',
    image:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85',
    status: 'DUBBED',
  },
]

const featured = {
  title: 'Solo Leveling',
  subtitle: 'RISE OF THE SHADOW.',
  description:
    'Sung Jin-Woo, the weakest hunter in the world, gains a mysterious system, and his journey to become stronger than anyone begins.',
  image:
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=90',
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
    library: <><path d="M4 4h12l4 4v12H4z" /><path d="M16 4v5h4M8 13h8M8 17h8" /></>,
    bookmark: <><path d="M6 4h12v17l-6-4-6 4z" /></>,
    request: <><path d="m14 3 7 7-11 11H3v-7z" /><path d="m12 5 7 7" /></>,
    community: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4L7.1 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2z" /></>,
    crown: <><path d="m2 8 5 4 5-8 5 8 5-4-2 12H4z" /><path d="M5 17h14" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    arrow: <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" fill="currentColor" stroke="none" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" /><path d="m9 12 2 2 4-4" /></>,
    bolt: <path d="m13 2-3 9h7l-6 11 2-9H6z" fill="currentColor" stroke="none" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  }

  return <svg {...common}>{paths[name] || null}</svg>
}

function AnimeCard({ item }) {
  return (
    <Link
      to="/anime"
      className="group min-w-0 overflow-hidden rounded-xl border border-[#29415f] bg-[#071020] transition duration-300 hover:-translate-y-1 hover:border-[#e8b84a]/70 hover:shadow-lg hover:shadow-[#e8b84a]/[0.06]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0b1930]">
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-black/10 to-black/20" />
        <span className="absolute left-2.5 top-2.5 rounded-full border border-blue-300/20 bg-blue-950/90 px-2.5 py-1 text-[9px] font-black tracking-wider text-blue-100">
          {item.status}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="truncate text-sm font-bold text-white group-hover:text-[#f5d47d]">
          {item.title}
        </h3>
        <p className="mt-1.5 truncate text-[10px] text-[#92a7c4]">
          {item.genres}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#dce6f5]">
          <Icon name="star" size={14} />
          {item.rating}
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const carouselRef = useRef(null)

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dxe-watchlist') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    let active = true

    async function loadAccount() {
      const { data } = await supabase.auth.getUser()
      if (!active) return

      setUser(data.user || null)

      if (data.user) {
        const { data: row } = await supabase
          .from('profiles')
          .select('display_name, username, avatar_url, role')
          .eq('id', data.user.id)
          .maybeSingle()

        if (active) setProfile(row || null)
      } else {
        setProfile(null)
      }
    }

    loadAccount()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setSearchOpen(false)
        setMobileMenu(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const results = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return []
    return anime.filter((item) =>
      `${item.title} ${item.genres}`.toLowerCase().includes(search),
    )
  }, [query])

  function scrollCarousel(direction) {
    carouselRef.current?.scrollBy({
      left: direction * 300,
      behavior: 'smooth',
    })
  }

  function toggleWatchlist() {
    const updated = saved.includes(1)
      ? saved.filter((id) => id !== 1)
      : [...saved, 1]

    setSaved(updated)
    localStorage.setItem('dxe-watchlist', JSON.stringify(updated))
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setMenuOpen(false)
      navigate('/auth', { replace: true })
    }
  }

  const accountName =
    profile?.display_name ||
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Guest'

  const avatarInitial = accountName.slice(0, 1).toUpperCase()
  const avatarUrl = profile?.avatar_url

  return (
    <main className="min-h-screen overflow-hidden bg-[#050914] text-[#dce6f5]">
      {/* Main navigation */}

      {/* Hero */}
      <section className="relative isolate min-h-[590px] overflow-hidden border-b border-white/[0.06] sm:min-h-[650px]">
        <div className="absolute inset-0 -z-30 bg-[#071020]" />
        <img
          src={featured.image}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#030814] via-[#030814]/85 to-[#030814]/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/20" />
        <div className="absolute -right-20 top-10 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="mx-auto grid min-h-[590px] max-w-[1600px] items-center gap-8 px-5 py-14 sm:px-8 md:min-h-[650px] md:grid-cols-[1.1fr_0.9fr] md:px-12 lg:px-16">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#e8b84a]">
              <Icon name="star" size={16} /> FEATURED ANIME
            </p>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              SOLO LEVELING
              <span className="mt-2 block bg-gradient-to-r from-[#f9df98] via-[#e8b84a] to-[#bd852d] bg-clip-text text-4xl text-transparent sm:text-6xl lg:text-7xl">
                RISE OF THE SHADOW.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#c1cee0] sm:text-base">
              {featured.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/anime"
                className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-[#f5cf70] to-[#dca735] px-6 py-3.5 text-xs font-black tracking-wider text-[#09101b] shadow-lg shadow-[#e8b84a]/10 transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <Icon name="play" size={18} /> EXPLORE ANIME
              </Link>
              <button
                type="button"
                onClick={toggleWatchlist}
                className="inline-flex items-center gap-3 rounded-lg border border-[#dce6f5]/50 bg-[#071020]/50 px-6 py-3.5 text-xs font-bold tracking-wider text-white transition hover:border-[#e8b84a] hover:text-[#f5d47d]"
              >
                <Icon name="bookmark" size={18} />
                {saved.includes(1) ? 'IN WATCHLIST' : 'ADD TO WATCHLIST'}
              </button>
            </div>

            <div className="mt-9 flex flex-wrap gap-5 text-[10px] font-bold tracking-[0.13em] text-[#a4b4cb]">
              <span>ACTION</span>
              <span>ADVENTURE</span>
              <span>FANTASY</span>
              <span className="text-[#e8b84a]">DXE FEATURED</span>
            </div>
          </div>

          <div className="relative hidden items-end justify-center md:flex">
            <div className="absolute bottom-6 h-72 w-72 rounded-full bg-blue-500/15 blur-[90px]" />
            <article className="relative grid w-full max-w-[500px] grid-cols-[0.85fr_1.15fr] overflow-hidden rounded-2xl border border-[#e8b84a]/60 bg-[#030a16]/90 shadow-2xl shadow-black/50">
              <div className="relative min-h-[270px] overflow-hidden bg-[#10213c]">
                <img src={featured.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030814]/70 to-transparent" />
              </div>
              <div className="p-5 lg:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8b84a]/50 px-3 py-1 text-[9px] font-black tracking-wider text-[#f5d47d]">
                  <Icon name="star" size={12} /> FEATURED
                </span>
                <h2 className="mt-4 text-xl font-black text-white">Solo Leveling</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['Action', 'Adventure', 'Fantasy'].map((tag) => (
                    <span key={tag} className="rounded-full bg-[#173052] px-2.5 py-1 text-[10px] text-[#c9d9ed]">{tag}</span>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-6 text-[#aebfd5]">
                  A hunter's journey begins with a mysterious power and a world full of danger.
                </p>
                <Link to="/anime" className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#e8b84a] px-4 py-3 text-[10px] font-black tracking-wider text-[#07101d] hover:bg-[#f5d47d]">
                  <Icon name="play" size={14} /> VIEW IN LIBRARY
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="relative mx-auto max-w-[1600px] px-4 pb-10 pt-8 sm:px-8 lg:px-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] text-[#e8b84a]">EXPLORE THE COLLECTION</p>
            <h2 className="mt-2 flex items-center gap-3 text-xl font-black text-white sm:text-2xl">
              <span className="h-6 w-1 rounded-full bg-[#e8b84a]" />
              TRENDING NOW
            </h2>
          </div>
          <Link to="/anime" className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-[#e8b84a] hover:text-[#f5d47d]">
            View All <Icon name="arrow" size={16} />
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Scroll trending anime left"
            onClick={() => scrollCarousel(-1)}
            className="absolute -left-3 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#081225]/95 text-white shadow-xl transition hover:border-[#e8b84a] hover:text-[#f5d47d] md:flex"
          >
            ‹
          </button>

          <div
            ref={carouselRef}
            className="grid grid-flow-col auto-cols-[72%] gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:thin] [scrollbar-color:#344967_transparent] sm:auto-cols-[42%] lg:auto-cols-[calc((100%-5*16px)/6)]"
          >
            {anime.map((item) => <AnimeCard key={item.id} item={item} />)}
          </div>

          <button
            type="button"
            aria-label="Scroll trending anime right"
            onClick={() => scrollCarousel(1)}
            className="absolute -right-3 top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#081225]/95 text-white shadow-xl transition hover:border-[#e8b84a] hover:text-[#f5d47d] md:flex"
          >
            ›
          </button>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-4 mb-10 rounded-2xl border border-[#a9843d]/50 bg-gradient-to-r from-[#070d18] via-[#0b1930] to-[#070d18] shadow-[0_0_35px_rgba(232,184,74,0.04)] sm:mx-8 lg:mx-auto lg:max-w-[1450px]">
        <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
          <Stat icon="crown" title="1000+" subtitle="DUBBED ANIME" />
          <Stat icon="users" title="50K+" subtitle="ACTIVE MEMBERS" />
          <Stat icon="bolt" title="FAST UPDATES" subtitle="LATEST EPISODES" />
          <Stat icon="shield" title="SAFE & SECURE" subtitle="BUILT FOR FANS" />
        </div>
      </section>

      <footer className="border-t border-white/[0.08] px-5 py-6 text-center text-[10px] tracking-[0.18em] text-[#61728c]">
        © {new Date().getFullYear()} DUBXEMPIRE · THE VOICE OF ANIME
      </footer>
    </main>
  )
}

function MenuLink({ to, icon, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs text-[#dce6f5] transition hover:bg-[#e8b84a]/[0.08] hover:text-[#f5d47d]"
    >
      <Icon name={icon} size={17} />
      {children}
    </Link>
  )
}

function Stat({ icon, title, subtitle }) {
  return (
    <div className="flex min-h-[92px] items-center justify-center gap-3 px-3 py-5 sm:gap-4 sm:px-5">
      <span className="text-[#e8b84a]"><Icon name={icon} size={28} /></span>
      <span>
        <span className="block text-sm font-black text-[#f5c75e] sm:text-base">{title}</span>
        <span className="mt-1 block text-[8px] tracking-wider text-[#b4c5dc] sm:text-[9px]">{subtitle}</span>
      </span>
    </div>
  )
}
