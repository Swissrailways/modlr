'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Mail, CheckCircle, XCircle } from 'lucide-react'
import { ModlrMark } from '@/components/ModlrLogo'

function VerifyEmailContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const email = params.get('email') ?? ''
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)

  // No error = sent state (after registration)
  if (!error) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-5 shadow-xl shadow-indigo-600/30">
          <Mail size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Check your email</h1>
        <p className="text-zinc-500 text-sm mt-2 mb-8">
          We sent a verification link to{' '}
          {email ? <strong className="text-zinc-300">{email}</strong> : 'your email address'}.
          Click it to activate your account.
        </p>

        <div className="panel-top-accent bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm text-left space-y-4">
          <p className="text-zinc-400 text-sm">Didn&apos;t receive it? Check your spam folder or resend below.</p>

          {resent ? (
            <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
              Verification email resent!
            </p>
          ) : (
            <button
              onClick={async () => {
                if (!email) return
                setResending(true)
                await fetch('/api/auth/resend-verification', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                })
                setResending(false)
                setResent(true)
              }}
              disabled={resending || !email}
              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all text-sm border border-zinc-700"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          )}

          <p className="text-center text-zinc-600 text-sm">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Back to login</Link>
          </p>
        </div>
      </div>
    )
  }

  // Error states
  const isInvalid = error === 'invalid' || error === 'missing'
  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 shadow-xl ${isInvalid ? 'bg-red-600 shadow-red-600/30' : 'bg-green-600 shadow-green-600/30'}`}>
        {isInvalid ? <XCircle size={28} className="text-white" /> : <CheckCircle size={28} className="text-white" />}
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        {isInvalid ? 'Invalid or expired link' : 'Something went wrong'}
      </h1>
      <p className="text-zinc-500 text-sm mt-2 mb-8">
        {isInvalid
          ? 'This verification link has expired or already been used.'
          : 'An error occurred. Please try again.'}
      </p>
      <div className="panel-top-accent bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-3">
        <Link
          href="/register"
          className="block w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm text-center"
        >
          Create a new account
        </Link>
        <Link
          href="/login"
          className="block text-center text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-60" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg mb-4">
              <ModlrMark size={18} />
            </div>
          </Link>
        </div>
        <Suspense>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
