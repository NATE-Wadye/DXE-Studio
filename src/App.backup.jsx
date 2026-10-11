
import { useState } from 'react'


const projects = [
  {
    title: 'Love Unseen Beneath',
    genre: 'ROMANCE · DRAMA',
    language: 'HINDI DUB',
    status: 'IN PRODUCTION',
    poster: 'https://preview.redd.it/love-unseen-beneath-the-clear-night-sky-new-visual-v0-oxuyfs9e915h1.jpeg?width=1080&crop=smart&auto=webp&s=7349bedb294a280adba8e8481f0d32ff49465c30',
    color: 'from-rose-950 via-red-950 to-black',
  },
  {
    title: 'I Want to End This Love Game',
    genre: 'ROMANCE · ROMANTIC COMEDY',
    language: 'HINDI DUB',
    status: 'COMING SOON',
    poster: 'https://imgs.search.brave.com/L2ngeIVbHaKY8aL0mQV8bezSO8efd7KXYotYAqYzioU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YW5pbWUtcGxhbmV0/LmNvbS9tYW5nYS9w/cmltYXJ5L2Fpc2hp/dGVydS1nYW1lLXdv/LW93YXJhc2V0YWkt/MS0yODV4Mzk5Lndl/YnA_dD0xNzA1MTA4/NTg0',
    color: 'from-indigo-950 via-purple-950 to-black',
  },
  {
    title: 'DanMachi',
    genre: 'ACTION · ADVENTURE · FANTASY',
    language: 'FAN PROJECT',
    status: 'IN PRODUCTION',
    poster: 'https://imgs.search.brave.com/WIQW58fj_qMUhzwJ_K2P7hbAHrF-Ki6Xg1FsqFG1_gQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmV0/c3lzdGF0aWMuY29t/LzYyNDExNDc4L3Iv/aWwvNWUzY2JkLzc2/MzgzMzEwMTQvaWxf/MzAweDMwMC43NjM4/MzMxMDE0XzlweXcu/anBn',
    color: 'from-orange-950 via-red-950 to-black',
  },
]


function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
      {children}
    </p>
  )
}


function ProjectCard({ project }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-white/10 bg-[#111114] transition duration-300 hover:-translate-y-2 hover:border-red-500/60">
      <div
        className={`relative flex h-80 items-center justify-center overflow-hidden bg-gradient-to-br ${project.color}`}
      >
        {/* Poster artwork */}
        <img
          src={project.poster}
          alt={`${project.title} poster`}
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        {/* Project status */}
        <span className="absolute left-4 top-4 z-10 rounded border border-white/15 bg-black/60 px-3 py-1 text-[10px] font-bold tracking-widest text-gray-200 backdrop-blur-sm">
          {project.status}
        </span>

        {/* Language */}
        <span className="absolute bottom-4 left-4 z-10 text-xs font-bold tracking-widest text-red-400">
          {project.language}
        </span>

        {/* Poster accent */}
        <span className="absolute bottom-4 right-4 z-10 text-[10px] font-bold tracking-widest text-white/60">
          DXE PROJECT
        </span>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500">
          {project.genre}
        </p>

        <h3 className="mt-2 text-xl font-extrabold text-white transition group-hover:text-red-400">
          {project.title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          A fan dubbing project brought to life by the DXE team.
        </p>
      </div>
    </article>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen overflow-hidden bg-[#09090b] text-white">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <a href="#home" onClick={closeMenu} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-sm font-black shadow-lg shadow-red-600/20">
              DXE
            </span>

            <span>
              <span className="block text-lg font-black tracking-wider">
                DUBX<span className="text-red-500">EMPIRE</span>
              </span>
              <span className="block text-[9px] tracking-[0.32em] text-gray-500">
                THE VOICE OF ANIME
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-300 md:flex">
            <a className="text-red-400" href="#home">Home</a>
            <a className="transition hover:text-red-400" href="#projects">Projects</a>
            <a className="transition hover:text-red-400" href="#about">About Us</a>
            <a className="transition hover:text-red-400" href="#team">Our Team</a>
          </div>

          <a
            href="#join"
            className="hidden rounded-md bg-red-600 px-5 py-3 text-xs font-black tracking-wider transition hover:bg-red-500 sm:inline-flex"
          >
            JOIN DXE ↗
          </a>

          <button
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md border border-white/10 px-3 py-2 text-xl md:hidden"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </nav>

        {menuOpen && (
          <div className="flex flex-col gap-1 border-t border-white/10 bg-[#101013] p-4 md:hidden">
            {[
              ['Home', '#home'],
              ['Projects', '#projects'],
              ['About Us', '#about'],
              ['Our Team', '#team'],
              ['Join DXE', '#join'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                className="rounded-md px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section
          id="home"
          className="relative isolate flex min-h-[650px] items-center"
        >
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_75%_40%,rgba(153,27,27,0.28),transparent_45%),radial-gradient(ellipse_at_15%_80%,rgba(127,29,29,0.15),transparent_40%)]" />

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 to-[#09090b]/30" />

          <div className="absolute right-[-10%] top-[10%] -z-10 h-[440px] w-[440px] rounded-full border border-red-500/10 md:right-[5%] md:h-[580px] md:w-[580px]" />

          <div className="absolute right-[-5%] top-[17%] -z-10 h-[350px] w-[350px] rounded-full border border-red-500/10 md:right-[10%] md:h-[460px] md:w-[460px]" />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-[1.2fr_0.8fr] md:px-10">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-4 py-2 text-[10px] font-bold tracking-[0.22em] text-red-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                INDEPENDENT FAN DUBBING STUDIO
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                EVERY STORY
                <br />
                DESERVES A
                <br />
                <span className="text-red-500">NEW VOICE.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-gray-400 md:text-lg">
                We bring anime closer to fans through voice, creativity,
                and a community that lives for every story.
                Welcome to DubxEmpire.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#projects"
                  className="rounded-md bg-red-600 px-7 py-4 text-xs font-black tracking-widest transition hover:-translate-y-1 hover:bg-red-500"
                >
                  EXPLORE OUR PROJECTS ↗
                </a>

                <a
                  href="#about"
                  className="rounded-md border border-white/15 px-7 py-4 text-xs font-bold tracking-widest text-gray-200 transition hover:border-red-500 hover:text-red-400"
                >
                  DISCOVER DXE
                </a>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs text-gray-500">
                <span>✦ VOICE ACTING</span>
                <span>✦ CREATIVE DIRECTION</span>
                <span>✦ FAN COMMUNITY</span>
              </div>
            </div>

            <div className="relative hidden h-[430px] items-center justify-center md:flex">
              <div className="absolute h-72 w-72 rounded-full bg-red-600/10 blur-[90px]" />

              <div className="relative flex h-80 w-64 rotate-[-7deg] items-center justify-center overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950 via-[#171014] to-black shadow-2xl shadow-red-950/40 transition duration-500 hover:rotate-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(239,68,68,0.28),transparent_60%)]" />

                <div className="absolute inset-x-5 top-5 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />

                <div className="relative text-center">
                  <p className="text-[10px] font-bold tracking-[0.4em] text-red-400">
                    DUBXEMPIRE
                  </p>
                  <p className="mt-4 text-8xl font-black tracking-tighter text-white/10">
                    DXE
                  </p>
                  <p className="mt-4 text-xs font-bold tracking-[0.25em] text-white">
                    GIVE STORIES A VOICE
                  </p>
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex justify-between text-[9px] tracking-widest text-gray-500">
                  <span>EST. DXE</span>
                  <span>ANIME CULTURE</span>
                </div>
              </div>

              <div className="absolute bottom-8 right-0 rounded-lg border border-white/10 bg-[#151518]/90 p-4 backdrop-blur">
                <p className="text-[10px] tracking-widest text-gray-500">
                  OUR MISSION
                </p>
                <p className="mt-1 text-sm font-bold">
                  Stories. Voices. Community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ADVERTISEMENT PLACEHOLDER */}
        <section
          aria-label="Advertisement placeholder"
          className="px-5 py-5 md:px-10"
        >
          <div className="mx-auto flex min-h-24 max-w-7xl flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-5 text-center sm:flex-row sm:gap-5">
            <span className="rounded border border-white/15 px-2 py-1 text-[9px] tracking-widest text-gray-500">
              AD SPACE
            </span>
            <p className="text-xs text-gray-500">
              Advertising placement reserved — partnerships coming soon.
            </p>
          </div>
        </section>

        {/* FEATURED PROJECTS */}
        <section
          id="projects"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-10"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>THE DXE UNIVERSE</SectionLabel>
              <h2 className="text-3xl font-black sm:text-5xl">
                FEATURED PROJECTS<span className="text-red-500">.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400">
                A glimpse into the worlds our team is working to bring to life.
              </p>
            </div>
            <span className="text-xs tracking-widest text-gray-500">
              OUR CREATIVE WORK ↘
            </span>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-gray-600">
            Demo project names and artwork placeholders. Replace these with
            DXE's approved projects, credits, and artwork before launch.
          </p>
        </section>

        {/* ABOUT DXE */}
        <section
          id="about"
          className="scroll-mt-24 border-y border-white/10 bg-[#0e0e11]"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-center md:px-10">
            <div>
              <SectionLabel>MORE THAN DUBBING</SectionLabel>
              <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                WE ARE FANS.
                <br />
                <span className="text-red-500">WE ARE DXE.</span>
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-gray-400">
                DubxEmpire is a fan-driven creative studio built around the
                love of anime and voice acting. Our goal is to bring passionate
                people together, create memorable dubbing projects, and
                celebrate the stories that inspire us.
              </p>

              <p className="mt-5 text-base leading-8 text-gray-400">
                Every voice adds something new. Every project is a chance to
                learn, collaborate, and create something meaningful.
              </p>

              <a
                href="#join"
                className="mt-7 inline-flex text-sm font-bold text-red-400 hover:text-red-300"
              >
                BECOME PART OF THE EMPIRE ↗
              </a>
            </div>
          </div>
        </section>

        {/* MEET THE TEAM */}
        <section
          id="team"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-10"
        >
          <SectionLabel>THE PEOPLE BEHIND THE VOICES</SectionLabel>

          <h2 className="text-3xl font-black sm:text-5xl">
            MEET THE TEAM<span className="text-red-500">.</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400">
            Every great dub starts with a team that cares about the story.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'VOICE ACTORS', 'Giving characters a voice and personality.'],
              ['02', 'AUDIO & EDITING', 'Shaping performances into polished projects.'],
              ['03', 'CREATIVE TEAM', 'Bringing ideas, direction, and people together.'],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-xl border border-white/10 bg-[#111114] p-6 transition hover:border-red-500/40"
              >
                <p className="text-sm font-black text-red-500">
                  {number} / DXE
                </p>
                <h3 className="mt-6 text-lg font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-gray-600">
            Team roles are illustrative. Add actual member names and credits
            after client approval.
          </p>
        </section>

        {/* JOIN DXE */}
        <section id="join" className="scroll-mt-24 px-5 pb-24 md:px-10">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/60 via-[#171014] to-[#0b0b0d] px-6 py-16 text-center sm:px-12">
            <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-red-600/10 blur-[70px]" />

            <div className="relative">
              <SectionLabel>YOUR VOICE BELONGS HERE</SectionLabel>

              <h2 className="text-3xl font-black sm:text-5xl">
                READY TO JOIN THE EMPIRE?
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-400">
                Interested in voice acting, editing, or collaborating with DXE?
                Reach out through our official social channels.
              </p>

              <a
                href="#contact"
                className="mt-8 inline-flex rounded-md bg-red-600 px-7 py-4 text-xs font-black tracking-widest transition hover:bg-red-500"
              >
                LET'S CONNECT ↗
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT & FOOTER */}
        <section
          id="contact"
          className="scroll-mt-24 border-t border-white/10 bg-[#0e0e11]"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-2 md:items-center md:px-10">
            <div>
              <p className="text-xl font-black tracking-wider">
                <span className="text-red-500">DX</span>E — DUBXEMPIRE
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                An independent fan dubbing studio built by fans, for fans.
                Follow the journey and stay tuned for new projects.
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-xs font-bold tracking-[0.2em] text-gray-500">
                FIND US ONLINE
              </p>
              <p className="mt-3 text-sm text-gray-400">
                Add the studio's official Discord, Instagram, YouTube, and
                email links here.
              </p>
            </div>
          </div>

          <footer className="border-t border-white/10 px-5 py-5 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} DXE — DubxEmpire. All rights reserved.
          </footer>
        </section>
      </main>
    </div>
  )
}
