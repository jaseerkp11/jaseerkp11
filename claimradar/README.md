# ClaimRadar

Public campaign scanner. It lists **names + links** from Telegram previews, airdrop sites, Galxe, DefiLlama, and optional X. You sign up yourself.

## Run

```bash
cd claimradar
npm install
npm run dev
```

Open http://localhost:3100

Default filters hide Galxe **points** and DexScreener **listings**. Uncheck those boxes if you want them.

Refresh is ~15 minutes.

## Extra sources (optional)

Create `claimradar/.env.local`:

```
TELEGRAM_CHANNELS=airdropalert,SomeOtherPublicChannel
X_BEARER_TOKEN=your_x_api_bearer
```

Telegram uses public `t.me/s/channel` pages (no bot required). X search only works if you add a bearer token.

Add more public channel usernames in `TELEGRAM_CHANNELS` (comma-separated, no @).

## What it cannot do

It cannot see **private** Telegram groups or posts that were never published on a public `t.me/s/` page. There is no complete internet-wide “every free $1 app” feed.
