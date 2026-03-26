'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CartItem {
  productId: number
  name: string
  price: number
  currency: string
  shopName: string
  imageUrl?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  isInCart: (productId: number) => boolean
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('modlr_cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('modlr_cart', JSON.stringify(items))
  }, [items])

  function addItem(item: CartItem) {
    setItems(prev => {
      if (prev.find(i => i.productId === item.productId)) return prev
      return [...prev, item]
    })
  }

  function removeItem(productId: number) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  function clearCart() {
    setItems([])
  }

  function isInCart(productId: number) {
    return items.some(i => i.productId === productId)
  }

  const total = items.reduce((sum, i) => sum + i.price, 0)
  const count = items.length

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
