# ClaimRadar

Fresh scanner for **new** earn paths — the Ares-style case: a welcome / instant reward that exists until it goes viral.

It does **not** scrape old airdrop Telegram channels, Galxe, or a frozen list of Coinbase/Binance pages.

## What it scans

- **Just-verified contracts** on Polygon, Ethereum, Arbitrum, Optimism, Scroll, Celo, Unichain, Gnosis (Blockscout). Names matching faucet / claim / airdrop / bonus / merkle / chef / etc.
- **Merkl campaigns created in the last 14 days**
- **Protocols listed on DefiLlama in the last 21 days** (open the live app and look for a signup timer)

Ares $1 pUSD was an **in-app** timer. That does not appear as a Polygon contract until/unless they put it on-chain. This tool gets you to **new apps and new claim contracts** quickly; you still open them yourself.

## Run (Windows)

```bat
cd C:\Users\DELL\jaseerkp11
git fetch origin cursor/claimradar-tracker-9059
git checkout cursor/claimradar-tracker-9059
git pull origin cursor/claimradar-tracker-9059
cd claimradar
npm install
npm run dev
```

http://localhost:3100
