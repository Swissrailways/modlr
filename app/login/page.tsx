'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, User, ChevronDown } from 'lucide-react'
import { ModlrMark } from '@/components/ModlrLogo'

const DISCORD_ICON = (
  <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.7a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.8a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.7a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36 36 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.7-8.9.2.2 0 0 0 .1-.2c1.5-15-2.5-28-10.5-39.8a.2.2 0 0 0-.1-.1ZM23.7 36c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z" fill="currentColor"/>
  </svg>
)

function LoginContent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const discordError = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    discord_cancelled: 'Discord login was cancelled.',
    discord_failed: 'Something went wrong with Discord login. Please try again.',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Login failed')
        setLoading(false)
      }
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-60" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-5 shadow-xl shadow-indigo-600/30">
            <ModlrMark size={30} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-zinc-500 text-sm mt-1.5">Sign in to your Modlr account</p>
        </div>

        <div className="panel-top-accent bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          {discordError && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
              {errorMessages[discordError] ?? 'An error occurred.'}
            </p>
          )}

          {/* Discord login */}
          <a
            href="/api/auth/discord"
            className="flex items-center justify-center gap-2.5 w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
          >
            {DISCORD_ICON}
            Continue with Discord
          </a>

          {/* Toggle for username/password */}
          <button
            type="button"
            onClick={() => setShowForm(v => !v)}
            className="w-full flex items-center justify-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            Sign in with username &amp; password
            <ChevronDown size={13} className={`transition-transform ${showForm ? 'rotate-180' : ''}`} />
          </button>

          {/* Username + password login */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="btn-glow w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center">
                <Link href="/forgot-password" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                  Forgot password?
                </Link>
              </div>
            </form>
          )}

          <p className="text-center text-zinc-600 text-xs">
            No account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign up with Discord</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
