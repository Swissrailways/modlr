'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CheckCircle, AlertCircle, Loader2, BookOpen, ShoppingBag } from 'lucide-react'

interface VerifyResult {
  paid: boolean
  product?: { id: number; name: string; shop: { name: string; slug: string } }
  error?: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [result, setResult] = useState<VerifyResult | null>(null)

  useEffect(() => {
    if (!sessionId) {
      // No session_id — could be a free purchase redirect
      setStatus('success')
      return
    }

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then((data: VerifyResult) => {
        if (data.paid) {
          setResult(data)
          setStatus('success')
        } else {
          setResult(data)
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <Loader2 size={48} className="text-indigo-400 animate-spin mx-auto mb-4" />
        <h1 className="text-white text-xl font-bold">Confirming your payment...</h1>
        <p className="text-zinc-400 mt-2">Please wait, do not close this page.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600/20 border border-red-600 rounded-full mb-6">
          <AlertCircle size={40} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Not Confirmed</h1>
        <p className="text-zinc-400 mb-2">
          We couldn&apos;t verify your payment. If you were charged, contact support with your session ID:
        </p>
        {sessionId && (
          <code className="block text-xs text-zinc-500 bg-zinc-900 px-3 py-2 rounded mb-6 break-all">
            {sessionId}
          </code>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/library" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
            <BookOpen size={18} />
            Check My Library
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-lg transition-colors">
            <ShoppingBag size={18} />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center max-w-md">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 border border-green-600 rounded-full mb-6">
        <CheckCircle size={40} className="text-green-400" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
      {result?.product ? (
        <p className="text-zinc-400 mb-8">
          You now own <span className="text-white font-medium">{result.product.name}</span> by {result.product.shop.name}.
          It&apos;s available in your library.
        </p>
      ) : (
        <p className="text-zinc-400 mb-8">
          Your purchase is confirmed and available in your library.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/library"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          <BookOpen size={18} />
          Go to My Library
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-lg transition-colors"
        >
          <ShoppingBag size={18} />
          Keep Shopping
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <Suspense fallback={
          <div className="text-center">
            <Loader2 size={48} className="text-indigo-400 animate-spin mx-auto mb-4" />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  )
}
