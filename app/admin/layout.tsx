'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Package, Tag, ShieldCheck, LogOut } from 'lucide-react'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories & Tags', icon: Tag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Skip auth check on setup page
    if (pathname === '/admin/setup') { setChecking(false); return }
    fetch('/api/auth/me').then(async r => {
      if (!r.ok) { router.push('/login'); return }
      // Check admin status
      const res = await fetch('/api/admin/stats')
      if (!res.ok) { router.push('/'); return }
      setChecking(false)
    }).catch(() => router.push('/'))
  }, [pathname, router])

  if (checking && pathname !== '/admin/setup') {
    return <div className="min-h-screen bg-zinc-950" />
  }

  if (pathname === '/admin/setup') return <>{children}</>

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'DELETE' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-zinc-800">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400" />
            Admin
          </span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-zinc-800">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors mb-0.5">
            ← Back to site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
