'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail } from 'lucide-react'
import { ModlrMark } from '@/components/ModlrLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        if (data.requiresVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        } else {
          setError(data.error || 'Login failed')
          setLoading(false)
        }
      }
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
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

        <div className="panel-top-accent bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-glow w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-zinc-600 text-sm mt-5">
            No account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
