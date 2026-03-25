'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProductCard, { type ProductItem } from '@/components/ProductCard'
import ShopCard, { type ShopItem } from '@/components/ShopCard'
import { Loader2, PackageOpen, Store, Sparkles, TrendingUp, Search } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

function Marketplace() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'
  const view = searchParams.get('view') ?? 'shops'
  const { t } = useI18n()

  const [shops, setShops] = useState<ShopItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)

  const isSearching = !!q

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (isSearching || view === 'products') {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (sort !== 'newest') params.set('sort', sort)
        const res = await fetch(`/api/products?${params}`)
        if (res.ok) setProducts(await res.json())
      } else {
        const res = await fetch('/api/shops')
        if (res.ok) setShops(await res.json())
      }
    } catch {}
    setLoading(false)
  }, [q, sort, view, isSearching])

  useEffect(() => { fetchData() }, [fetchData])

  function setView(v: string) {
    const p = new URLSearchParams(searchParams)
    p.set('view', v)
    router.push(`/?${p}`)
  }

  function setSort(s: string) {
    const p = new URLSearchParams(searchParams)
    p.set('sort', s)
    router.push(`/?${p}`)
  }

  const showShops = !isSearching && view === 'shops'

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">

        {/* Hero */}
        {!isSearching && (
          <div className="relative text-center mb-12 overflow-hidden rounded-3xl border border-white/[0.06] bg-zinc-900/40 py-16 px-4">
            {/* Dot grid texture */}
            <div className="dot-grid absolute inset-0 pointer-events-none" />
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="animate-float absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-600/12 blur-3xl" />
              <div className="animate-float-slow absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-violet-600/12 blur-3xl" />
              <div className="animate-float absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-600/7 blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-indigo-600/15 border border-indigo-500/25 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide shadow-lg shadow-indigo-500/10">
                <Sparkles size={11} />
                {t.home.badge}
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight leading-[1.08]">
                {t.home.title1}
                <br />
                <span className="gradient-text">{t.home.title2}</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
                {t.home.subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <div className="glass-pill">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {t.home.freeModels}
                </div>
                <div className="glass-pill">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                  {t.home.instantDl}
                </div>
                <div className="glass-pill">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                  {t.home.secure}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search results header */}
        {isSearching && (
          <div className="flex items-center gap-3 mb-6">
            <Search size={18} className="text-zinc-500 flex-shrink-0" />
            <h2 className="text-white font-semibold text-xl">
              {t.home.resultsFor} <span className="text-indigo-300">&ldquo;{q}&rdquo;</span>
              <span className="text-zinc-500 font-normal text-base ml-3">{t.home.productsCount(products.length)}</span>
            </h2>
          </div>
        )}

        {/* View toggle + sort */}
        {!isSearching && (
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setView('shops')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showShops
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Store size={14} />
                {t.home.tabShops}
              </button>
              <button
                onClick={() => setView('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !showShops
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <TrendingUp size={14} />
                {t.home.tabProducts}
              </button>
            </div>

            {!showShops && (
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60 cursor-pointer"
              >
                <option value="newest">{t.home.sortNewest}</option>
                <option value="price_asc">{t.home.sortPriceAsc}</option>
                <option value="price_desc">{t.home.sortPriceDesc}</option>
              </select>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader2 size={28} className="text-indigo-400 animate-spin" />
            <p className="text-zinc-600 text-sm">Loading...</p>
          </div>

        /* Shops view */
        ) : showShops ? (
          shops.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Store size={28} className="text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-lg font-medium">{t.home.noShops}</p>
              <p className="text-zinc-600 text-sm mt-1">{t.home.noShopsHint}</p>
            </div>
          ) : (
            <div>
              <p className="text-zinc-600 text-sm mb-5">{t.home.shopsCount(shops.length)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
              </div>
            </div>
          )

        /* Products view / search results */
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <PackageOpen size={28} className="text-zinc-600" />
            </div>
            <p className="text-zinc-400 text-lg font-medium">
              {q ? t.home.noResults : t.home.noProducts}
            </p>
          </div>
        ) : (
          <div>
            {!isSearching && (
              <p className="text-zinc-600 text-sm mb-5">{t.home.productsCount(products.length)}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} Modlr</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <Marketplace />
    </Suspense>
  )
}
