'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ConnectReturnPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'complete' | 'incomplete'>('checking')

  useEffect(() => {
    // Give Stripe a moment to update the account status
    setTimeout(() => {
      fetch('/api/shop/connect')
        .then(r => r.json())
        .then(data => {
          setStatus(data.complete ? 'complete' : 'incomplete')
        })
        .catch(() => setStatus('incomplete'))
    }, 1500)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {status === 'checking' && (
            <>
              <Loader2 size={48} className="text-indigo-400 animate-spin mx-auto mb-4" />
              <h1 className="text-white text-xl font-bold">Verifying your account...</h1>
            </>
          )}
          {status === 'complete' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 border border-green-600 rounded-full mb-6">
                <CheckCircle size={40} className="text-green-400" />
              </div>
              <h1 className="text-white text-2xl font-bold mb-2">Payments Connected!</h1>
              <p className="text-zinc-400 mb-6">
                Your Stripe account is set up. You can now sell paid listings and receive payouts directly to your bank account.
              </p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Go to Dashboard
              </Link>
            </>
          )}
          {status === 'incomplete' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-600/20 border border-yellow-600 rounded-full mb-6">
                <AlertCircle size={40} className="text-yellow-400" />
              </div>
              <h1 className="text-white text-2xl font-bold mb-2">Setup Incomplete</h1>
              <p className="text-zinc-400 mb-6">
                Your Stripe account setup isn&apos;t finished yet. You can continue setting it up from your dashboard.
              </p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-lg transition-colors">
                Back to Dashboard
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
