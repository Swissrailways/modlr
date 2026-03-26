'use client'

import { ThemeProvider } from '@/lib/theme'
import { I18nProvider } from '@/lib/i18n'
import { CartProvider } from '@/lib/cart'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
