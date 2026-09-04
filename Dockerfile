# dolphy/web — build with Node, run with Bun. Do not "simplify" to one runtime:
#   - `bun --bun next build` segfaults (Bun bug, not our code) → build stage is node:22
#   - `bun:sqlite` (lib/db/index.ts) needs the Bun runtime → run stage is oven/bun
# package.json scripts encode the same rule: build = `next build`, start = `bun --bun next start`.

# ---------- deps (lockfile-accurate, fast) ----------
FROM oven/bun:1.3.14 AS deps
WORKDIR /app
COPY package.json bun.lock ./
# Cache mount: bun downloads survive rebuilds instead of re-filling layers.
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# ---------- build (Node!) ----------
FROM node:22-bookworm-slim AS builder
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

# ---------- run (Bun!) ----------
FROM oven/bun:1.3.14 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/app/data/dolphy.db

COPY --chown=bun:bun package.json bun.lock next.config.ts ./
COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next ./.next
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --production --frozen-lockfile

# chown only the writable dir. Never `chown -R` /app: that forks a duplicate
# layer of the whole app (~2GB, +30min build) just to flip ownership bits.
RUN mkdir -p /app/data && chown -R bun:bun /app/data
USER bun

VOLUME /app/data
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/gpus').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Same as `bun run start`: Bun runtime is required for bun:sqlite.
CMD ["bun", "--bun", "next", "start"]
