'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Download, BookOpen, Loader2, Tag, Sparkles } from 'lucide-react'
import { formatPrice } from '@/components/ProductCard'
import { formatBytes } from '@/lib/utils'

interface Purchase {
  id: number
  amount: number
  currency: string
  createdAt: string
  product: {
    id: number; name: string; fileName: string; fileSize: string
    price: number; mimeType: string
    previewImages: { path: string; url?: string }[]
    shop: { name: string; slug: string }
    tags: string[]
  }
}

export default function LibraryPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.push('/login'); return null }
      return fetch('/api/library')
    }).then(r => {
      if (!r) return
      if (r.ok) return r.json()
    }).then(data => {
      if (data) setPurchases(data)
      setLoading(false)
    }).catch(() => { router.push('/login') })
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="text-indigo-400 animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <BookOpen size={22} className="text-indigo-400" />
              My Library
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {purchases.length === 0 ? 'Your purchases will appear here' : `${purchases.length} item${purchases.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="relative text-center py-24 rounded-3xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="dot-grid absolute inset-0 opacity-60" />
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-indigo-600/5 blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-violet-600/5 blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-zinc-500" />
              </div>
              <p className="text-zinc-300 text-lg font-semibold">Your library is empty</p>
              <p className="text-zinc-600 text-sm mt-1 mb-6">Get some models and they&apos;ll show up here.</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all btn-glow">
                <Sparkles size={14} />
                Browse Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {purchases.map(purchase => {
              const previewImg = purchase.product.previewImages[0]
              const previewSrc = previewImg?.url ?? (previewImg ? `/api/preview/${previewImg.path}` : null)
              return (
                <div key={purchase.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors group">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-700/50">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt=""
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-2xl opacity-30 select-none">⬡</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${purchase.product.id}`} className="text-white font-medium text-sm hover:text-indigo-300 transition-colors truncate block">
                      {purchase.product.name}
                    </Link>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      by{' '}
                      <Link href={`/shop/${purchase.product.shop.slug}`} className="text-zinc-400 hover:text-indigo-400 transition-colors">
                        {purchase.product.shop.name}
                      </Link>
                      {' · '}{formatBytes(BigInt(purchase.product.fileSize))}
                      {' · '}
                      <span className={purchase.amount === 0 ? 'text-emerald-400' : 'text-zinc-400'}>
                        {purchase.amount === 0 ? 'Free' : `Paid ${formatPrice(purchase.amount, purchase.currency)}`}
                      </span>
                    </p>
                    {purchase.product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {purchase.product.tags.slice(0, 4).map(t => (
                          <span key={t} className="flex items-center gap-1 bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md text-xs border border-zinc-700/50">
                            <Tag size={9} />{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Download button */}
                  <a
                    href={`/api/download/${purchase.product.id}`}
                    className="btn-glow flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex-shrink-0"
                  >
                    <Download size={13} />
                    Download
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
