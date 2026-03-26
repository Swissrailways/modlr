'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, LogOut, LayoutDashboard, BookOpen, User, Settings, ShoppingCart } from 'lucide-react'
import { useState, useEffect, useRef, Suspense } from 'react'
import { ModlrWordmark } from '@/components/ModlrLogo'
import PreferencesMenu from '@/components/PreferencesMenu'
import { useI18n } from '@/lib/i18n'
import { useCart } from '@/lib/cart'
import CartDrawer from '@/components/CartDrawer'

interface NavUser {
  id: number
  username: string
  email: string
}

function NavbarInner() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<NavUser | null | undefined>(undefined)
  const { t } = useI18n()
  const [profileOpen, setProfileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { count: cartCount } = useCart()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'DELETE' })
    setUser(null)
    router.push('/')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/')
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="mr-2 flex-shrink-0 group">
          <ModlrWordmark height={30} />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.nav.search}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 ml-auto">
          <PreferencesMenu />

          {user === undefined ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard')
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <LayoutDashboard size={15} />
                <span className="hidden sm:inline">{t.nav.dashboard}</span>
              </Link>
              <Link
                href="/library"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/library'
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <BookOpen size={15} />
                <span className="hidden sm:inline">{t.nav.library}</span>
              </Link>

              <div ref={profileRef} className="relative ml-1 pl-3 border-l border-zinc-800">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="hidden md:inline text-sm text-zinc-300 font-medium">{user.username}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/40 py-1 z-50">
                    <Link
                      href="/dashboard/account"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <Settings size={14} className="text-zinc-500" />
                      Account settings
                    </Link>
                    <div className="my-1 border-t border-zinc-800" />
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout() }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                    >
                      <LogOut size={14} />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
              >
                {t.nav.signup}
              </Link>
            </>
          )}

          {/* Cart button — always visible */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>

    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="sticky top-0 z-40 h-14 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl" />
    }>
      <NavbarInner />
    </Suspense>
  )
}
