// PayPal REST API helpers (no SDK needed — pure fetch)

function getPayPalBase() {
  const mode = process.env.PAYPAL_MODE ?? 'sandbox'
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export function paypalConfigured(): boolean {
  const id = process.env.PAYPAL_CLIENT_ID ?? ''
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? ''
  return id.length > 0 && secret.length > 0
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const secret = process.env.PAYPAL_CLIENT_SECRET!
  const base = getPayPalBase()

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

export async function createPayPalOrder(params: {
  amount: number     // in cents
  currency: string
  productName: string
  successUrl: string
  cancelUrl: string
  metadata: Record<string, string>
}) {
  const token = await getAccessToken()
  const base = getPayPalBase()
  const amountValue = (params.amount / 100).toFixed(2)

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: params.currency.toUpperCase(), value: amountValue },
        description: params.productName,
        custom_id: JSON.stringify(params.metadata),
      }],
      application_context: {
        return_url: params.successUrl,
        cancel_url: params.cancelUrl,
        brand_name: 'Modlr',
        user_action: 'PAY_NOW',
      },
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal create order failed: ${err}`)
  }

  const order = await res.json()
  const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href
  return { orderId: order.id as string, approveUrl: approveLink as string }
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken()
  const base = getPayPalBase()

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal capture failed: ${err}`)
  }

  return await res.json()
}
