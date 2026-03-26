'use client'

import Link from 'next/link'
import { ModlrMark } from '@/components/ModlrLogo'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    discord_cancelled: 'Discord login was cancelled.',
    discord_failed: 'Something went wrong with Discord login. Please try again.',
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to Modlr</h1>
          <p className="text-zinc-500 text-sm mt-1.5">Sign in or create an account instantly</p>
        </div>

        <div className="panel-top-accent bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4 text-center">
              {errorMessages[error] ?? 'An error occurred. Please try again.'}
            </p>
          )}

          <a
            href="/api/auth/discord"
            className="flex items-center justify-center gap-3 w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-3 rounded-xl transition-all text-sm"
          >
            <svg width="22" height="22" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.7a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.8a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.7a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36 36 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.7-8.9.2.2 0 0 0 .1-.2c1.5-15-2.5-28-10.5-39.8a.2.2 0 0 0-.1-.1ZM23.7 36c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z" fill="currentColor"/>
            </svg>
            Continue with Discord
          </a>

          <p className="text-center text-zinc-600 text-xs mt-4">
            New users get an account automatically
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
