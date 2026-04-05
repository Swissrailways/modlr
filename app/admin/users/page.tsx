'use client'

import { useEffect, useState } from 'react'
import { Trash2, ShieldCheck, ShieldOff, CheckCircle, XCircle, KeyRound, MessageSquare, Store } from 'lucide-react'

interface User {
  id: number; email: string | null; username: string; isAdmin: boolean
  emailVerified: boolean; createdAt: string
  discordId: string | null; discordUsername: string | null; discordAvatar: string | null
  _count: { purchases: number }
  shop: { id: number; name: string; slug: string; _count: { products: number } } | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [deletingShop, setDeletingShop] = useState<number | null>(null)
  const [resetting, setResetting] = useState<number | null>(null)
  const [resetMsg, setResetMsg] = useState<{ id: number; ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This removes their shop and all products.`)) return
    setDeleting(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? `Delete failed (${res.status})`)
    }
    setDeleting(null)
  }

  async function handleDeleteShop(user: User) {
    if (!user.shop) return
    if (!confirm(`Delete shop "${user.shop.name}" and all its products? The user account will remain.`)) return
    setDeletingShop(user.shop.id)
    const res = await fetch(`/api/admin/shops/${user.shop.id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, shop: null } : u))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? `Delete failed (${res.status})`)
    }
    setDeletingShop(null)
  }

  async function toggleAdmin(user: User) {
    const newValue = !user.isAdmin
    if (!confirm(`${newValue ? 'Grant admin to' : 'Remove admin from'} "${user.username}"?`)) return
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: newValue }),
    })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isAdmin: newValue } : u))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Failed to update admin status')
    }
  }

  async function handleResetPassword(user: User) {
    if (!confirm(`Send a password reset to "${user.username}"${user.discordId ? ' via Discord DM' : ' via email'}?`)) return
    setResetting(user.id)
    setResetMsg(null)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: 'POST' })
      const data = await res.json()
      setResetMsg({
        id: user.id,
        ok: res.ok,
        text: res.ok
          ? `Reset link sent${user.discordId ? ' via Discord DM' : ' via email'}.`
          : data.error ?? 'Failed to send reset.',
      })
    } catch {
      setResetMsg({ id: user.id, ok: false, text: 'Connection error.' })
    }
    setResetting(null)
    setTimeout(() => setResetMsg(null), 5000)
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Users <span className="text-zinc-600 font-normal text-base ml-1">{users.length}</span></h1>

      {resetMsg && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm border ${resetMsg.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {resetMsg.text}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Discord</th>
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
                    <p className="text-zinc-500 text-xs">{user.email ?? <span className="text-zinc-700">no email</span>}</p>
                    {user.isAdmin && <span className="inline-flex items-center gap-1 text-indigo-400 text-xs mt-0.5"><ShieldCheck size={10} /> Admin</span>}
                  </td>
                  <td className="px-4 py-3">
                    {user.discordId ? (
                      <div className="flex items-center gap-2">
                        {user.discordAvatar && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.discordAvatar} alt="" className="w-6 h-6 rounded-full" />
                        )}
                        <div>
                          <p className="text-zinc-300 text-xs">{user.discordUsername ?? '—'}</p>
                          <p className="text-zinc-600 text-xs font-mono">{user.discordId}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-700 text-xs">Not connected</span>
                    )}
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
                      {user.shop && (
                        <button
                          onClick={() => handleDeleteShop(user)}
                          disabled={deletingShop === user.shop?.id}
                          title="Delete shop"
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-orange-400 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                        >
                          <Store size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleResetPassword(user)}
                        disabled={resetting === user.id || (!user.discordId && !user.email)}
                        title={user.discordId ? 'Send password reset via Discord DM' : user.email ? 'Send password reset via email' : 'No contact method'}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {user.discordId ? <MessageSquare size={14} /> : <KeyRound size={14} />}
                      </button>
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
