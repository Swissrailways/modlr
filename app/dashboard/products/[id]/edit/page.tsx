'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Loader2 } from 'lucide-react'

interface Category { id: number; name: string }

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [productId, setProductId] = useState<string>('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [tags, setTags] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [published, setPublished] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id)
      Promise.all([
        fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null),
        fetch('/api/categories').then(r => r.ok ? r.json() : []),
      ]).then(([product, cats]) => {
        if (!product) { router.push('/dashboard'); return }
        setName(product.name)
        setDescription(product.description ?? '')
        setPrice(product.price > 0 ? (product.price / 100).toFixed(2) : '')
        setTags(product.tags.join(', '))
        setCategoryId(product.category?.id?.toString() ?? '')
        setPublished(product.published)
        setCategories(cats)
        setFetching(false)
      }).catch(() => router.push('/dashboard'))
    })
  }, [params, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const priceInCents = Math.round(parseFloat(price || '0') * 100)
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        price: priceInCents,
        tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        categoryId: categoryId ? parseInt(categoryId) : null,
        published,
      }),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      setSaving(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 size={24} className="text-indigo-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Listing</h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
                  placeholder="0.00"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setPublished(p => !p)}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center ${published ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${published ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-zinc-300">Published</span>
              </label>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => router.back()}
                className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
