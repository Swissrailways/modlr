'use client'

import Link from 'next/link'
import { Store, Package, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export interface ShopItem {
  id: number
  name: string
  slug: string
  description?: string | null
  owner: string
  productCount: number
  previews: string[]
  createdAt: string
}

function shopGradient(name: string) {
  const gradients = [
    'from-indigo-600/40 to-purple-700/40',
    'from-blue-600/40 to-cyan-700/40',
    'from-emerald-600/40 to-teal-700/40',
    'from-rose-600/40 to-pink-700/40',
    'from-amber-600/40 to-orange-700/40',
    'from-violet-600/40 to-fuchsia-700/40',
    'from-sky-600/40 to-indigo-700/40',
    'from-green-600/40 to-emerald-700/40',
  ]
  const solid = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-fuchsia-600',
    'from-sky-500 to-indigo-600',
    'from-green-500 to-emerald-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const idx = Math.abs(hash) % gradients.length
  return { bg: gradients[idx], icon: solid[idx] }
}

export default function ShopCard({ shop }: { shop: ShopItem }) {
  const { bg, icon } = shopGradient(shop.name)
  const { t } = useI18n()
  const hasPreviews = shop.previews.length > 0

  return (
    <Link href={`/shop/${shop.slug}`} className="group block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden card-glow card-shine hover:-translate-y-1">

        {/* Banner */}
        <div className={`h-36 bg-gradient-to-br ${bg} relative overflow-hidden`}>
          {hasPreviews && (
            <div className={`absolute inset-0 grid gap-0.5 opacity-50 ${
              shop.previews.length === 1 ? 'grid-cols-1' :
              shop.previews.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {shop.previews.slice(0, 3).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ))}
            </div>
          )}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/30 via-transparent to-transparent" />

          {/* Listing count badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/[0.1]">
            <Package size={10} />
            {t.shop.listings(shop.productCount)}
          </div>
        </div>

        {/* Shop info */}
        <div className="px-4 pb-4">
          <div className="flex items-start gap-3 -mt-5">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${icon} flex items-center justify-center flex-shrink-0 border-2 border-zinc-900 shadow-lg relative z-10`}>
              <Store size={17} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-6">
              <h3 className="text-white font-semibold text-sm truncate group-hover:text-indigo-300 transition-colors">
                {shop.name}
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5">by @{shop.owner}</p>
            </div>
          </div>

          {shop.description && (
            <p className="text-zinc-400 text-xs mt-3 line-clamp-2 leading-relaxed">
              {shop.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/80">
            <span className="text-zinc-600 text-xs">{t.shop.models(shop.productCount)}</span>
            <span className="flex items-center gap-1 text-indigo-400 text-xs font-medium group-hover:text-indigo-300 transition-colors">
              {t.shop.browse}
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
