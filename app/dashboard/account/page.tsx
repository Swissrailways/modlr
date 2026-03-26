'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Lock, Trash2, ArrowLeft } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/?deleted=1')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete account')
        setLoading(false)
      }
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        <h1 className="text-xl font-bold text-white mb-6">Account Settings</h1>

        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Delete Account</h2>
              <p className="text-zinc-500 text-sm mt-0.5">
                Permanently deletes your account, shop, all listings, and purchase history. This cannot be undone.
              </p>
            </div>
          </div>

          {!confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium py-2.5 px-4 rounded-xl transition-all text-sm"
            >
              <AlertTriangle size={14} />
              I want to delete my account
            </button>
          ) : (
            <form onSubmit={handleDelete} className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm font-medium">This action is permanent and irreversible.</p>
                <p className="text-red-400/70 text-xs mt-0.5">Enter your password to confirm.</p>
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 text-sm transition-all"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setConfirmed(false); setPassword(''); setError('') }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-xl transition-all text-sm border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  {loading ? 'Deleting...' : 'Delete my account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
