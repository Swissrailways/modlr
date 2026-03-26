'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

export default function AdminSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSetup() {
    setLoading(true)
    const res = await fetch('/api/admin/setup', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      router.push('/admin')
    } else {
      setError(data.error || 'Failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-5 shadow-xl shadow-indigo-600/30">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Setup</h1>
        <p className="text-zinc-500 text-sm mb-8">Click below to promote your account to admin. This only works if no admin exists yet.</p>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
        >
          {loading ? 'Setting up...' : 'Become Admin'}
        </button>
      </div>
    </div>
  )
}
