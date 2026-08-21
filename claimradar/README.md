# ClaimRadar

Public **earn** index. It does **not** scrape airdrop Telegram channels or quest blogs.

It lists:

- Official exchange / wallet **reward and signup** pages
- In-app token apps (learn / play / tap / move) via CoinGecko categories
- Live **on-chain reward programs** from [Merkl](https://app.merkl.xyz/) (60+ chains)
- DEX / lending farms that pay extra tokens from DefiLlama yields

You open the link and check the live offer yourself. No auto-accounts.

Signup bonuses are regional and disappear. DEX/Merkl rows usually need a deposit or using the protocol.

## Run (Windows, existing clone)

```bat
cd C:\Users\DELL\jaseerkp11
git fetch origin cursor/claimradar-tracker-9059
git checkout cursor/claimradar-tracker-9059
git pull origin cursor/claimradar-tracker-9059
cd claimradar
npm install
npm run dev
```

Open http://localhost:3100

Refresh is ~15 minutes.
