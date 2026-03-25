'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tag, Download } from 'lucide-react'
import { formatBytes } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export interface ProductItem {
  id: number
  name: string
  description?: string | null
  price: number
  currency: string
  fileName: string
  fileSize: string
  mimeType: string
  shop: { id: number; name: string; slug: string }
  category?: { id: number; name: string; slug: string } | null
  tags: string[]
  previewImages: { id: number; path: string; url: string; order: number }[]
  purchaseCount: number
  createdAt: string
}

export function formatPrice(price: number, currency = 'usd') {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price / 100)
}

export default function ProductCard({ product }: { product: ProductItem }) {
  const router = useRouter()
  const { t } = useI18n()
  const hasPreview = product.previewImages.length > 0
  const isFree = product.price === 0

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden card-glow card-shine hover:-translate-y-1">

        {/* Preview image */}
        <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
          {hasPreview ? (
            <img
              src={product.previewImages[0].url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
              draggable={false}
              onContextMenu={e => e.preventDefault()}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <span className="text-5xl opacity-30 select-none">⬡</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Transparent shield — blocks right-click save and drag */}
          <div className="absolute inset-0 z-10" onContextMenu={e => e.preventDefault()} />

          {/* Price badge */}
          <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm border shadow-lg ${
            isFree
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/20'
              : 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30 shadow-indigo-500/20'
          }`}>
            {isFree ? t.product.free : formatPrice(product.price, product.currency)}
          </div>

          {/* Category badge */}
          {product.category && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-xs font-medium bg-black/50 text-zinc-400 backdrop-blur-sm border border-white/[0.08]">
              {product.category.name}
            </div>
          )}
        </div>

        <div className="p-3.5">
          <h3 className="text-white font-semibold text-sm truncate leading-snug group-hover:text-indigo-300 transition-colors duration-150">
            {product.name}
          </h3>
          <button
            className="text-zinc-500 text-xs mt-0.5 hover:text-indigo-400 transition-colors text-left w-full truncate"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/shop/${product.shop.slug}`) }}
          >
            {t.product.by} {product.shop.name}
          </button>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {product.tags.slice(0, 2).map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md text-xs border border-zinc-700/50">
                  <Tag size={8} />
                  {tag}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="text-zinc-600 text-xs py-0.5">+{product.tags.length - 2}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-600">
            <span className="font-mono">{formatBytes(BigInt(product.fileSize))}</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Download size={10} />
              {product.purchaseCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
