FROM node:24-slim

RUN apt-get update && apt-get install -y \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

# Placeholder so lib/db.ts takes the postgres branch (not sqlite) during build.
# Railway overrides DATABASE_URL at runtime with the real connection string.
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost/placeholder

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push && npm start"]
