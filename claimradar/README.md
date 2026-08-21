# ClaimRadar

Standalone Next.js app (not the Atria store). It **indexes public campaign pages** (name + official-looking URL). You sign up and do tasks yourself.

It does **not** auto-signup, complete quests, bet, or withdraw.

## Run

```bash
cd claimradar
npm install
npm run dev
```

Open http://localhost:3100

The list re-fetches from sources about every **15 minutes** (API `revalidate = 900`, browser interval 15 min). Tap **Refresh** anytime.

## Sources

| Source | What you get |
|---|---|
| Quest hubs | Galxe, Layer3, Zealy, Intract, TaskOn, DefiLlama airdrops, Airdrops.io |
| Galxe GraphQL | Trending + newest public quests + `app.galxe.com` links |
| DefiLlama airdrop-checker | Active projects from their public GitHub config |
| Airdrops.io | Latest WordPress posts |
| DexScreener | Latest token profiles (listings, **not** faucets — high scam risk) |

A source failing (timeout, 4xx) is shown as a red chip; others still load.

## Safety

- “Instant USDC from signup” posts are often fake or shut down quickly.
- Never enter a seed phrase. Open only the linked domain.
- Points / soulbound tokens usually cannot be swapped.

## Deploy

Create a **separate** Vercel project with root directory `claimradar` (do not use the storefront root).
