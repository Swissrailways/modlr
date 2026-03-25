'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Loader2 } from 'lucide-react'

// Stripe sends users here if the onboarding link expired — just generate a new one
export default function ConnectRefreshPage() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/shop/connect', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.url) window.location.href = data.url
        else router.push('/dashboard')
      })
      .catch(() => router.push('/dashboard'))
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="text-indigo-400 animate-spin" />
      </div>
    </div>
  )
}
