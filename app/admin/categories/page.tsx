'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'

interface Category { id: number; name: string; slug: string; _count: { products: number } }
interface Tag { id: number; name: string; _count: { products: number } }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [newCat, setNewCat] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories)
    fetch('/api/admin/tags').then(r => r.json()).then(setTags)
  }, [])

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCat.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.trim() }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories(prev => [...prev, { ...cat, _count: { products: 0 } }])
      setNewCat('')
    }
    setAdding(false)
  }

  async function deleteCategory(id: number) {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  async function deleteTag(id: number) {
    if (!confirm('Delete this tag?')) return
    await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
    setTags(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="p-6 space-y-8">
      {/* Categories */}
      <div>
        <h1 className="text-xl font-bold text-white mb-4">Categories</h1>
        <form onSubmit={addCategory} className="flex gap-2 mb-4">
          <input
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            placeholder="New category name..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-indigo-500/60"
          />
          <button
            type="submit"
            disabled={adding || !newCat.trim()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </form>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {categories.length === 0 ? (
            <p className="text-zinc-600 text-sm p-4">No categories yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Products</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3 text-zinc-400">{c._count.products}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteCategory(c.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Tags <span className="text-zinc-600 font-normal text-base ml-1">{tags.length}</span></h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {tags.length === 0 ? (
            <p className="text-zinc-600 text-sm p-4">No tags yet. Tags are created by sellers when uploading products.</p>
          ) : (
            <div className="p-4 flex flex-wrap gap-2">
              {tags.map(t => (
                <div key={t.id} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm">
                  <span className="text-zinc-300">{t.name}</span>
                  <span className="text-zinc-600 text-xs">({t._count.products})</span>
                  <button onClick={() => deleteTag(t.id)} className="text-zinc-600 hover:text-red-400 transition-colors ml-1">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
