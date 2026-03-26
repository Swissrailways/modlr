'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProductCard, { type ProductItem } from '@/components/ProductCard'
import { Store, Loader2, PackageOpen, Calendar, Download, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ShopData {
  id: number
  name: string
  slug: string
  description?: string | null
  logoPath?: string | null
  bannerPath?: string | null
  createdAt: string
  user: { username: string; createdAt: string }
  products: ProductItem[]
}

function shopGradient(name: string) {
  const gradients = [
    'from-indigo-900 to-purple-900',
    'from-blue-900 to-cyan-900',
    'from-emerald-900 to-teal-900',
    'from-rose-900 to-pink-900',
    'from-amber-900 to-orange-900',
    'from-violet-900 to-fuchsia-900',
    'from-sky-900 to-indigo-900',
    'from-green-900 to-emerald-900',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')

  useEffect(() => {
    fetch(`/api/shop/${slug}`)
      .then(r => { if (!r.ok) { setNotFound(true); setLoading(false); return null } return r.json() })
      .then(data => { if (data) { setShop(data); setLoading(false) } })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="text-indigo-400 animate-spin" />
      </div>
    </div>
  )

  if (notFound || !shop) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <Store size={52} className="text-zinc-700 mb-4" />
        <h1 className="text-white text-xl font-bold">Shop Not Found</h1>
        <p className="text-zinc-500 mt-2">This shop doesn&apos;t exist or has been removed.</p>
      </div>
    </div>
  )

  const gradient = shopGradient(shop.name)
  const totalDownloads = shop.products.reduce((sum, p) => sum + (p.purchaseCount ?? 0), 0)
  const joinedYear = new Date(shop.user.createdAt).getFullYear()

  // Collect signed preview URLs from products
  const bannerPreviews = shop.products
    .flatMap(p => p.previewImages)
    .slice(0, 8)

  // Client-side filter + sort
  let displayed = [...shop.products]
  if (filter === 'free') displayed = displayed.filter(p => p.price === 0)
  if (filter === 'paid') displayed = displayed.filter(p => p.price > 0)
  if (sort === 'price_asc') displayed.sort((a, b) => a.price - b.price)
  else if (sort === 'price_desc') displayed.sort((a, b) => b.price - a.price)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      {/* Back to marketplace */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={14} />
          Back to Marketplace
        </Link>
      </div>

      {/* Banner */}
      <div className={`relative bg-gradient-to-br ${gradient} overflow-hidden`} style={{ minHeight: '220px' }}>
        {/* Background preview mosaic */}
        {bannerPreviews.length > 0 && (
          <div className="absolute inset-0 flex gap-0.5 opacity-20">
            {bannerPreviews.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt=""
                className="h-full w-32 object-cover flex-shrink-0 pointer-events-none select-none"
                draggable={false}
                onContextMenu={e => e.preventDefault()}
              />
            ))}
          </div>
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-end gap-5">
            {/* Shop avatar */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} border border-white/15 flex items-center justify-center flex-shrink-0 shadow-2xl shadow-black/60`}>
              <Store size={32} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white tracking-tight">{shop.name}</h1>
              <p className="text-zinc-400 mt-1">
                by <span className="text-white font-medium">@{shop.user.username}</span>
              </p>
              {shop.description && (
                <p className="text-zinc-300 mt-2 text-sm max-w-2xl leading-relaxed">{shop.description}</p>
              )}
            </div>
          </div>

          {/* Stats row — glass pills */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="glass-pill">
              <Package size={13} className="text-indigo-400" />
              <strong className="text-white font-semibold">{shop.products.length}</strong>
              <span>listings</span>
            </div>
            <div className="glass-pill">
              <Download size={13} className="text-indigo-400" />
              <strong className="text-white font-semibold">{totalDownloads.toLocaleString()}</strong>
              <span>downloads</span>
            </div>
            <div className="glass-pill">
              <Calendar size={13} className="text-indigo-400" />
              <span>Member since</span>
              <strong className="text-white font-semibold">{joinedYear}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">

        {shop.products.length === 0 ? (
          <div className="text-center py-24">
            <PackageOpen size={52} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg">This shop has no listings yet.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
                {(['all', 'free', 'paid'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                      filter === f
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {f === 'all' ? `All (${shop.products.length})` :
                     f === 'free' ? `Free (${shop.products.filter(p => p.price === 0).length})` :
                     `Paid (${shop.products.filter(p => p.price > 0).length})`}
                  </button>
                ))}
              </div>

              <select
                value={sort}
                onChange={e => setSort(e.target.value as typeof sort)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60 cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {displayed.length === 0 ? (
              <div className="text-center py-16">
                <PackageOpen size={40} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">No listings match this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayed.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
