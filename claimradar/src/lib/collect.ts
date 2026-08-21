import type { Campaign, ChainCoverage, SourceReport } from "./types";

const UA = "ClaimRadar/0.4 (earn-index; no signup automation)";
const TIMEOUT_MS = 25000;

function absUrl(href: string): string | null {
  try {
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "application/json", ...(init?.headers ?? {}) },
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function priority(c: Campaign): number {
  const kindScore: Record<string, number> = {
    signup: 100,
    "in-app": 70,
    onchain: 50,
    dex: 30,
  };
  return (kindScore[c.kind || ""] || 0) + (c.action === "signup" ? 10 : 0);
}

/** Official product reward / earn pages. Offers change; user opens the app and checks. */
const APP_EARN: Campaign[] = [
  {
    id: "app-coinbase-rewards",
    name: "Coinbase Rewards",
    url: "https://www.coinbase.com/rewards",
    source: "Official apps",
    summary: "In-app rewards. Sometimes includes learn/tasks. KYC. Check the live offer in the app.",
    status: "app",
    kind: "signup",
    action: "signup",
    chain: "Multi-chain",
  },
  {
    id: "app-coinbase-learn",
    name: "Coinbase Learn",
    url: "https://www.coinbase.com/learn",
    source: "Official apps",
    summary: "Learn modules that have historically paid crypto. Availability is region-locked.",
    status: "app",
    kind: "in-app",
    action: "learn",
    chain: "Multi-chain",
  },
  {
    id: "app-binance-rewards",
    name: "Binance Rewards Hub",
    url: "https://www.binance.com/en/activity/rewards-hub",
    source: "Official apps",
    summary: "Exchange missions and bonuses. Not the same as old airdrop blogs. Check current tasks in the app.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Multi-chain",
  },
  {
    id: "app-binance-earn",
    name: "Binance Earn",
    url: "https://www.binance.com/en/earn",
    source: "Official apps",
    summary: "Earn listed coins (simple earn / locked). Usually needs a deposit, not a free mint.",
    status: "app",
    kind: "dex",
    action: "earn",
    chain: "Multi-chain",
  },
  {
    id: "app-okx-rewards",
    name: "OKX Rewards",
    url: "https://www.okx.com/rewards",
    source: "Official apps",
    summary: "Exchange rewards center. Signup/task bonuses change by region.",
    status: "app",
    kind: "signup",
    action: "signup",
    chain: "Multi-chain",
  },
  {
    id: "app-bybit-rewards",
    name: "Bybit Rewards",
    url: "https://www.bybit.com/en/rewards",
    source: "Official apps",
    summary: "In-app rewards and missions on Bybit.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Multi-chain",
  },
  {
    id: "app-bitget",
    name: "Bitget events",
    url: "https://www.bitget.com/events",
    source: "Official apps",
    summary: "Exchange event/bonus center.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Multi-chain",
  },
  {
    id: "app-gate",
    name: "Gate.io rewards",
    url: "https://www.gate.io/reward",
    source: "Official apps",
    summary: "Gate rewards / bonus center.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Multi-chain",
  },
  {
    id: "app-kucoin",
    name: "KuCoin rewards",
    url: "https://www.kucoin.com/rewards",
    source: "Official apps",
    summary: "KuCoin rewards center.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Multi-chain",
  },
  {
    id: "app-crypto-com",
    name: "Crypto.com rewards",
    url: "https://crypto.com/rewards",
    source: "Official apps",
    summary: "Card/app rewards. Check current signup or task offers in the app.",
    status: "app",
    kind: "signup",
    action: "signup",
    chain: "Cronos / Multi-chain",
  },
  {
    id: "app-kraken-learn",
    name: "Kraken Learn",
    url: "https://www.kraken.com/learn",
    source: "Official apps",
    summary: "Education hub. Earn campaigns appear and disappear.",
    status: "app",
    kind: "in-app",
    action: "learn",
    chain: "Multi-chain",
  },
  {
    id: "app-polymarket",
    name: "Polymarket",
    url: "https://polymarket.com/",
    source: "Official apps",
    summary: "Prediction app. Past programs have paid a small signup/credit amount. Verify the live offer yourself.",
    status: "app",
    kind: "signup",
    action: "signup",
    chain: "Polygon",
  },
  {
    id: "app-phantom",
    name: "Phantom",
    url: "https://phantom.com/",
    source: "Official apps",
    summary: "Wallet. Open Rewards / Discover in the app for any current token tasks.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Solana / Multi-chain",
  },
  {
    id: "app-rainbow",
    name: "Rainbow wallet",
    url: "https://rainbow.me/",
    source: "Official apps",
    summary: "Wallet points/rewards live in the app, not on airdrop blogs.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Ethereum / L2",
  },
  {
    id: "app-trust",
    name: "Trust Wallet rewards",
    url: "https://trustwallet.com/rewards",
    source: "Official apps",
    summary: "Wallet rewards page. Check in-app campaigns.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Multi-chain",
  },
  {
    id: "app-backpack",
    name: "Backpack",
    url: "https://backpack.app/",
    source: "Official apps",
    summary: "Wallet + exchange. Open the app for any earn/points program.",
    status: "app",
    kind: "in-app",
    action: "task",
    chain: "Solana",
  },
  {
    id: "app-jupiter",
    name: "Jupiter",
    url: "https://jup.ag/",
    source: "Official apps",
    summary: "Solana DEX/aggregator. Earn is via using the product (swap, LFG, etc.), not an airdrop newsletter.",
    status: "app",
    kind: "dex",
    action: "use",
    chain: "Solana",
  },
  {
    id: "app-hyperliquid",
    name: "Hyperliquid",
    url: "https://app.hyperliquid.xyz/",
    source: "Official apps",
    summary: "Perp DEX. Any token/points earn is inside the app.",
    status: "app",
    kind: "dex",
    action: "use",
    chain: "Hyperliquid",
  },
  {
    id: "app-dydx",
    name: "dYdX",
    url: "https://dydx.trade/",
    source: "Official apps",
    summary: "Perp DEX. Trading rewards (if live) are in-product.",
    status: "app",
    kind: "dex",
    action: "use",
    chain: "dYdX",
  },
  {
    id: "app-uniswap",
    name: "Uniswap",
    url: "https://app.uniswap.org/",
    source: "Official apps",
    summary: "DEX. LP / incentive seasons show in the app when a chain is running rewards.",
    status: "app",
    kind: "dex",
    action: "pool",
    chain: "Multi-chain",
  },
  {
    id: "app-merkl",
    name: "Merkl app",
    url: "https://app.merkl.xyz/",
    source: "Official apps",
    summary: "Dashboard of live on-chain token distributions across 60+ chains. Filter by chain yourself.",
    status: "app",
    kind: "onchain",
    action: "claim",
    chain: "60+ chains",
  },
];

type MerklOpp = {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  action?: string;
  apr?: number;
  dailyRewards?: number;
  depositUrl?: string;
  chain?: { name?: string; id?: number };
  protocol?: { name?: string; url?: string };
  rewardsRecord?: { breakdowns?: { token?: { symbol?: string } }[] };
};

type MerklChain = { name?: string; liveCampaigns?: number };

async function fetchMerklChains(): Promise<ChainCoverage[]> {
  const json = (await getJson("https://api.merkl.xyz/v4/chains")) as MerklChain[];
  if (!Array.isArray(json)) return [];
  return json
    .filter((c) => (c.liveCampaigns || 0) > 0 && c.name)
    .map((c) => ({ name: c.name as string, live: c.liveCampaigns || 0 }))
    .sort((a, b) => b.live - a.live);
}

async function fetchMerklOpps(): Promise<Campaign[]> {
  const pages = await Promise.all(
    [0, 1, 2, 3].map((page) =>
      getJson(`https://api.merkl.xyz/v4/opportunities?status=LIVE&items=100&page=${page}`),
    ),
  );
  const rows: MerklOpp[] = pages.flatMap((p) => (Array.isArray(p) ? (p as MerklOpp[]) : []));
  const scored = rows
    .filter((o) => o.status === "LIVE" && o.action !== "DROP" && (o.dailyRewards || 0) > 0)
    .sort((a, b) => (b.dailyRewards || 0) - (a.dailyRewards || 0))
    .slice(0, 90);

  return scored.flatMap((o) => {
    const url = absUrl(o.depositUrl || o.protocol?.url || "https://app.merkl.xyz/");
    if (!url || !o.id) return [];
    const reward = o.rewardsRecord?.breakdowns?.[0]?.token?.symbol;
    const chain = o.chain?.name || "Unknown";
    const apr = typeof o.apr === "number" ? `${o.apr.toFixed(1)}% APR` : "";
    const daily = o.dailyRewards ? `~$${Math.round(o.dailyRewards)}/day rewards` : "";
    return [
      {
        id: `merkl-${o.id}`,
        name: o.name || o.protocol?.name || "Merkl opportunity",
        url,
        source: "Merkl on-chain rewards",
        summary: [o.description, apr, daily].filter(Boolean).join(" · ").slice(0, 280),
        status: "LIVE",
        kind: "onchain",
        extra: apr,
        chain,
        reward,
        action: (o.action || "earn").toLowerCase(),
      } satisfies Campaign,
    ];
  });
}

type LlamaPool = {
  chain?: string;
  project?: string;
  symbol?: string;
  tvlUsd?: number;
  apyReward?: number | null;
  apy?: number | null;
  rewardTokens?: string[];
  pool?: string;
  poolMeta?: string | null;
};

async function fetchLlamaRewardPools(): Promise<Campaign[]> {
  const json = (await getJson("https://yields.llama.fi/pools")) as { data?: LlamaPool[] };
  const pools = json.data ?? [];
  const withRewards = pools
    .filter((p) => (p.apyReward || 0) > 1 && (p.tvlUsd || 0) >= 50_000 && (p.rewardTokens?.length || 0) > 0)
    .sort((a, b) => (b.apyReward || 0) - (a.apyReward || 0))
    .slice(0, 80);

  return withRewards.flatMap((p) => {
    const slug = encodeURIComponent(p.project || "");
    const url = absUrl(`https://defillama.com/yields?project=${slug}`);
    if (!url || !p.pool) return [];
    const meta = p.poolMeta ? ` (${p.poolMeta})` : "";
    return [
      {
        id: `llama-${p.pool}`,
        name: `${p.project} ${p.symbol}${meta}`.slice(0, 90),
        url,
        source: "DefiLlama reward farms",
        summary: `Incentive APY ${Number(p.apyReward).toFixed(1)}% on ${p.chain}. TVL ~$${Math.round(p.tvlUsd || 0).toLocaleString()}. This is DEX/lending yield, usually needs a deposit.`,
        status: "live",
        kind: "dex",
        extra: `${Number(p.apyReward).toFixed(1)}% reward APY`,
        chain: p.chain,
        action: "pool",
      } satisfies Campaign,
    ];
  });
}

type GeckoCoin = {
  id: string;
  symbol?: string;
  name?: string;
};

async function fetchGeckoCategory(category: string, kind: string, label: string): Promise<Campaign[]> {
  const json = (await getJson(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${encodeURIComponent(category)}&per_page=15&order=market_cap_desc`,
  )) as GeckoCoin[];
  if (!Array.isArray(json)) return [];
  return json.flatMap((c) => {
    const url = absUrl(`https://www.coingecko.com/en/coins/${encodeURIComponent(c.id)}`);
    if (!url) return [];
    return [
      {
        id: `cg-${category}-${c.id}`,
        name: c.name || c.id,
        url,
        source: label,
        summary: `${label}: ${c.symbol?.toUpperCase() || ""} token app. Open CoinGecko for the official website, then check in-app earn/tasks.`,
        status: "listed",
        kind,
        extra: c.symbol?.toUpperCase(),
        reward: c.symbol?.toUpperCase(),
        action: "use",
      } satisfies Campaign,
    ];
  });
}

async function fetchGeckoEarnApps(): Promise<Campaign[]> {
  const cats: { id: string; kind: string; label: string }[] = [
    { id: "learn-to-earn", kind: "in-app", label: "Learn-to-earn" },
    { id: "play-to-earn", kind: "in-app", label: "Play-to-earn" },
    { id: "tap-to-earn", kind: "in-app", label: "Tap-to-earn" },
    { id: "move-to-earn", kind: "in-app", label: "Move-to-earn" },
  ];
  const out: Campaign[] = [];
  for (const cat of cats) {
    try {
      out.push(...(await fetchGeckoCategory(cat.id, cat.kind, cat.label)));
    } catch {
      // CoinGecko rate-limits; keep other categories.
    }
  }
  if (out.length === 0) throw new Error("CoinGecko earn categories empty or rate-limited");
  return out;
}

export async function collectCampaigns(): Promise<{
  items: Campaign[];
  sources: SourceReport[];
  chains: ChainCoverage[];
}> {
  const jobs: { source: string; run: () => Promise<Campaign[]> }[] = [
    { source: "Official apps", run: async () => APP_EARN },
    { source: "Merkl on-chain rewards", run: fetchMerklOpps },
    { source: "DefiLlama reward farms", run: fetchLlamaRewardPools },
    { source: "In-app token apps", run: fetchGeckoEarnApps },
  ];

  const sources: SourceReport[] = [];
  const chunks: Campaign[][] = [];
  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  settled.forEach((res, i) => {
    const source = jobs[i].source;
    if (res.status === "fulfilled") {
      chunks.push(res.value);
      sources.push({ source, ok: true, count: res.value.length });
    } else {
      sources.push({ source, ok: false, count: 0, error: String(res.reason).slice(0, 180) });
    }
  });

  let chains: ChainCoverage[] = [];
  try {
    chains = await fetchMerklChains();
    sources.push({ source: "Merkl chain coverage", ok: true, count: chains.length });
  } catch (e) {
    sources.push({ source: "Merkl chain coverage", ok: false, count: 0, error: String(e).slice(0, 180) });
  }

  const seen = new Set<string>();
  const items: Campaign[] = [];
  for (const c of chunks.flat()) {
    const key = c.url.replace(/\/$/, "").toLowerCase() + "|" + c.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(c);
  }
  items.sort((a, b) => priority(b) - priority(a));
  return { items, sources, chains };
}
