'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { ModlrMark } from '@/components/ModlrLogo'

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.135 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const discordParam = searchParams.get('discord')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (discordParam === 'sent') setSent(true)
    if (discordParam === 'not_found') setError('No Modlr account is linked to that Discord. Try using your email instead.')
  }, [discordParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 429) {
        setError('Too many requests. Please wait a few minutes and try again.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-5 shadow-xl shadow-indigo-600/30">
            <ModlrMark size={30} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forgot password?</h1>
          <p className="text-zinc-500 text-sm mt-1.5">Reset via Discord DM or email</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          {sent ? (
            <div className="text-center py-2">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">Reset link sent!</p>
              <p className="text-zinc-400 text-sm mt-2">
                {discordParam === 'sent'
                  ? 'Check your Discord DMs for the password reset link.'
                  : <>If an account exists for <strong className="text-white">{email}</strong>, you'll receive a reset link shortly.</>
                }
              </p>
              <p className="text-zinc-500 text-xs mt-3">Link expires in 1 hour.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Discord button */}
              <a
                href="/api/auth/discord?state=password_reset"
                className="w-full flex items-center justify-center gap-2.5 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-[#5865F2]/20"
              >
                <DiscordIcon />
                Get reset link via Discord DM
              </a>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-zinc-600 text-xs">or use email</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
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

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-indigo-600/20"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  )
}
