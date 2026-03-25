'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Download, ShoppingCart, CheckCircle, Tag, FolderOpen, Loader2, ChevronRight, HardDrive, BarChart2 } from 'lucide-react'
import { formatPrice, type ProductItem } from '@/components/ProductCard'
import { formatBytes } from '@/lib/utils'

interface ProductDetail extends ProductItem {
  filePath: string
  purchased: boolean
  shop: { id: number; name: string; slug: string; userId?: number }
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [previewIdx, setPreviewIdx] = useState(0)
  const [user, setUser] = useState<{ id: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
    ]).then(([prod, u]) => {
      setProduct(prod)
      setUser(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  async function handleBuy() {
    if (!user) { router.push('/login'); return }
    setBuying(true)
    setBuyError('')
    try {
      const res = await fetch(`/api/checkout/${id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setBuyError(data.error || 'Checkout failed'); setBuying(false); return }
      if (data.free) {
        setProduct(p => p ? { ...p, purchased: true } : p)
        setBuying(false)
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setBuyError('Connection error')
      setBuying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="text-indigo-400 animate-spin" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500">Product not found.</p>
      </div>
    </div>
  )

  const canDownload = product.purchased || product.price === 0
  const fileExt = product.fileName.split('.').pop()?.toUpperCase() ?? 'FILE'

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-600 mb-6">
          <Link href="/" className="hover:text-zinc-400 transition-colors">Marketplace</Link>
          <ChevronRight size={12} />
          <Link href={`/shop/${product.shop.slug}`} className="hover:text-zinc-400 transition-colors">{product.shop.name}</Link>
          <ChevronRight size={12} />
          <span className="text-zinc-500 truncate max-w-[180px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: images + info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image viewer */}
            {product.previewImages.length > 0 ? (
              <div>
                <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 relative group">
                  <img
                    src={product.previewImages[previewIdx].url}
                    alt={product.name}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                    onContextMenu={e => e.preventDefault()}
                  />
                  {/* Shield overlay */}
                  <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} />
                  {/* Vignette */}
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] pointer-events-none rounded-2xl" />
                </div>
                {product.previewImages.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {product.previewImages.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setPreviewIdx(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                          i === previewIdx
                            ? 'border-indigo-500 opacity-100 shadow-md shadow-indigo-500/30'
                            : 'border-zinc-800 hover:border-zinc-600 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="w-full h-full object-cover pointer-events-none"
                          draggable={false}
                          onContextMenu={e => e.preventDefault()}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/50">
                <span className="text-8xl opacity-20 select-none">⬡</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
                <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-indigo-500 inline-block" />
                  Description
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/?q=${tag}`}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-indigo-300 border border-zinc-800 hover:border-indigo-500/40 px-3 py-1.5 rounded-full text-xs transition-all"
                  >
                    <Tag size={10} />
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: buy panel */}
          <div className="lg:col-span-1">
            <div className="panel-top-accent bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden sticky top-20 shadow-2xl shadow-black/50 backdrop-blur-sm">

              <div className="p-5">
                <h1 className="text-white font-bold text-xl leading-tight mb-1">{product.name}</h1>
                <Link
                  href={`/shop/${product.shop.slug}`}
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  by {product.shop.name}
                </Link>

                {/* Price */}
                <div className="my-5">
                  <div className={`text-4xl font-bold tracking-tight ${
                    product.price === 0 ? 'text-emerald-400' : 'gradient-text-accent'
                  }`}>
                    {formatPrice(product.price, product.currency)}
                  </div>
                  {product.price > 0 && (
                    <p className="text-zinc-600 text-xs mt-1">One-time purchase · Instant download</p>
                  )}
                  {product.price === 0 && (
                    <p className="text-zinc-600 text-xs mt-1">Free download · No account required</p>
                  )}
                </div>

                {/* File info grid */}
                <div className="bg-zinc-800/50 border border-zinc-700/40 rounded-xl p-3.5 mb-4 grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
                      <HardDrive size={9} />Format
                    </span>
                    <span className="text-zinc-200 font-semibold text-sm">{fileExt}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
                      <HardDrive size={9} />Size
                    </span>
                    <span className="text-zinc-200 font-semibold text-sm">{formatBytes(BigInt(product.fileSize))}</span>
                  </div>
                  {product.category && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
                        <FolderOpen size={9} />Category
                      </span>
                      <span className="text-zinc-200 font-semibold text-sm">{product.category.name}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
                      <BarChart2 size={9} />Downloads
                    </span>
                    <span className="text-zinc-200 font-semibold text-sm tabular-nums">{product.purchaseCount.toLocaleString()}</span>
                  </div>
                </div>

                {/* CTA */}
                {canDownload ? (
                  <a
                    href={`/api/download/${product.id}`}
                    className="btn-glow flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                  >
                    <Download size={16} />
                    Download File
                  </a>
                ) : (
                  <>
                    <button
                      onClick={handleBuy}
                      disabled={buying}
                      className="btn-glow flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm mb-2"
                    >
                      {buying ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                      {buying ? 'Processing…' : `Buy for ${formatPrice(product.price, product.currency)}`}
                    </button>
                    {!user && (
                      <p className="text-zinc-600 text-xs text-center">
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link> to purchase
                      </p>
                    )}
                  </>
                )}

                {product.purchased && product.price > 0 && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <CheckCircle size={12} />
                    You own this product
                  </div>
                )}

                {buyError && (
                  <p className="text-red-400 text-xs mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{buyError}</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
