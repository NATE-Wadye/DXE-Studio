
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Anime Library', path: '/anime' },
  { label: 'Watchlist', path: '/watchlist' },
  { label: 'Request a Dub', path: '/request' },
  { label: 'Community', path: '/community' },
]

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
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    megaphone: (
      <>
        <path d="m3 11 18-5v12L3 13v-2Z" />
        <path d="m6 14 2 7h4l-2-6" />
        <path d="M21 10v4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
  }

  return <svg {...common}>{paths[name] || paths.user}</svg>
}

function DropdownLink({ to, icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-amber-300"
    >
      <Icon name={icon} size={17} />
      <span>{children}</span>
    </Link>
  )
}

function formatDate(date) {
  if (!date) return ''

  const value = new Date(date)
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return value.toLocaleDateString()
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Announcement bell state
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [readAnnouncementIds, setReadAnnouncementIds] = useState([])
  const [notificationsError, setNotificationsError] = useState('')

  const readKey = `dxe-read-announcements:${user?.id || 'guest'}`

  // Existing account and profile system
  useEffect(() => {
    let active = true

    const loadProfile = async (currentUser) => {
      if (!currentUser) {
        if (active) {
          setUser(null)
          setProfile(null)
        }
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, role')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (active) {
        setUser(currentUser)
        setProfile(data || null)
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      if (active) loadProfile(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user || null)
        if (!session?.user) setProfile(null)
      }

      if (session?.user) {
        setTimeout(() => {
          if (active) loadProfile(session.user)
        }, 0)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // Load announcement read status
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(readKey) || '[]')
      setReadAnnouncementIds(Array.isArray(saved) ? saved : [])
    } catch {
      setReadAnnouncementIds([])
    }
  }, [readKey])

  // Fetch announcements and listen for new ones
  useEffect(() => {
    let active = true

    const loadAnnouncements = async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          created_at,
          is_announcement,
          author:profiles!community_posts_author_id_fkey (
            username,
            display_name
          )
        `)
        .eq('is_announcement', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!active) return

      if (error) {
        setNotificationsError(error.message)
        return
      }

      setNotificationsError('')
      setNotifications(data || [])
    }

    loadAnnouncements()

    const channel = supabase
      .channel('dxe-announcement-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
        },
        (payload) => {
          if (payload.new?.is_announcement === true) {
            loadAnnouncements()
          }
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  const unreadCount = notifications.filter(
    (item) => !readAnnouncementIds.includes(item.id)
  ).length

  const markAnnouncementsRead = () => {
    const ids = notifications.map((item) => item.id)

    setReadAnnouncementIds((previous) => {
      const next = [...new Set([...previous, ...ids])]
      localStorage.setItem(readKey, JSON.stringify(next))
      return next
    })
  }

  const toggleNotifications = () => {
    const willOpen = !notificationsOpen

    setNotificationsOpen(willOpen)
    setAccountOpen(false)

    if (willOpen) markAnnouncementsRead()
  }

  const submitSearch = (event) => {
    event.preventDefault()

    const query = searchQuery.trim()
    setSearchOpen(false)
    setMobileOpen(false)

    navigate(query ? `/anime?search=${encodeURIComponent(query)}` : '/anime')
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('DXE logout failed:', error.message)
      return
    }

    setAccountOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const closeMenus = () => {
    setAccountOpen(false)
    setNotificationsOpen(false)
    setMobileOpen(false)
  }

  const isAdmin = profile?.role === 'admin'
  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.email?.split('@')[0] ||
    'Guest'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#050914]/95 text-slate-200 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-8">
          {/* DXE brand */}
          <Link
            to="/"
            onClick={closeMenus}
            className="flex shrink-0 items-center gap-2.5"
          >

            <img
              src="https://scontent.fudr3-3.fna.fbcdn.net/v/t1.15752-9/778755682_1082235371428308_3635916414905716975_n.jpg?_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=fc17b8&_nc_ohc=CRvNVosJk4cQ7kNvwGGFI7e&_nc_oc=Adqj2BFdG3CEeLPc96c3KePobR7yyw12KAkYB4vLV9uzofGIUa86yvnctxWuprvDFugEhrBACGh3_kfLPmkmWoC9&_nc_zt=23&_nc_ht=scontent.fudr3-3.fna&_nc_ss=7b6a8&oh=03_Q7cD6gFxHD7WxGryH6DcBR6HPM1Ev4lO1nNa0F7cXdd0T7bfVg&oe=6AF287DA"
              alt="DXE Logo"
              className="h-10 w-10 rounded-xl border border-amber-300/30 object-cover shadow-lg shadow-amber-500/10"
            />

            <span className="leading-tight">
              <span className="block text-lg font-black tracking-[0.12em] text-white">
                DXE
              </span>
              <span className="hidden text-[9px] font-semibold tracking-[0.22em] text-amber-300/80 sm:block">
                DUBXEMPIRE
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="ml-3 hidden items-center gap-1 xl:flex">
            {navLinks.map((item) => {
              const active =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenus}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium transition ${active
                      ? 'bg-amber-300/10 text-amber-300'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Search button */}
            <button
              type="button"
              aria-label="Search anime"
              onClick={() => {
                setSearchOpen(true)
                setAccountOpen(false)
                setNotificationsOpen(false)
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-amber-300/40 hover:text-amber-300"
            >
              <Icon name="search" />
            </button>

            {/* Announcement bell — added without changing the navbar layout */}
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-amber-300/40 hover:text-amber-300"
              >
                <Icon name="bell" />

                {unreadCount > 0 && (
                  <span className="absolute right-[7px] top-[6px] h-2.5 w-2.5 rounded-full border-2 border-[#050914] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-[52px] z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/50">
                  <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
                    <div>
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Community announcements
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="max-h-[370px] overflow-y-auto">
                    {notificationsError ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-slate-300">
                          Could not load announcements.
                        </p>
                        <p className="mt-2 break-words text-xs text-slate-500">
                          Check the community_posts read permissions in Supabase.
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-9 text-center">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-slate-400">
                          <Icon name="bell" size={21} />
                        </span>
                        <p className="mt-3 text-sm font-medium text-slate-200">
                          You’re all caught up
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          New admin announcements will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const isUnread = !readAnnouncementIds.includes(item.id)
                        const author =
                          item.author?.display_name ||
                          item.author?.username ||
                          'DXE Admin'

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setNotificationsOpen(false)
                              navigate('/community')
                            }}
                            className="flex w-full gap-3 border-b border-white/[0.05] px-4 py-4 text-left transition hover:bg-white/[0.04]"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/10 bg-amber-300/[0.08] text-amber-300">
                              <Icon name="megaphone" size={19} />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                  DXE Announcement
                                </span>
                                {isUnread && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                                )}
                              </span>

                              <span className="mt-1 block whitespace-pre-wrap break-words text-sm leading-5 text-slate-300">
                                {item.content}
                              </span>

                              <span className="mt-2 block text-xs text-slate-500">
                                {author} · {formatDate(item.created_at)}
                              </span>
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false)
                      navigate('/community')
                    }}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-amber-300 transition hover:bg-white/[0.04]"
                  >
                    Visit Community
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Account dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={accountOpen}
                onClick={() => {
                  setAccountOpen((value) => !value)
                  setNotificationsOpen(false)
                }}
                className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2.5 transition hover:border-amber-300/40 sm:pr-3"
              >
                <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-amber-300/20 bg-gradient-to-br from-slate-700 to-slate-950 text-amber-200">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name="user" size={16} />
                  )}

                  <span
                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-[#050914] ${user ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                  />
                </span>

                <span className="hidden max-w-[100px] truncate text-xs font-medium text-slate-200 lg:block">
                  {displayName}
                </span>

                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="hidden text-slate-500 sm:block"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[52px] z-50 w-64 rounded-2xl border border-white/10 bg-[#0b1220] p-2 shadow-2xl shadow-black/50">
                  <div className="border-b border-white/[0.08] px-3 py-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user?.email || 'Sign in to your DXE account'}
                    </p>
                    {isAdmin && (
                      <span className="mt-2 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 py-2">
                    {user ? (
                      <>
                        <DropdownLink to="/profile" icon="user" onClick={closeMenus}>
                          My Profile
                        </DropdownLink>

                        <DropdownLink to="/watchlist" icon="home" onClick={closeMenus}>
                          My Watchlist
                        </DropdownLink>

                        <DropdownLink to="/community" icon="megaphone" onClick={closeMenus}>
                          Community
                        </DropdownLink>

                        {isAdmin && (
                          <DropdownLink to="/admin" icon="shield" onClick={closeMenus}>
                            Admin Panel
                          </DropdownLink>
                        )}
                      </>
                    ) : (
                      <DropdownLink to="/auth" icon="user" onClick={closeMenus}>
                        Sign In / Create Account
                      </DropdownLink>
                    )}
                  </div>

                  {user && (
                    <div className="border-t border-white/[0.08] pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-400/[0.08]"
                      >
                        <Icon name="logout" size={17} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen((value) => !value)
                setAccountOpen(false)
                setNotificationsOpen(false)
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-amber-300/40 hover:text-amber-300 xl:hidden"
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <div className="border-t border-white/[0.07] bg-[#070c17] px-4 py-3 xl:hidden">
            <nav className="mx-auto flex max-w-[1440px] flex-col gap-1">
              {navLinks.map((item) => {
                const active =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenus}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition ${active
                        ? 'bg-amber-300/10 text-amber-300'
                        : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/75 px-4 pt-[15vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false)
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-3 border-b border-white/10 px-5">
              <Icon name="search" size={22} />
              <form onSubmit={submitSearch} className="flex min-w-0 flex-1">
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search anime..."
                  className="h-16 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="my-3 rounded-lg bg-amber-300 px-4 text-sm font-bold text-[#090d17] transition hover:bg-amber-200"
                >
                  Search
                </button>
              </form>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <Icon name="close" size={19} />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-xs text-slate-500">
                Search the DXE anime library
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false)
                  navigate('/anime')
                }}
                className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-left text-sm text-slate-300 transition hover:border-amber-300/20 hover:bg-white/[0.03]"
              >
                Browse all anime
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
