'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, CheckCircle, XCircle } from 'lucide-react'
import { ModlrMark } from '@/components/ModlrLogo'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="text-center py-2">
        <XCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-white font-medium">Invalid link</p>
        <p className="text-zinc-400 text-sm mt-2">This password reset link is missing a token.</p>
        <Link href="/forgot-password" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
          Request a new link
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
        <p className="text-white font-medium">Password updated!</p>
        <p className="text-zinc-400 text-sm mt-2">You'll be redirected to login in a moment.</p>
        <Link href="/login" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
          Go to login now
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">New password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat new password"
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
        disabled={loading || !password || !confirm}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-indigo-600/20"
      >
        {loading ? 'Updating...' : 'Set New Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-5 shadow-xl shadow-indigo-600/30">
            <ModlrMark size={30} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
          <p className="text-zinc-500 text-sm mt-1.5">Choose a strong password for your account</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <Suspense fallback={<div className="text-zinc-500 text-sm text-center py-4">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
