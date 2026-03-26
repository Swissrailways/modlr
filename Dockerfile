FROM node:24-slim

RUN apt-get update && apt-get install -y \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

# Placeholder so lib/db.ts takes the postgres branch during build.
# Railway overrides DATABASE_URL at runtime with the real connection string.
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost/placeholder
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Copy static/public assets into standalone output
RUN cp -r .next/static .next/standalone/.next/static
RUN if [ -d "public" ]; then cp -r public .next/standalone/public; fi

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "npx prisma db push && node .next/standalone/server.js"]
