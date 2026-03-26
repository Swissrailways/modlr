import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe, stripeConfigured } from '@/lib/stripe'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({
    where: { userId: user.id },
    select: { id: true, stripeAccountId: true, stripeAccountComplete: true },
  })
  if (!shop) return Response.json({ error: 'No shop' }, { status: 404 })

  const [pending, total] = await Promise.all([
    prisma.sellerEarning.aggregate({
      where: { shopId: shop.id, paid: false },
      _sum: { amount: true },
    }),
    prisma.sellerEarning.aggregate({
      where: { shopId: shop.id },
      _sum: { amount: true },
    }),
  ])

  // Get currency from latest earning
  const latest = await prisma.sellerEarning.findFirst({
    where: { shopId: shop.id },
    orderBy: { createdAt: 'desc' },
    select: { currency: true },
  })

  return Response.json({
    pending: pending._sum.amount ?? 0,
    totalEarned: total._sum.amount ?? 0,
    currency: latest?.currency ?? 'usd',
    connected: !!shop.stripeAccountId,
    payoutsEnabled: shop.stripeAccountComplete,
  })
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
  if (!shop) return Response.json({ error: 'No shop' }, { status: 404 })
  if (!shop.stripeAccountId || !shop.stripeAccountComplete) {
    return Response.json({ error: 'Bank account not connected. Complete Stripe onboarding first.' }, { status: 400 })
  }
  if (!stripeConfigured()) {
    return Response.json({ error: 'Payments not configured' }, { status: 503 })
  }

  const unpaid = await prisma.sellerEarning.findMany({
    where: { shopId: shop.id, paid: false },
  })
  if (unpaid.length === 0) {
    return Response.json({ error: 'No pending earnings to cash out' }, { status: 400 })
  }

  // Group by currency
  const byCurrency: Record<string, { ids: number[]; amount: number }> = {}
  for (const e of unpaid) {
    if (!byCurrency[e.currency]) byCurrency[e.currency] = { ids: [], amount: 0 }
    byCurrency[e.currency].ids.push(e.id)
    byCurrency[e.currency].amount += e.amount
  }

  const stripe = getStripe()
  let totalTransferred = 0

  for (const [currency, { ids, amount }] of Object.entries(byCurrency)) {
    if (amount < 50) continue // below minimum transfer amount

    const transfer = await stripe.transfers.create({
      amount,
      currency,
      destination: shop.stripeAccountId,
      description: `Modlr payout — ${ids.length} sale(s)`,
    })

    await prisma.sellerEarning.updateMany({
      where: { id: { in: ids } },
      data: { paid: true, paidAt: new Date(), stripeTransferId: transfer.id },
    })

    totalTransferred += amount
    console.log(`Payout: shop=${shop.id} amount=${amount} ${currency} transfer=${transfer.id}`)
  }

  if (totalTransferred === 0) {
    return Response.json({ error: 'Balance too low to transfer (minimum 50 cents)' }, { status: 400 })
  }

  return Response.json({ success: true, transferred: totalTransferred })
}
