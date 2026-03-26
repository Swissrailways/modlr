'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Store, Package, DollarSign, Activity, RefreshCw } from 'lucide-react'

interface Stats {
  users: number; shops: number; products: number
  totalRevenue: number; totalSales: number; activeVisitors: number
}
interface Visitors { total: number; byPath: Record<string, number> }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [visitors, setVisitors] = useState<Visitors | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const load = useCallback(async () => {
    const [s, v] = await Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/visitors').then(r => r.json()),
    ])
    setStats(s)
    setVisitors(v)
    setLastUpdated(new Date())
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [load])

  const cards = stats ? [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'indigo' },
    { label: 'Shops', value: stats.shops, icon: Store, color: 'violet' },
    { label: 'Products', value: stats.products, icon: Package, color: 'blue' },
    { label: 'Total Sales', value: stats.totalSales, icon: DollarSign, color: 'emerald' },
  ] : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 text-xs">Updated {lastUpdated.toLocaleTimeString()}</span>
          <button onClick={load} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{label}</p>
              <Icon size={14} className="text-indigo-400" />
            </div>
            <p className="text-white text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Revenue */}
      {stats && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-white text-3xl font-bold">${(stats.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      )}

      {/* Live Visitors */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-white font-semibold text-sm">Live Visitors</h2>
          <span className="ml-auto text-zinc-400 font-bold tabular-nums">{visitors?.total ?? 0}</span>
        </div>
        {visitors && visitors.total > 0 ? (
          <div className="space-y-2">
            {Object.entries(visitors.byPath)
              .sort((a, b) => b[1] - a[1])
              .map(([path, count]) => (
                <div key={path} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-300 text-sm truncate font-mono">{path}</span>
                      <span className="text-zinc-400 text-sm ml-2 flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(count / (visitors.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-zinc-600 text-sm">No active visitors in the last 2 minutes.</p>
        )}
        <p className="text-zinc-700 text-xs mt-3">Refreshes every 30s · Active = visited in last 2 min</p>
      </div>
    </div>
  )
}
