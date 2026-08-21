# ClaimRadar

Public campaign scanner. It lists **names + links** from CryptoRank Drop Hunting (including live claim URLs), Telegram previews, airdrop sites, Galxe, DefiLlama, and optional X. You sign up yourself.

Rows are ranked so **claim / signup** links sit above quest hubs, articles, Galxe points, and token listings.

## Run

`claimradar` is a folder **inside this GitHub repo**, not a folder in your Windows user directory. From `C:\Users\DELL` you must clone the repo first (install [Node.js LTS](https://nodejs.org/) if `npm` is missing).

Command Prompt:

```bat
cd %USERPROFILE%
git clone -b cursor/claimradar-tracker-9059 https://github.com/jaseerkp11/jaseerkp11.git
cd jaseerkp11\claimradar
npm install
npm run dev
```

If `jaseerkp11` **already exists** (this is your case), do not clone again. Switch that folder to the ClaimRadar branch:

```bat
cd %USERPROFILE%\jaseerkp11
git fetch origin cursor/claimradar-tracker-9059
git checkout cursor/claimradar-tracker-9059
cd claimradar
npm install
npm run dev
```

Open http://localhost:3100

Default filters hide Galxe **points** and DexScreener **listings**. Uncheck those boxes if you want them.

Refresh is ~15 minutes.

## Extra sources (optional)

Create `claimradar/.env.local` (see `.env.example`):

```
TELEGRAM_CHANNELS=airdropalert,SomeOtherPublicChannel
X_BEARER_TOKEN=your_x_api_bearer
```

Telegram uses public `t.me/s/channel` pages (no bot required). Channels without a public preview are skipped. X search only works if you add a bearer token.

Add more public channel usernames in `TELEGRAM_CHANNELS` (comma-separated, no @).

## What it cannot do

It cannot see **private** Telegram groups or posts that were never published on a public `t.me/s/` page. There is no complete internet-wide “every free $1 app” feed. It does not create accounts or complete tasks.
