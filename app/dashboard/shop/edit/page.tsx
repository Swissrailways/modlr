'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react'
import { Suspense } from 'react'

function EditShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stripeStatus = searchParams.get('stripe')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)

  useEffect(() => {
    fetch('/api/shop').then(r => {
      if (!r.ok) { router.push('/login'); return null }
      return r.json()
    }).then(data => {
      if (!data) return
      setName(data.name)
      setDescription(data.description ?? '')
      setStripeConnected(!!data.stripeAccountComplete)
      setFetching(false)
    }).catch(() => router.push('/login'))
  }, [router])

  async function handleConnectStripe() {
    setConnectingStripe(true)
    try {
      const res = await fetch('/api/stripe/connect/onboard', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setError(data.error || 'Failed to start Stripe setup'); setConnectingStripe(false) }
    } catch {
      setError('Connection error')
      setConnectingStripe(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/shop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update shop')
        setLoading(false)
      }
    } catch {
      setError('Connection error.')
      setLoading(false)
    }
  }

  if (fetching) return <div className="min-h-screen bg-zinc-950" />

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-white">Edit Shop</h1>

        {/* Shop details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Shop Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
              />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => router.back()} className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Stripe Connect */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <CreditCard size={16} className="text-indigo-400" />
            Payment Setup
          </h2>
          <p className="text-zinc-500 text-xs mb-4">Connect Stripe to receive payouts when customers buy your products.</p>

          {stripeStatus === 'connected' || stripeConnected ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm">
              <CheckCircle size={16} />
              Stripe account connected — you can receive payments!
            </div>
          ) : stripeStatus === 'pending' ? (
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-sm mb-3">
              <AlertCircle size={16} />
              Stripe setup incomplete — please finish onboarding.
            </div>
          ) : stripeStatus === 'error' ? (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm mb-3">
              <AlertCircle size={16} />
              Something went wrong. Please try again.
            </div>
          ) : null}

          {!stripeConnected && (
            <button
              onClick={handleConnectStripe}
              disabled={connectingStripe}
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2"
            >
              {connectingStripe ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              {connectingStripe ? 'Redirecting to Stripe…' : stripeStatus === 'pending' ? 'Continue Stripe Setup' : 'Connect Stripe Account'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default function EditShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <EditShopContent />
    </Suspense>
  )
}
