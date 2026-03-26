#!/bin/sh
set -e

# Keep the bot alive forever in background — restarts automatically if it crashes
bot_supervisor() {
  while true; do
    echo "[Supervisor] Starting Discord bot..."
    node bot.js || true
    echo "[Supervisor] Bot exited, restarting in 5s..."
    sleep 5
  done
}

bot_supervisor &

# Apply any pending DB schema changes
echo "[Start] Running prisma db push..."
npx prisma db push --accept-data-loss 2>&1 || true

# Start the Next.js server in the foreground (Railway monitors this)
echo "[Start] Starting Next.js server..."
exec node .next/standalone/server.js
