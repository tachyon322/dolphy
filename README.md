This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Dolphy web

### Local dev (Node.js >= 22.13 runtime; Bun installs the lockfile)

```bash
cp .env.example .env   # fill in RPC, treasury, Privy App ID
bun install
npm run dev
```

`lib/db/index.ts` uses Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html)
module. Node 22.13 removed the `--experimental-sqlite` flag requirement.

### Docker (build and run with Node >= 22.13)

Bun remains in the dependency stages solely to install the committed `bun.lock`.
The builder and production image use Node, including the `node:sqlite` runtime.

```bash
cp .env.example .env   # fill in values
docker compose up --build -d
curl localhost:3000/api/gpus
```

Gotchas:

- `NEXT_PUBLIC_*` are baked into the client bundle at **build** time: change via
  environment/`--build-arg`, then rebuild. Runtime-only vars (`RUNPOD_*`,
  `PRIVY_APP_SECRET`, `SKIP_SOLANA_VERIFY`) need no rebuild.
- SQLite lives in the `dolphy-data` volume (`DATABASE_PATH=/app/data/dolphy.db`).
  Single replica only.
- Privy social logins (`Google`/`X`/...) must additionally be enabled in
  `dashboard.privy.io → Login Methods`, otherwise `disallowed_login_method`.

---

## Getting Started (upstream Next.js boilerplate)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
