// Modlr Discord Bot — maintains persistent online presence
// Uses native WebSocket (Node 22+) with Discord Gateway v10

const GATEWAY = 'wss://gateway.discord.gg/?v=10&encoding=json'

function connect() {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    console.log('[Bot] DISCORD_BOT_TOKEN not set, skipping.')
    return
  }

  console.log('[Bot] Connecting to Discord Gateway...')
  const ws = new WebSocket(GATEWAY)
  let heartbeatTimer = null
  let seq = null
  let sessionId = null
  let resumeUrl = null

  function heartbeat(interval) {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = setInterval(() => {
      ws.send(JSON.stringify({ op: 1, d: seq }))
    }, interval)
  }

  function identify() {
    ws.send(JSON.stringify({
      op: 2,
      d: {
        token,
        intents: 0,
        properties: { os: 'linux', browser: 'modlr-bot', device: 'modlr-bot' },
        presence: { status: 'online', activities: [], afk: false, since: null },
      },
    }))
  }

  ws.addEventListener('open', () => console.log('[Bot] Gateway connected.'))

  ws.addEventListener('message', ({ data }) => {
    const { op, d, s, t } = JSON.parse(data)
    if (s) seq = s

    switch (op) {
      case 10: // Hello
        heartbeat(d.heartbeat_interval)
        if (sessionId && resumeUrl) {
          // Resume existing session
          ws.send(JSON.stringify({ op: 6, d: { token, session_id: sessionId, seq } }))
        } else {
          identify()
        }
        break
      case 0: // Dispatch
        if (t === 'READY') {
          sessionId = d.session_id
          resumeUrl = d.resume_gateway_url
          console.log(`[Bot] Online as ${d.user.username}`)
        }
        break
      case 7: // Reconnect
        ws.close()
        break
      case 9: // Invalid session
        sessionId = null
        resumeUrl = null
        setTimeout(connect, 5000)
        break
    }
  })

  ws.addEventListener('close', ({ code }) => {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    console.log(`[Bot] Disconnected (${code}), reconnecting in 5s...`)
    setTimeout(connect, 5000)
  })

  ws.addEventListener('error', ({ message }) => {
    console.error('[Bot] WebSocket error:', message)
  })
}

connect()
