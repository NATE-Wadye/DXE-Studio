import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProfilePopover({ userId, children }) {
    const [open, setOpen] = useState(false)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open || !userId) return

        let active = true

        async function loadProfile() {
            setLoading(true)
            setProfile(null)

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, display_name, bio, avatar_url, created_at, role')
                .eq('id', userId)
                .maybeSingle()

            if (!active) return

            setProfile(error ? null : data)
            setLoading(false)
        }

        loadProfile()

        return () => {
            active = false
        }
    }, [open, userId])

    useEffect(() => {
        if (!open) return

        function handleKeyDown(event) {
            if (event.key === 'Escape') setOpen(false)
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [open])

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                className="inline-flex cursor-pointer rounded-full text-left"
                aria-expanded={open}
                aria-label="View member profile"
            >
                {children}
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close profile pop-out"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setOpen(false)}
                    />

                    <div className="fixed left-4 top-24 z-[9999] w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#111113] text-white shadow-2xl shadow-black/60 sm:left-auto">            <div className="h-20 bg-gradient-to-r from-red-950 via-red-700 to-[#171717]" />

                        <div className="px-4 pb-4">
                            <div className="-mt-10 mb-3 flex items-end justify-between">
                                <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full border-4 border-[#111113] bg-[#222]">
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="h-9 w-9 text-white/60"
                                        >
                                            <circle cx="12" cy="8" r="4" />
                                            <path
                                                d="M4.5 21a7.5 7.5 0 0 1 15 0"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="mb-2 rounded-lg px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {loading ? (
                                <p className="py-4 text-sm text-white/50">
                                    Loading profile...
                                </p>
                            ) : profile ? (
                                <>
                                    <h3 className="break-words text-lg font-bold">
                                        {profile.display_name || profile.username || 'DXE Member'}
                                    </h3>

                                    
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <p className="text-sm text-white/45">
                                            @{profile.username || 'member'}
                                        </p>

                                        <span
                                            className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold tracking-wider ${profile.role === 'admin'
                                                    ? 'border-red-500/40 bg-red-500/15 text-red-400'
                                                    : 'border-white/15 bg-white/5 text-white/60'
                                                }`}
                                        >
                                            {profile.role === 'admin' ? '✦ ADMIN' : 'MEMBER'}
                                        </span>
                                    </div>
                                    

                                    <div className="mb-4 border-t border-white/10 pt-3">
                                        <p className="mb-1 text-[10px] font-bold tracking-[0.2em] text-red-400">
                                            ABOUT
                                        </p>
                                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/75">
                                            {profile.bio || 'This member has not added a bio yet.'}
                                        </p>
                                    </div>

                                    {profile.created_at && (
                                        <p className="mb-4 text-xs text-white/40">
                                            Joined{' '}
                                            {new Date(profile.created_at).toLocaleDateString(
                                                undefined,
                                                { month: 'short', year: 'numeric' }
                                            )}
                                        </p>
                                    )}

                                </>
                            ) : (
                                <p className="py-4 text-sm text-white/50">
                                    Couldn't load this profile. Please try again.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </span>
    )
}
