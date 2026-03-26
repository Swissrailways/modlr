'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Plus, Store, Package, Pencil, Trash2, Eye, EyeOff, Loader2, CreditCard, CheckCircle, AlertTriangle, Download, ExternalLink, Settings, UserCog } from 'lucide-react'
import { formatPrice } from '@/components/ProductCard'
import { formatBytes } from '@/lib/utils'

interface Shop {
  id: number; name: string; slug: string; description?: string | null
  stripeAccountId?: string | null; stripeAccountComplete: boolean
  _count: { products: number }
}

interface ConnectStatus {
  connected: boolean; complete: boolean
}

interface Product {
  id: number; name: string; price: number; currency: string
  fileSize: string; published: boolean; purchaseCount: number; createdAt: string
  previewImages: { path: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null | undefined>(undefined)
  const [products, setProducts] = useState<Product[]>([])
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null)
  const [connectLoading, setConnectLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.push('/login'); return }
      return fetch('/api/shop')
    }).then(r => {
      if (!r) return
      if (!r.ok) { setShop(null); setLoading(false); return }
      return r.json()
    }).then(data => {
      if (data === undefined) return
      setShop(data)
      if (data) {
        fetch(`/api/products?shopId=${data.id}&sort=newest`).then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {})
        fetch('/api/shop/connect').then(r => r.ok ? r.json() : null).then(d => { if (d) setConnectStatus(d) }).catch(() => {})
      }
      setLoading(false)
    }).catch(() => { router.push('/login') })
  }, [router])

  async function handleConnectStripe() {
    setConnectLoading(true)
    try {
      const res = await fetch('/api/shop/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {}
    setConnectLoading(false)
  }

  async function togglePublish(product: Product) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !product.published }),
    })
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, published: !p.published } : p))
    } else {
      alert('Failed to update listing. Please try again.')
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id))
    else alert('Failed to delete product.')
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={22} className="text-indigo-400 animate-spin" />
        </div>
      </div>
    )
  }

  const totalDownloads = products.reduce((s, p) => s + p.purchaseCount, 0)
  const publishedCount = products.filter(p => p.published).length

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* No shop yet */}
        {shop === null && (
          <div className="relative text-center py-24 rounded-3xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-indigo-600/5 blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-violet-600/5 blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
                <Store size={28} className="text-zinc-500" />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Open Your Shop</h2>
              <p className="text-zinc-400 mb-7 max-w-sm mx-auto">Create your shop to start listing and selling 3D models to customers worldwide.</p>
              <Link
                href="/dashboard/shop/setup"
                className="btn-glow inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <Plus size={18} />
                Create Shop
              </Link>
              <Link
                href="/dashboard/account"
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mt-4 transition-colors"
              >
                <UserCog size={13} />
                Account settings
              </Link>
            </div>
          </div>
        )}

        {shop && (
          <>
            {/* Shop header */}
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
                </div>
                {shop.description && <p className="text-zinc-400 text-sm mt-1 max-w-lg">{shop.description}</p>}
                <div className="flex items-center gap-4 mt-3">
                  <Link
                    href={`/shop/${shop.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                  >
                    <ExternalLink size={13} />
                    View public shop
                  </Link>
                  <Link
                    href="/dashboard/shop/edit"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                  >
                    <Settings size={13} />
                    Edit shop
                  </Link>
                  <Link
                    href="/dashboard/account"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                  >
                    <UserCog size={13} />
                    Account
                  </Link>
                </div>
              </div>
              <Link
                href="/dashboard/products/new"
                className="btn-glow flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
              >
                <Plus size={15} />
                New Listing
              </Link>
            </div>

            {/* Stripe Connect banner */}
            {connectStatus && !connectStatus.complete && (
              <div className="flex items-center gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-amber-200 font-medium text-sm">Payments not set up</p>
                  <p className="text-amber-400/60 text-xs mt-0.5">
                    Connect Stripe to accept paid orders. Free listings work without this.
                  </p>
                </div>
                <button
                  onClick={handleConnectStripe}
                  disabled={connectLoading}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-900 text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
                >
                  {connectLoading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
                  {connectStatus.connected ? 'Continue Setup' : 'Connect Stripe'}
                </button>
              </div>
            )}
            {connectStatus?.complete && (
              <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-5 py-3.5 mb-6">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-300 text-sm">Stripe connected — payouts enabled.</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="panel-top-accent bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-hidden relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Listings</p>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Package size={13} className="text-indigo-400" />
                  </div>
                </div>
                <p className="text-white text-3xl font-bold tabular-nums">{products.length}</p>
                <p className="text-zinc-600 text-xs mt-1">{publishedCount} published</p>
              </div>
              <div className="panel-top-accent bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-hidden relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Downloads</p>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Download size={13} className="text-indigo-400" />
                  </div>
                </div>
                <p className="text-white text-3xl font-bold tabular-nums">{totalDownloads.toLocaleString()}</p>
                <p className="text-zinc-600 text-xs mt-1">all time</p>
              </div>
              <div className="panel-top-accent bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-hidden relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Published</p>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Eye size={13} className="text-indigo-400" />
                  </div>
                </div>
                <p className="text-white text-3xl font-bold tabular-nums">{publishedCount}</p>
                <p className="text-zinc-600 text-xs mt-1">of {products.length} listings</p>
              </div>
            </div>

            {/* Products list */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-base">Your Listings</h2>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-14 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <Package size={36} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No listings yet.</p>
                <Link href="/dashboard/products/new" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block transition-colors">
                  Create your first listing →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map(p => (
                  <div key={p.id} className={`bg-zinc-900 border rounded-2xl p-4 flex items-center gap-4 transition-colors ${
                    p.published ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/60 opacity-60'
                  }`}>
                    <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-700/50">
                      {p.previewImages[0] ? (
                        <img src={`/api/preview/${p.previewImages[0].path}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg opacity-40">⬡</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-3 text-xs mt-0.5">
                        <span className={`font-semibold ${p.price === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>{formatPrice(p.price, p.currency)}</span>
                        <span className="text-zinc-600">{formatBytes(BigInt(p.fileSize))}</span>
                        <span className="text-zinc-600">{p.purchaseCount} downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => togglePublish(p)}
                        title={p.published ? 'Unpublish' : 'Publish'}
                        className={`p-2 rounded-lg transition-colors ${
                          p.published
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-zinc-600 hover:bg-white/5 hover:text-zinc-400'
                        }`}
                      >
                        {p.published ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="p-2 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deleting === p.id}
                        className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
