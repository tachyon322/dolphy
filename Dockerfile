# dolphy/web — Bun installs the lockfile; Node builds and runs the application.

# ---------- deps (lockfile-accurate, fast) ----------
FROM oven/bun:1.3.14 AS deps
WORKDIR /app
COPY package.json bun.lock ./
# Cache mount: bun downloads survive rebuilds instead of re-filling layers.
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# Production dependencies are resolved with Bun but executed by Node.
FROM oven/bun:1.3.14 AS production-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --production --frozen-lockfile

# ---------- build (Node >= 22.13) ----------
FROM node:22.13-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are baked into the client bundle at build time.
# Change them only via --build-arg (or compose build.args) + rebuild.
ARG NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
ARG NEXT_PUBLIC_SOLANA_NETWORK=devnet
ARG NEXT_PUBLIC_TREASURY_WALLET=
ARG NEXT_PUBLIC_TOKEN_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
ARG NEXT_PUBLIC_TOKEN_DECIMALS=6
ARG NEXT_PUBLIC_TOKEN_DISCOUNT_PERCENT=15
ARG NEXT_PUBLIC_SKIP_VERIFY=false
ARG NEXT_PUBLIC_PRIVY_APP_ID=
ENV NEXT_PUBLIC_RPC_URL=$NEXT_PUBLIC_RPC_URL \
    NEXT_PUBLIC_SOLANA_NETWORK=$NEXT_PUBLIC_SOLANA_NETWORK \
    NEXT_PUBLIC_TREASURY_WALLET=$NEXT_PUBLIC_TREASURY_WALLET \
    NEXT_PUBLIC_TOKEN_MINT=$NEXT_PUBLIC_TOKEN_MINT \
    NEXT_PUBLIC_TOKEN_DECIMALS=$NEXT_PUBLIC_TOKEN_DECIMALS \
    NEXT_PUBLIC_TOKEN_DISCOUNT_PERCENT=$NEXT_PUBLIC_TOKEN_DISCOUNT_PERCENT \
    NEXT_PUBLIC_SKIP_VERIFY=$NEXT_PUBLIC_SKIP_VERIFY \
    NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID

RUN ./node_modules/.bin/next build

# ---------- run (Node >= 22.13) ----------
FROM node:22.13-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/app/data/dolphy.db

COPY --chown=node:node package.json bun.lock next.config.ts ./
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next

# chown only the writable dir. Never `chown -R` /app: that forks a duplicate
# layer of the whole app (~2GB, +30min build) just to flip ownership bits.
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

VOLUME /app/data
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/gpus').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "./node_modules/next/dist/bin/next", "start"]
