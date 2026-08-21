import type { Campaign, SourceReport } from "./types";

const UA = "ClaimRadar/0.1 (public campaign index; no signup automation)";
const TIMEOUT_MS = 12000;

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();
}

export const HUBS: Campaign[] = [
  {
    id: "hub-galxe",
    name: "Galxe (quest hub)",
    url: "https://app.galxe.com",
    source: "Quest hubs",
    summary: "Public quests. Some pay points; some pay tokens. Check each campaign yourself.",
    status: "hub",
  },
  {
    id: "hub-layer3",
    name: "Layer3",
    url: "https://app.layer3.xyz",
    source: "Quest hubs",
    summary: "Quests and cubs. Rewards vary; many are points, not withdrawable cash.",
    status: "hub",
  },
  {
    id: "hub-zealy",
    name: "Zealy",
    url: "https://zealy.io/explore",
    source: "Quest hubs",
    summary: "Community quest boards. Confirm the reward is a real token before spending time.",
    status: "hub",
  },
  {
    id: "hub-intract",
    name: "Intract",
    url: "https://www.intract.io",
    source: "Quest hubs",
    summary: "Campaign quests. Official site only — skip random “claim” DMs.",
    status: "hub",
  },
  {
    id: "hub-taskon",
    name: "TaskOn",
    url: "https://taskon.xyz",
    source: "Quest hubs",
    summary: "Task campaigns. Verify withdraw/swap on the project’s own docs.",
    status: "hub",
  },
  {
    id: "hub-llama",
    name: "DefiLlama airdrops list",
    url: "https://defillama.com/airdrops",
    source: "Quest hubs",
    summary: "Tokenless protocols that might airdrop later. Not instant cash.",
    status: "hub",
  },
  {
    id: "hub-airdropsio",
    name: "Airdrops.io",
    url: "https://airdrops.io",
    source: "Quest hubs",
    summary: "Editorial airdrop write-ups. Always open the official project URL, not a clone.",
    status: "hub",
  },
];

type GalxeCampaign = {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  description?: string;
  space?: { name?: string; alias?: string };
};

async function fetchGalxe(listType: "Trending" | "Newest"): Promise<Campaign[]> {
  const body = {
    query: `query { campaigns(input: { first: 24, listType: ${listType} }) { list { id name type status description space { name alias } } } }`,
  };
  const json = (await getJson("https://graphigo.prd.galaxy.eco/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })) as { data?: { campaigns?: { list?: GalxeCampaign[] } } };
  const list = json.data?.campaigns?.list ?? [];
  return list.flatMap((c) => {
      const id = c.id ?? "";
      const alias = c.space?.alias ?? "";
      const url = absUrl(
        alias && id ? `https://app.galxe.com/quest/${encodeURIComponent(alias)}/${encodeURIComponent(id)}` : "https://app.galxe.com",
      );
      if (!id || !url) return [];
      const desc = stripHtml(c.description ?? "").slice(0, 220);
      const row: Campaign = {
        id: `galxe-${id}`,
        name: c.name || id,
        url,
        source: `Galxe ${listType}`,
        summary: desc || `${c.space?.name ?? "Galxe"} · ${c.type ?? "quest"}`,
        status: c.status || "unknown",
      };
      if (c.type) row.extra = c.type;
      return [row];
    });
}

async function fetchLlamaAirdropConfig(): Promise<Campaign[]> {
  const json = (await getJson(
    "https://raw.githubusercontent.com/DefiLlama/airdrop-checker/master/airdrop-config.json",
  )) as Record<string, { name?: string; description?: string; page?: string; twitter?: string; tokenSymbol?: string; isActive?: boolean }>;
  return Object.entries(json).flatMap(([key, v]) => {
      if (v.isActive === false || !v.page) return [];
      const url = absUrl(v.page);
      if (!url) return [];
      const row: Campaign = {
        id: `llama-${key}`,
        name: v.name || key,
        url,
        source: "DefiLlama airdrop-checker",
        summary: (v.description || "").slice(0, 220) || "Listed on DefiLlama airdrop checker.",
        status: "listed",
      };
      if (v.tokenSymbol) row.extra = v.tokenSymbol;
      return [row];
    });
}

type WpPost = {
  id: number;
  date?: string;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
};

async function fetchAirdropsIo(): Promise<Campaign[]> {
  const json = (await getJson(
    "https://airdrops.io/wp-json/wp/v2/posts?per_page=20&_fields=id,date,link,title,excerpt",
  )) as WpPost[];
  if (!Array.isArray(json)) return [];
  return json.flatMap((p) => {
      const url = absUrl(p.link || "");
      if (!url) return [];
      const row: Campaign = {
        id: `airdropsio-${p.id}`,
        name: stripHtml(p.title?.rendered || "Untitled"),
        url,
        source: "Airdrops.io",
        summary: stripHtml(p.excerpt?.rendered || "").slice(0, 220),
        status: "article",
      };
      if (p.date) row.extra = p.date.slice(0, 10);
      return [row];
    });
}

type DexProfile = {
  url?: string;
  chainId?: string;
  tokenAddress?: string;
  description?: string;
  links?: { type?: string; url?: string }[];
};

async function fetchDexProfiles(): Promise<Campaign[]> {
  const json = (await getJson("https://api.dexscreener.com/token-profiles/latest/v1")) as DexProfile[];
  if (!Array.isArray(json)) return [];
  return json.slice(0, 20).map((p, i) => {
    const site = p.links?.find((l) => l.type === "website" || l.type === "Website")?.url;
    const url = absUrl(site || p.url || "") || "https://dexscreener.com";
    return {
      id: `dex-${p.chainId || "x"}-${p.tokenAddress || i}`,
      name: `${p.chainId || "chain"} token ${(p.tokenAddress || "").slice(0, 6)}…`,
      url,
      source: "DexScreener new profiles",
      summary:
        (p.description || "Newly promoted token profile — not a signup faucet. High scam risk. Do not connect a wallet to random claim sites.").slice(0, 220),
      status: "listing",
      extra: p.chainId,
    };
  });
}

export async function collectCampaigns(): Promise<{ items: Campaign[]; sources: SourceReport[] }> {
  const jobs: { source: string; run: () => Promise<Campaign[]> }[] = [
    { source: "Quest hubs", run: async () => HUBS },
    { source: "Galxe Trending", run: () => fetchGalxe("Trending") },
    { source: "Galxe Newest", run: () => fetchGalxe("Newest") },
    { source: "DefiLlama airdrop-checker", run: fetchLlamaAirdropConfig },
    { source: "Airdrops.io", run: fetchAirdropsIo },
    { source: "DexScreener new profiles", run: fetchDexProfiles },
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
  return { items, sources };
}
