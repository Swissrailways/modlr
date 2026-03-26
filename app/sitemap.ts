import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://modlr-production.up.railway.app'

  const [products, shops] = await Promise.all([
    prisma.product.findMany({ select: { id: true } }),
    prisma.shop.findMany({ select: { slug: true } }),
  ])

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...shops.map(s => ({
      url: `${base}/shop/${s.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map(p => ({
      url: `${base}/product/${p.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
