const DISCORD_API = 'https://discord.com/api/v10'

export async function sendDiscordDM(discordUserId: string, content: string): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    console.log('[Discord] No bot token configured, DM not sent')
    return false
  }

  try {
    // Open DM channel
    const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: 'POST',
      headers: { 'Authorization': `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: discordUserId }),
      signal: AbortSignal.timeout(10000),
    })
    if (!dmRes.ok) {
      console.error('[Discord] Failed to open DM channel:', await dmRes.text())
      return false
    }
    const { id: channelId } = await dmRes.json()

    // Send message
    const msgRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(10000),
    })
    if (!msgRes.ok) {
      console.error('[Discord] Failed to send DM:', await msgRes.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[Discord] DM error:', err)
    return false
  }
}

export async function exchangeDiscordCode(code: string, redirectUri: string) {
  const clientId = process.env.DISCORD_CLIENT_ID!
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) throw new Error(`Discord token exchange failed: ${await res.text()}`)
  return res.json() as Promise<{ access_token: string; token_type: string }>
}

export async function getDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch Discord user')
  return res.json() as Promise<{
    id: string
    username: string
    global_name: string | null
    email: string | null
    verified: boolean
    avatar: string | null
  }>
}
