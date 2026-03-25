'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Locale = 'en' | 'fr' | 'de' | 'es' | 'nl'

export const LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: 'en', label: 'English',    flag: '🇬🇧' },
  { id: 'fr', label: 'Français',   flag: '🇫🇷' },
  { id: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { id: 'es', label: 'Español',    flag: '🇪🇸' },
  { id: 'nl', label: 'Nederlands', flag: '🇳🇱' },
]

// ─── Translation definitions ──────────────────────────────────────────────────

const dict = {
  en: {
    nav: {
      search: 'Search models, shops...',
      dashboard: 'Dashboard',
      library: 'Library',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
    },
    home: {
      badge: 'The 3D Model Marketplace',
      title1: 'Shop, Sell & Build',
      title2: 'on Modlr',
      subtitle: 'Discover shops from independent creators. Free and premium 3D models for games, animation, VR and more.',
      freeModels: 'Free models available',
      instantDl: 'Instant download',
      secure: 'Secure payments',
      tabShops: 'Shops',
      tabProducts: 'All Products',
      sortNewest: 'Newest',
      sortPriceAsc: 'Price: Low → High',
      sortPriceDesc: 'Price: High → Low',
      shopsCount: (n: number) => `${n} ${n === 1 ? 'shop' : 'shops'} available`,
      productsCount: (n: number) => `${n} ${n === 1 ? 'product' : 'products'}`,
      noShops: 'No shops yet',
      noShopsHint: 'Be the first to open a shop!',
      noProducts: 'No products listed yet.',
      noResults: 'No products match your search.',
      resultsFor: 'Results for',
    },
    product: {
      by: 'by',
      free: 'Free',
    },
    shop: {
      models: (n: number) => n === 0 ? 'No listings yet' : `${n} ${n === 1 ? 'model' : 'models'}`,
      listings: (n: number) => `${n} ${n === 1 ? 'listing' : 'listings'}`,
      browse: 'Browse',
    },
    prefs: {
      appearance: 'Appearance',
      theme: 'Theme',
      language: 'Language',
    },
  },

  fr: {
    nav: {
      search: 'Rechercher modèles, boutiques...',
      dashboard: 'Tableau de bord',
      library: 'Bibliothèque',
      login: 'Connexion',
      signup: "S'inscrire",
      logout: 'Déconnexion',
    },
    home: {
      badge: 'La marketplace de modèles 3D',
      title1: 'Achetez, vendez & créez',
      title2: 'sur Modlr',
      subtitle: 'Découvrez des boutiques de créateurs indépendants. Modèles 3D gratuits et premium pour jeux, animation, VR et plus.',
      freeModels: 'Modèles gratuits disponibles',
      instantDl: 'Téléchargement instantané',
      secure: 'Paiements sécurisés',
      tabShops: 'Boutiques',
      tabProducts: 'Tous les produits',
      sortNewest: 'Plus récents',
      sortPriceAsc: 'Prix : croissant',
      sortPriceDesc: 'Prix : décroissant',
      shopsCount: (n: number) => `${n} boutique${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''}`,
      productsCount: (n: number) => `${n} produit${n > 1 ? 's' : ''}`,
      noShops: 'Aucune boutique',
      noShopsHint: 'Soyez le premier à ouvrir une boutique !',
      noProducts: 'Aucun produit listé.',
      noResults: 'Aucun produit ne correspond à votre recherche.',
      resultsFor: 'Résultats pour',
    },
    product: {
      by: 'par',
      free: 'Gratuit',
    },
    shop: {
      models: (n: number) => n === 0 ? 'Aucun article' : `${n} modèle${n > 1 ? 's' : ''}`,
      listings: (n: number) => `${n} article${n > 1 ? 's' : ''}`,
      browse: 'Voir',
    },
    prefs: {
      appearance: 'Apparence',
      theme: 'Thème',
      language: 'Langue',
    },
  },

  de: {
    nav: {
      search: 'Modelle, Shops suchen...',
      dashboard: 'Dashboard',
      library: 'Bibliothek',
      login: 'Anmelden',
      signup: 'Registrieren',
      logout: 'Abmelden',
    },
    home: {
      badge: 'Der 3D-Modell-Marktplatz',
      title1: 'Kaufen, verkaufen & erstellen',
      title2: 'auf Modlr',
      subtitle: 'Entdecke Shops von unabhängigen Kreativen. Kostenlose und Premium 3D-Modelle für Spiele, Animation, VR und mehr.',
      freeModels: 'Kostenlose Modelle verfügbar',
      instantDl: 'Sofort-Download',
      secure: 'Sichere Zahlungen',
      tabShops: 'Shops',
      tabProducts: 'Alle Produkte',
      sortNewest: 'Neueste',
      sortPriceAsc: 'Preis: aufsteigend',
      sortPriceDesc: 'Preis: absteigend',
      shopsCount: (n: number) => `${n} ${n === 1 ? 'Shop' : 'Shops'} verfügbar`,
      productsCount: (n: number) => `${n} ${n === 1 ? 'Produkt' : 'Produkte'}`,
      noShops: 'Noch keine Shops',
      noShopsHint: 'Eröffne als Erster einen Shop!',
      noProducts: 'Noch keine Produkte.',
      noResults: 'Keine Produkte gefunden.',
      resultsFor: 'Ergebnisse für',
    },
    product: {
      by: 'von',
      free: 'Kostenlos',
    },
    shop: {
      models: (n: number) => n === 0 ? 'Keine Einträge' : `${n} ${n === 1 ? 'Modell' : 'Modelle'}`,
      listings: (n: number) => `${n} ${n === 1 ? 'Eintrag' : 'Einträge'}`,
      browse: 'Ansehen',
    },
    prefs: {
      appearance: 'Darstellung',
      theme: 'Thema',
      language: 'Sprache',
    },
  },

  es: {
    nav: {
      search: 'Buscar modelos, tiendas...',
      dashboard: 'Panel',
      library: 'Biblioteca',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      logout: 'Cerrar sesión',
    },
    home: {
      badge: 'El marketplace de modelos 3D',
      title1: 'Compra, vende y crea',
      title2: 'en Modlr',
      subtitle: 'Descubre tiendas de creadores independientes. Modelos 3D gratuitos y premium para juegos, animación, VR y más.',
      freeModels: 'Modelos gratuitos disponibles',
      instantDl: 'Descarga instantánea',
      secure: 'Pagos seguros',
      tabShops: 'Tiendas',
      tabProducts: 'Todos los productos',
      sortNewest: 'Más recientes',
      sortPriceAsc: 'Precio: menor a mayor',
      sortPriceDesc: 'Precio: mayor a menor',
      shopsCount: (n: number) => `${n} ${n === 1 ? 'tienda disponible' : 'tiendas disponibles'}`,
      productsCount: (n: number) => `${n} ${n === 1 ? 'producto' : 'productos'}`,
      noShops: 'Sin tiendas aún',
      noShopsHint: '¡Sé el primero en abrir una tienda!',
      noProducts: 'Sin productos listados.',
      noResults: 'No se encontraron productos.',
      resultsFor: 'Resultados para',
    },
    product: {
      by: 'por',
      free: 'Gratis',
    },
    shop: {
      models: (n: number) => n === 0 ? 'Sin artículos' : `${n} ${n === 1 ? 'modelo' : 'modelos'}`,
      listings: (n: number) => `${n} ${n === 1 ? 'artículo' : 'artículos'}`,
      browse: 'Ver',
    },
    prefs: {
      appearance: 'Apariencia',
      theme: 'Tema',
      language: 'Idioma',
    },
  },

  nl: {
    nav: {
      search: 'Zoek modellen, shops...',
      dashboard: 'Dashboard',
      library: 'Bibliotheek',
      login: 'Inloggen',
      signup: 'Registreren',
      logout: 'Uitloggen',
    },
    home: {
      badge: 'De 3D-model marktplaats',
      title1: 'Koop, verkoop & bouw',
      title2: 'op Modlr',
      subtitle: 'Ontdek shops van onafhankelijke makers. Gratis en premium 3D-modellen voor games, animatie, VR en meer.',
      freeModels: 'Gratis modellen beschikbaar',
      instantDl: 'Direct downloaden',
      secure: 'Veilige betalingen',
      tabShops: 'Shops',
      tabProducts: 'Alle producten',
      sortNewest: 'Nieuwste',
      sortPriceAsc: 'Prijs: laag → hoog',
      sortPriceDesc: 'Prijs: hoog → laag',
      shopsCount: (n: number) => `${n} ${n === 1 ? 'shop' : 'shops'} beschikbaar`,
      productsCount: (n: number) => `${n} ${n === 1 ? 'product' : 'producten'}`,
      noShops: 'Nog geen shops',
      noShopsHint: 'Wees de eerste die een shop opent!',
      noProducts: 'Nog geen producten.',
      noResults: 'Geen producten gevonden.',
      resultsFor: 'Resultaten voor',
    },
    product: {
      by: 'door',
      free: 'Gratis',
    },
    shop: {
      models: (n: number) => n === 0 ? 'Geen items' : `${n} ${n === 1 ? 'model' : 'modellen'}`,
      listings: (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`,
      browse: 'Bekijken',
    },
    prefs: {
      appearance: 'Weergave',
      theme: 'Thema',
      language: 'Taal',
    },
  },
}

export type Translations = typeof dict['en']

// ─── Context ──────────────────────────────────────────────────────────────────

const I18nCtx = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: Translations
}>({ locale: 'en', setLocale: () => {}, t: dict.en })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = (localStorage.getItem('modlr-lang') ?? 'en') as Locale
    if (dict[stored]) setLocaleState(stored)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('modlr-lang', l)
  }

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t: dict[locale] }}>
      {children}
    </I18nCtx.Provider>
  )
}

export function useI18n() { return useContext(I18nCtx) }
