import type { Campaign, ChainCoverage, SourceReport } from "./types";

const UA = "ClaimRadar/0.5 (fresh on-chain earn scan; no signup automation)";
const TIMEOUT_MS = 22000;
const MERKL_DAYS = 14;
const LLAMA_DAYS = 21;

function absUrl(href: string): string | null {
  try {
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function getJson(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function hoursAgo(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return iso.slice(0, 16);
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60000))}m ago`;
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function classifyContract(name: string): { kind: string; action: string } | null {
  const n = name.toLowerCase();
  if (/(safeproxy|gnosissafe|identityproxy|beaconproxy|eip1967|uniswapv2pair|multicall|create2)/i.test(n)) {
    return null;
  }
  if (/(faucet|airdrop|air.?drop|merkle|distributor|claim|bonus|welcome|referral|giveaway|dropper|quest)/i.test(n)) {
    return { kind: "instant", action: "claim" };
  }
  if (/(reward|incentive|voucher|coupon|minter)/i.test(n)) {
    return { kind: "instant", action: "reward" };
  }
  if (/(masterchef|gauge|farm)/i.test(n)) {
    return { kind: "farm", action: "farm" };
  }
  return null;
}

function priority(c: Campaign): number {
  const kindScore: Record<string, number> = {
    instant: 100,
    "new-app": 80,
    merkl: 55,
    farm: 25,
  };
  let n = kindScore[c.kind || ""] || 0;
  if (c.seenAt) {
    const ageH = (Date.now() - new Date(c.seenAt).getTime()) / 3600000;
    if (ageH < 6) n += 20;
    else if (ageH < 24) n += 10;
  }
  return n;
}

const BLOCKSCOUT: { host: string; chain: string }[] = [
  { host: "polygon.blockscout.com", chain: "Polygon" },
  { host: "eth.blockscout.com", chain: "Ethereum" },
  { host: "arbitrum.blockscout.com", chain: "Arbitrum" },
  { host: "optimism.blockscout.com", chain: "Optimism" },
  { host: "scroll.blockscout.com", chain: "Scroll" },
  { host: "celo.blockscout.com", chain: "Celo" },
  { host: "unichain.blockscout.com", chain: "Unichain" },
  { host: "gnosis.blockscout.com", chain: "Gnosis" },
];

type BsItem = {
  verified_at?: string;
  address?: { hash?: string; name?: string; is_scam?: boolean };
};

async function fetchBlockscoutChain(host: string, chain: string): Promise<Campaign[]> {
  const out: Campaign[] = [];
  let url = `https://${host}/api/v2/smart-contracts`;
  for (let page = 0; page < 2; page++) {
    const json = (await getJson(url)) as { items?: BsItem[]; next_page_params?: Record<string, string | number> };
    for (const row of json.items ?? []) {
      const name = row.address?.name || "";
      const hash = row.address?.hash;
      if (!hash || row.address?.is_scam) continue;
      const cls = classifyContract(name);
      if (!cls) continue;
      const explorer = absUrl(`https://${host}/address/${hash}`);
      if (!explorer) continue;
      out.push({
        id: `bs-${chain}-${hash}`,
        name: `${name} (${chain})`,
        url: explorer,
        source: "Fresh verified contracts",
        summary: `Newly verified ${cls.action} contract on ${chain}. Open the explorer, read the contract, then the project site. This is not an old airdrop blog. Most will be junk; Ares-style bonuses are usually in-app, not on-chain.`,
        status: "verified",
        kind: cls.kind,
        extra: hoursAgo(row.verified_at),
        chain,
        action: cls.action,
        seenAt: row.verified_at,
      });
    }
    const next = json.next_page_params;
    if (!next) break;
    const qs = new URLSearchParams(Object.entries(next).map(([k, v]) => [k, String(v)]));
    url = `https://${host}/api/v2/smart-contracts?${qs.toString()}`;
  }
  return out;
}

async function fetchAllBlockscout(): Promise<Campaign[]> {
  const settled = await Promise.allSettled(BLOCKSCOUT.map((c) => fetchBlockscoutChain(c.host, c.chain)));
  const items: Campaign[] = [];
  let ok = 0;
  for (const res of settled) {
    if (res.status === "fulfilled") {
      ok += 1;
      items.push(...res.value);
    }
  }
  if (ok === 0) throw new Error("all block explorers failed");
  return items;
}

type MerklCampaign = {
  id?: string;
  opportunityId?: string;
  createdAt?: string;
  dailyRewards?: number;
  type?: string;
  chain?: { name?: string };
  rewardToken?: { symbol?: string };
  campaignStatus?: { status?: string } | string;
};

async function fetchNewMerkl(): Promise<Campaign[]> {
  const since = new Date(Date.now() - MERKL_DAYS * 86400000).toISOString().slice(0, 10);
  const json = (await getJson(
    `https://api.merkl.xyz/v4/campaigns?items=80&createdAfter=${since}`,
  )) as MerklCampaign[];
  if (!Array.isArray(json) || json.length === 0) throw new Error("no new Merkl campaigns");
  return json.flatMap((c) => {
    const id = c.opportunityId || c.id;
    const url = absUrl(id ? `https://app.merkl.xyz/opportunities/${id}` : "https://app.merkl.xyz/");
    if (!url || !id) return [];
    const created = typeof c.createdAt === "string" ? c.createdAt : undefined;
    const chain = c.chain?.name || "Unknown";
    const reward = c.rewardToken?.symbol;
    const daily = c.dailyRewards ? `~$${Number(c.dailyRewards).toFixed(2)}/day` : "";
    return [
      {
        id: `merkl-new-${id}-${c.id || ""}`,
        name: `${reward || "token"} reward · ${chain}`,
        url,
        source: "New Merkl campaigns",
        summary: `On-chain distribution created ${hoursAgo(created)}. ${c.type || "campaign"} ${daily}. Usually needs using the protocol, not a $0 signup. Check the opportunity page.`,
        status: typeof c.campaignStatus === "string" ? c.campaignStatus : c.campaignStatus?.status || "new",
        kind: "merkl",
        extra: hoursAgo(created),
        chain,
        reward,
        action: "earn",
        seenAt: created,
      } satisfies Campaign,
    ];
  });
}

type LlamaProto = {
  name?: string;
  symbol?: string;
  url?: string;
  category?: string;
  listedAt?: number;
  chains?: string[];
};

async function fetchNewLlamaApps(): Promise<Campaign[]> {
  const json = (await getJson("https://api.llama.fi/lite/protocols2")) as { protocols?: LlamaProto[] };
  const cut = Date.now() / 1000 - LLAMA_DAYS * 86400;
  const recent = (json.protocols ?? [])
    .filter((p) => (p.listedAt || 0) >= cut && p.url && p.name)
    .sort((a, b) => (b.listedAt || 0) - (a.listedAt || 0));
  return recent.flatMap((p) => {
    const url = absUrl(p.url || "");
    if (!url) return [];
    const seenAt = p.listedAt ? new Date(p.listedAt * 1000).toISOString() : undefined;
    const chains = (p.chains || []).slice(0, 4).join(", ") || "Unknown";
    return [
      {
        id: `llama-new-${p.name}-${p.listedAt}`,
        name: p.name || "New protocol",
        url,
        source: "Newly listed apps",
        summary: `Listed on DefiLlama ${hoursAgo(seenAt)}. Category: ${p.category || "n/a"}. Open the live app and look for a welcome / signup / quest timer like Ares — those are in the product, not on old blogs.`,
        status: "new",
        kind: "new-app",
        extra: hoursAgo(seenAt),
        chain: chains,
        reward: p.symbol || undefined,
        action: "signup",
        seenAt,
      } satisfies Campaign,
    ];
  });
}

export async function collectCampaigns(): Promise<{
  items: Campaign[];
  sources: SourceReport[];
  chains: ChainCoverage[];
}> {
  const jobs: { source: string; run: () => Promise<Campaign[]> }[] = [
    { source: "Fresh verified contracts", run: fetchAllBlockscout },
    { source: "New Merkl campaigns", run: fetchNewMerkl },
    { source: "Newly listed apps", run: fetchNewLlamaApps },
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

  const seen = new Set<string>();
  const items: Campaign[] = [];
  for (const c of chunks.flat()) {
    const key = c.url.replace(/\/$/, "").toLowerCase() + "|" + c.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(c);
  }
  items.sort((a, b) => priority(b) - priority(a));

  const chainCount = new Map<string, number>();
  for (const c of items) {
    const name = (c.chain || "Unknown").split(",")[0].trim();
    chainCount.set(name, (chainCount.get(name) || 0) + 1);
  }
  const chains: ChainCoverage[] = [...chainCount.entries()]
    .map(([name, live]) => ({ name, live }))
    .sort((a, b) => b.live - a.live);

  return { items, sources, chains };
}
