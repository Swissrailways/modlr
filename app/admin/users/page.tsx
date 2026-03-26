'use client'

import { useEffect, useState } from 'react'
import { Trash2, ShieldCheck, ShieldOff, Store, CheckCircle, XCircle } from 'lucide-react'

interface User {
  id: number; email: string; username: string; isAdmin: boolean
  emailVerified: boolean; createdAt: string
  _count: { purchases: number }
  shop: { name: string; slug: string; _count: { products: number } } | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This removes their shop and all products.`)) return
    setDeleting(id)
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleting(null)
  }

  async function toggleAdmin(user: User) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    })
    if (res.ok) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u))
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Users <span className="text-zinc-600 font-normal text-base ml-1">{users.length}</span></h1>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Shop</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Verified</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-zinc-500 text-xs">{user.email}</p>
                    {user.isAdmin && <span className="inline-flex items-center gap-1 text-indigo-400 text-xs mt-0.5"><ShieldCheck size={10} /> Admin</span>}
                  </td>
                  <td className="px-4 py-3">
                    {user.shop ? (
                      <div>
                        <p className="text-zinc-300 text-xs">{user.shop.name}</p>
                        <p className="text-zinc-600 text-xs">{user.shop._count.products} products</p>
                      </div>
                    ) : (
                      <span className="text-zinc-700 text-xs">No shop</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.emailVerified
                      ? <CheckCircle size={14} className="text-emerald-400" />
                      : <XCircle size={14} className="text-zinc-600" />}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => toggleAdmin(user)}
                        title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                        className={`p-1.5 rounded-lg transition-colors ${user.isAdmin ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10'}`}
                      >
                        {user.isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        disabled={deleting === user.id}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
