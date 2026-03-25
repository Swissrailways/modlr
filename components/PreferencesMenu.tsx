'use client'

import { useRef, useState, useEffect } from 'react'
import { Settings2, Check } from 'lucide-react'
import { useTheme, THEMES } from '@/lib/theme'
import { useI18n, LOCALES } from '@/lib/i18n'

export default function PreferencesMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useI18n()

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`p-2 rounded-lg transition-colors ${
          open
            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
            : 'text-zinc-500 hover:text-white hover:bg-white/[0.05]'
        }`}
        title={t.prefs.appearance}
      >
        <Settings2 size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">

          {/* Theme section */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
              {t.prefs.theme}
            </p>
            <div className="grid grid-cols-6 gap-2">
              {THEMES.map(th => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  title={th.label}
                  className="group relative w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: th.hex }}
                >
                  {theme === th.id && (
                    <Check
                      size={12}
                      className="absolute inset-0 m-auto text-white drop-shadow"
                      strokeWidth={3}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <p className="text-zinc-400 text-xs">
                {THEMES.find(th => th.id === theme)?.label}
              </p>
            </div>
          </div>

          <div className="h-px bg-zinc-800 mx-4" />

          {/* Language section */}
          <div className="px-4 pt-3 pb-4">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
              {t.prefs.language}
            </p>
            <div className="space-y-0.5">
              {LOCALES.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => { setLocale(loc.id); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
                    locale === loc.id
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-base leading-none">{loc.flag}</span>
                  <span className="flex-1">{loc.label}</span>
                  {locale === loc.id && <Check size={12} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
