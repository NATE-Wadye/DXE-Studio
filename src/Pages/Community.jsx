
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AccountAvatar from '../Components/AccountAvatar'
import ProfilePopover from '../Components/ProfilePopover'

function MemberAvatar({ profile }) {
    const name =
        profile?.display_name || profile?.username || 'DXE Member'

    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-red-950 text-sm font-black text-red-300">
            {profile?.avatar_url ? (
                <img
                    src={profile.avatar_url}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            ) : (
                name.slice(0, 1).toUpperCase()
            )}
        </div>
    )
}

function formatDate(date) {
    return new Date(date).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

export default function Community() {
    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [draft, setDraft] = useState('')
    const [commentDrafts, setCommentDrafts] = useState({})
    const [openComments, setOpenComments] = useState({})
    const [announcement, setAnnouncement] = useState(false)
    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const isAdmin = user?.app_metadata?.role === 'admin'

    const loadPosts = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const [
                { data: postRows, error: postError },
                { data: commentRows, error: commentError },
                { data: likeRows, error: likeError },
            ] = await Promise.all([
                supabase
                    .from('community_posts')
                    .select('id, author_id, content, is_announcement, created_at')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('community_comments')
                    .select('id, post_id, author_id, content, created_at')
                    .order('created_at', { ascending: true }),
                supabase
                    .from('community_post_likes')
                    .select('post_id, user_id'),
            ])

            if (postError) throw postError
            if (commentError) throw commentError
            if (likeError) throw likeError

            const allRows = [
                ...(postRows || []),
                ...(commentRows || []),
            ]

            const memberIds = [
                ...new Set(allRows.map((row) => row.author_id)),
            ]

                ; (likeRows || []).forEach((like) => {
                    memberIds.push(like.user_id)
                })

            const uniqueMemberIds = [...new Set(memberIds)]

            let profileMap = {}

            if (uniqueMemberIds.length) {
                const { data: profiles, error: profileError } =
                    await supabase
                        .from('profiles')
                        .select('id, username, display_name, avatar_url')
                        .in('id', uniqueMemberIds)

                if (profileError) throw profileError

                profileMap = Object.fromEntries(
                    (profiles || []).map((profile) => [
                        profile.id,
                        profile,
                    ])
                )
            }

            const commentsByPost = {}

                ; (commentRows || []).forEach((comment) => {
                    if (!commentsByPost[comment.post_id]) {
                        commentsByPost[comment.post_id] = []
                    }

                    commentsByPost[comment.post_id].push({
                        ...comment,
                        profile: profileMap[comment.author_id],
                    })
                })

            const likesByPost = {}

                ; (likeRows || []).forEach((like) => {
                    if (!likesByPost[like.post_id]) {
                        likesByPost[like.post_id] = []
                    }

                    likesByPost[like.post_id].push(like.user_id)
                })

            const formattedPosts = (postRows || [])
                .map((post) => ({
                    ...post,
                    profile: profileMap[post.author_id],
                    comments: commentsByPost[post.id] || [],
                    likes: likesByPost[post.id] || [],
                }))
                .sort((a, b) => {
                    if (a.is_announcement !== b.is_announcement) {
                        return a.is_announcement ? -1 : 1
                    }

                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                })

            setPosts(formattedPosts)
        } catch (err) {
            setError(err.message || 'Could not load the community.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let active = true

        async function initialise() {
            const { data } = await supabase.auth.getUser()

            if (active) setUser(data.user || null)

            await loadPosts()
        }

        initialise()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (active) setUser(session?.user || null)
        })

        return () => {
            active = false
            subscription.unsubscribe()
        }
    }, [loadPosts])

    async function createPost(event) {
        event.preventDefault()

        if (!user) {
            window.location.href = '/auth'
            return
        }

        const content = draft.trim()
        if (!content || posting) return

        setPosting(true)
        setError('')
        setMessage('')

        try {
            const { error: insertError } = await supabase
                .from('community_posts')
                .insert({
                    author_id: user.id,
                    content,
                    is_announcement: isAdmin && announcement,
                })

            if (insertError) throw insertError

            setDraft('')
            setAnnouncement(false)
            setMessage('YOUR POST IS LIVE.')
            await loadPosts()
        } catch (err) {
            setError(err.message || 'Could not publish your post.')
        } finally {
            setPosting(false)
        }
    }

    async function toggleLike(post) {
        if (!user) {
            window.location.href = '/auth'
            return
        }

        setError('')
        setMessage('')

        const alreadyLiked = post.likes.includes(user.id)

        const result = alreadyLiked
            ? await supabase
                .from('community_post_likes')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', user.id)
            : await supabase
                .from('community_post_likes')
                .insert({
                    post_id: post.id,
                    user_id: user.id,
                })

        if (result.error) {
            setError(result.error.message)
            return
        }

        await loadPosts()
    }

    async function createComment(event, postId) {
        event.preventDefault()

        if (!user) {
            window.location.href = '/auth'
            return
        }

        const content = (commentDrafts[postId] || '').trim()
        if (!content) return

        setError('')
        setMessage('')

        const { error: insertError } = await supabase
            .from('community_comments')
            .insert({
                post_id: postId,
                author_id: user.id,
                content,
            })

        if (insertError) {
            setError(insertError.message)
            return
        }

        setCommentDrafts((current) => ({
            ...current,
            [postId]: '',
        }))

        setOpenComments((current) => ({
            ...current,
            [postId]: true,
        }))

        await loadPosts()
    }

    async function deletePost(postId) {
        if (!window.confirm('Delete this post?')) return

        const { error: deleteError } = await supabase
            .from('community_posts')
            .delete()
            .eq('id', postId)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        await loadPosts()
    }

    async function deleteComment(commentId) {
        if (!window.confirm('Delete this comment?')) return

        const { error: deleteError } = await supabase
            .from('community_comments')
            .delete()
            .eq('id', commentId)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        await loadPosts()
    }

    return (
        <main className="min-h-screen bg-[#09090b] text-white">

            <section className="relative overflow-hidden border-b border-white/10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(153,27,27,0.22),transparent_55%)]" />

                <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
                    <p className="text-xs font-black tracking-[0.35em] text-red-500">
                        THE DXE COMMUNITY
                    </p>

                    <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
                        ONE EMPIRE.
                        <br />
                        <span className="text-red-500">MILLIONS OF STORIES.</span>
                    </h1>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                        Talk anime, share your theories, meet fellow fans, and
                        be part of the voice behind DXE.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="#community-feed"
                            className="rounded-md bg-red-600 px-5 py-3 text-xs font-black tracking-wider transition hover:bg-red-500"
                        >
                            ENTER THE FEED ↓
                        </a>
                        <Link
                            to={user ? '/profile' : '/auth'}
                            className="rounded-md border border-white/15 px-5 py-3 text-xs font-black tracking-wider transition hover:border-red-500"
                        >
                            {user ? 'YOUR PROFILE ↗' : 'JOIN THE EMPIRE ↗'}
                        </Link>
                    </div>
                </div>
            </section>

            <section
                id="community-feed"
                className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[minmax(0,1fr)_300px] md:px-10 md:py-14"
            >
                <div className="min-w-0">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black tracking-[0.3em] text-red-500">
                                THE DISCUSSION
                            </p>
                            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                                COMMUNITY FEED<span className="text-red-500">.</span>
                            </h2>
                        </div>

                        <span className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold tracking-wider text-gray-400">
                            {posts.length} {posts.length === 1 ? 'POST' : 'POSTS'}
                        </span>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-5 rounded-lg border border-green-500/20 bg-green-950/20 p-4 text-xs font-bold tracking-wider text-green-300">
                            {message}
                        </div>
                    )}

                    <form
                        onSubmit={createPost}
                        className="mb-8 rounded-2xl border border-white/10 bg-[#101013] p-5 sm:p-6"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <MemberAvatar
                                profile={{
                                    avatar_url: '',
                                    display_name: user?.user_metadata?.full_name || 'You',
                                }}
                            />
                            <div>
                                <p className="text-sm font-bold">
                                    {user
                                        ? user.user_metadata?.full_name || 'Your post'
                                        : 'Join the conversation'}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {user
                                        ? 'Share something with the empire'
                                        : 'Log in to publish a post'}
                                </p>
                            </div>
                        </div>

                        <textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            maxLength={2000}
                            rows={4}
                            placeholder={
                                user
                                    ? 'What anime are you watching? Drop a theory...'
                                    : 'Log in to start a discussion...'
                            }
                            disabled={!user || posting}
                            className="w-full resize-y rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/60 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[10px] text-gray-600">
                                {draft.length}/2000 characters
                            </span>

                            <div className="flex flex-wrap items-center gap-3">
                                {isAdmin && (
                                    <label className="flex items-center gap-2 text-xs text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={announcement}
                                            onChange={(event) =>
                                                setAnnouncement(event.target.checked)
                                            }
                                            className="accent-red-600"
                                        />
                                        Official announcement
                                    </label>
                                )}

                                <button
                                    type="submit"
                                    disabled={!user || !draft.trim() || posting}
                                    className="rounded-md bg-red-600 px-5 py-3 text-xs font-black tracking-wider transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {posting ? 'PUBLISHING...' : 'PUBLISH POST ↗'}
                                </button>
                            </div>
                        </div>

                        {!user && (
                            <p className="mt-4 text-xs text-gray-500">
                                <Link to="/auth" className="text-red-400 hover:text-red-300">
                                    Log in or create an account
                                </Link>{' '}
                                to post, like, and comment.
                            </p>
                        )}
                    </form>

                    {loading ? (
                        <div className="rounded-2xl border border-white/10 p-10 text-center text-sm text-gray-500">
                            Loading the DXE community...
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-[#101013] px-6 py-14 text-center">
                            <div className="text-4xl">✦</div>
                            <h3 className="mt-4 text-lg font-black">
                                BE THE FIRST TO SPEAK.
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                No posts yet. Start the first DXE discussion.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {posts.map((post) => {
                                const liked = post.likes.includes(user?.id)
                                const canDelete =
                                    user &&
                                    (user.id === post.author_id || isAdmin)

                                return (
                                    <article
                                        key={post.id}
                                        className={`overflow-hidden rounded-2xl border bg-[#101013] ${post.is_announcement
                                            ? 'border-red-500/40'
                                            : 'border-white/10'
                                            }`}
                                    >
                                        {post.is_announcement && (
                                            <div className="border-b border-red-500/20 bg-red-950/30 px-5 py-3 text-[10px] font-black tracking-[0.25em] text-red-300">
                                                ✦ OFFICIAL DXE ANNOUNCEMENT
                                            </div>
                                        )}

                                        <div className="p-5 sm:p-6">
                                            <div className="flex items-start gap-3">
                                                <ProfilePopover userId={post.author_id}>
                                                    <MemberAvatar profile={post.profile} />
                                                </ProfilePopover>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                        <ProfilePopover userId={post.author_id}>
                                                            <span className="cursor-pointer hover:text-red-400">
                                                                {post.profile?.display_name || post.profile?.username || 'DXE Member'}
                                                            </span>
                                                        </ProfilePopover>

                                                        {post.profile?.username && (
                                                            <span className="text-xs text-gray-500">
                                                                @{post.profile.username}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-[10px] text-gray-600">
                                                        {formatDate(post.created_at)}
                                                    </p>
                                                </div>

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => deletePost(post.id)}
                                                        className="text-xs text-gray-600 transition hover:text-red-400"
                                                        aria-label="Delete post"
                                                        title="Delete post"
                                                    >
                                                        DELETE
                                                    </button>
                                                )}
                                            </div>

                                            <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">
                                                {post.content}
                                            </p>

                                            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleLike(post)}
                                                    className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${liked
                                                        ? 'border-red-500/40 bg-red-950/40 text-red-300'
                                                        : 'border-white/10 text-gray-400 hover:border-red-500/40 hover:text-red-300'
                                                        }`}
                                                >
                                                    {liked ? '♥ LIKED' : '♡ LIKE'} ·{' '}
                                                    {post.likes.length}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenComments((current) => ({
                                                            ...current,
                                                            [post.id]: !current[post.id],
                                                        }))
                                                    }
                                                    className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-gray-400 transition hover:border-white/25 hover:text-white"
                                                >
                                                    COMMENT · {post.comments.length}
                                                </button>
                                            </div>

                                            {openComments[post.id] && (
                                                <div className="mt-5 border-t border-white/10 pt-5">
                                                    {post.comments.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {post.comments.map((comment) => (
                                                                <div
                                                                    key={comment.id}
                                                                    className="flex items-start gap-3"
                                                                >
                                                                    <MemberAvatar
                                                                        profile={comment.profile}
                                                                    />

                                                                    <div className="min-w-0 flex-1 rounded-xl border border-white/5 bg-black/30 p-3">
                                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                                            <div>
                                                                                <span className="text-xs font-bold">
                                                                                    {comment.profile?.display_name ||
                                                                                        comment.profile?.username ||
                                                                                        'DXE Member'}
                                                                                </span>
                                                                                {comment.profile?.username && (
                                                                                    <span className="ml-2 text-[10px] text-gray-500">
                                                                                        @{comment.profile.username}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {user &&
                                                                                (user.id === comment.author_id ||
                                                                                    isAdmin) && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            deleteComment(comment.id)
                                                                                        }
                                                                                        className="text-[10px] text-gray-600 hover:text-red-400"
                                                                                    >
                                                                                        DELETE
                                                                                    </button>
                                                                                )}
                                                                        </div>

                                                                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">
                                                                            {comment.content}
                                                                        </p>

                                                                        <p className="mt-2 text-[10px] text-gray-600">
                                                                            {formatDate(comment.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-500">
                                                            No comments yet. Start the conversation.
                                                        </p>
                                                    )}

                                                    {user ? (
                                                        <form
                                                            onSubmit={(event) =>
                                                                createComment(event, post.id)
                                                            }
                                                            className="mt-4 flex items-start gap-2"
                                                        >
                                                            <input
                                                                value={commentDrafts[post.id] || ''}
                                                                onChange={(event) =>
                                                                    setCommentDrafts((current) => ({
                                                                        ...current,
                                                                        [post.id]: event.target.value,
                                                                    }))
                                                                }
                                                                maxLength={1000}
                                                                placeholder="Write a comment..."
                                                                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-red-500/60"
                                                            />

                                                            <button
                                                                type="submit"
                                                                disabled={
                                                                    !(commentDrafts[post.id] || '').trim()
                                                                }
                                                                className="rounded-lg bg-red-600 px-4 py-3 text-xs font-black transition hover:bg-red-500 disabled:opacity-40"
                                                            >
                                                                SEND
                                                            </button>
                                                        </form>
                                                    ) : (
                                                        <p className="mt-4 text-xs text-gray-500">
                                                            <Link
                                                                to="/auth"
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                Log in
                                                            </Link>{' '}
                                                            to leave a comment.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </div>

                <aside className="space-y-5">
                    <div className="rounded-2xl border border-white/10 bg-[#101013] p-5">
                        <p className="text-[10px] font-black tracking-[0.3em] text-red-500">
                            WELCOME TO DXE
                        </p>
                        <h3 className="mt-3 text-lg font-black">
                            RESPECT THE EMPIRE.
                        </h3>
                        <ul className="mt-4 space-y-3 text-xs leading-6 text-gray-400">
                            <li>01. Respect every member.</li>
                            <li>02. Keep discussions constructive.</li>
                            <li>03. No spam or harassment.</li>
                            <li>04. Keep posts relevant to the community.</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-[#101013] p-5">
                        <p className="text-[10px] font-black tracking-[0.3em] text-red-400">
                            YOUR ACCOUNT
                        </p>
                        <h3 className="mt-3 text-lg font-black">
                            {user ? 'YOU ARE IN THE EMPIRE.' : 'YOUR VOICE BELONGS HERE.'}
                        </h3>
                        <p className="mt-2 text-xs leading-6 text-gray-400">
                            {user
                                ? 'Join the discussion, share your thoughts, and connect with fellow fans.'
                                : 'Sign in to publish posts, leave comments, and like discussions.'}
                        </p>
                        <Link
                            to={user ? '/profile' : '/auth'}
                            className="mt-5 inline-flex rounded-md border border-red-500/40 px-4 py-3 text-xs font-black tracking-wider text-red-300 transition hover:bg-red-600 hover:text-white"
                        >
                            {user ? 'VIEW YOUR PROFILE ↗' : 'LOGIN / SIGN UP ↗'}
                        </Link>
                    </div>
                </aside>
            </section>

            <footer className="border-t border-white/10 px-5 py-8 text-center text-[10px] tracking-[0.25em] text-gray-600">
                © {new Date().getFullYear()} DUBXEMPIRE · BUILT BY THE COMMUNITY
            </footer>
        </main>
    )
}
