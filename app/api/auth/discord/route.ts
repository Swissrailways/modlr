import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID
  if (!clientId) return Response.json({ error: 'Discord OAuth not configured' }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get('host')}`
  const redirectUri = `${baseUrl}/api/auth/discord/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
  })

  return Response.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
}
