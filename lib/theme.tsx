'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber' | 'cyan'

export const THEMES: { id: Theme; label: string; hex: string }[] = [
  { id: 'indigo',  label: 'Indigo',  hex: '#4f46e5' },
  { id: 'violet',  label: 'Violet',  hex: '#7c3aed' },
  { id: 'emerald', label: 'Emerald', hex: '#059669' },
  { id: 'rose',    label: 'Rose',    hex: '#e11d48' },
  { id: 'amber',   label: 'Amber',   hex: '#d97706' },
  { id: 'cyan',    label: 'Cyan',    hex: '#0891b2' },
]

const ThemeCtx = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'indigo', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('indigo')

  useEffect(() => {
    const stored = (localStorage.getItem('modlr-theme') ?? 'indigo') as Theme
    if (THEMES.find(t => t.id === stored)) {
      setThemeState(stored)
      document.documentElement.setAttribute('data-theme', stored)
    }
  }, [])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('modlr-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>
}

export function useTheme() { return useContext(ThemeCtx) }
