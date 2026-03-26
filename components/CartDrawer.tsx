'use client'

import { useCart } from '@/lib/cart'
import { X, ShoppingCart, Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/components/ProductCard'
import { useRouter } from 'next/navigation'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, clearCart, total, count } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleCheckout() {
    if (items.length === 0) return
    setCheckingOut(true)
    setError('')
    try {
      const res = await fetch('/api/checkout/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: items.map(i => i.productId) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Checkout failed')
        setCheckingOut(null)
        return
      }
      if (data.url) {
        window.location.href = data.url
      } else if (data.allFree) {
        clearCart()
        onClose()
        router.push('/success?free=1')
      }
    } catch {
      setError('Connection error. Please try again.')
      setCheckingOut(false)
    }
  }

  const currencySymbol = items[0]?.currency === 'usd' ? '$' : '€'

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-indigo-400" />
            <h2 className="text-white font-semibold">Cart</h2>
            {count > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingBag size={40} className="text-zinc-700" />
              <p className="text-zinc-500 text-sm">Your cart is empty</p>
              <button onClick={onClose} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                Browse products
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-20">⬡</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.productId}`}
                    onClick={onClose}
                    className="text-white text-sm font-medium truncate block hover:text-indigo-300 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-zinc-500 text-xs">{item.shopName}</p>
                  <p className={`text-sm font-bold mt-0.5 ${item.price === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {formatPrice(item.price, item.currency)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 p-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Total</span>
              <span className="text-white font-bold text-lg">
                {total === 0 ? 'Free' : `${currencySymbol}${(total / 100).toFixed(2)}`}
              </span>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              {checkingOut ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
              {checkingOut ? 'Redirecting…' : 'Pay with Card'}
            </button>

            {/* Clear cart */}
            <button
              onClick={clearCart}
              disabled={!!checkingOut}
              className="flex items-center justify-center gap-1 w-full text-zinc-600 hover:text-red-400 text-xs transition-colors"
            >
              <Trash2 size={12} />
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
