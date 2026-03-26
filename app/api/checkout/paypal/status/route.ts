import { paypalConfigured } from '@/lib/paypal'

export async function GET() {
  return Response.json({ available: paypalConfigured() })
}
