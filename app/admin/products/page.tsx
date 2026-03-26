'use client'

import { useEffect, useState } from 'react'
import { Trash2, ExternalLink } from 'lucide-react'
import { formatPrice } from '@/components/ProductCard'

interface Product {
  id: number; name: string; price: number; currency: string
  published: boolean; createdAt: string
  shop: { name: string; slug: string }
  category: { name: string } | null
  _count: { purchases: number }
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/products').then(r => r.json()).then(setProducts).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? `Delete failed (${res.status})`)
    }
    setDeleting(null)
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Products <span className="text-zinc-600 font-normal text-base ml-1">{products.length}</span></h1>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Shop</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Price</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Sales</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{p.name}</p>
                    {p.category && <p className="text-zinc-600 text-xs">{p.category.name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/shop/${p.shop.slug}`} target="_blank" className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
                      {p.shop.name} <ExternalLink size={10} />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{formatPrice(p.price, p.currency)}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{p._count.purchases}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {p.published ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
