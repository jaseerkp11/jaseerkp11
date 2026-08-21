import type { Campaign, SourceReport } from "./types";

const UA = "ClaimRadar/0.3 (public campaign index; no signup automation)";
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

async function getHtml(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html" },
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();
}

function looksLikePoints(text: string): boolean {
  return /\b(xp|points?|loyalty|cubs?|soulbound|sbt)\b/i.test(text);
}

function looksLikeClaim(text: string): boolean {
  return /\b(claim|signup|sign up|register|faucet|bonus|free token|welcome bonus)\b/i.test(text);
}

function priority(c: Campaign): number {
  const blob = `${c.name} ${c.summary} ${c.kind} ${c.status} ${c.extra ?? ""}`;
  let n = 0;
  if (c.kind === "claim") n += 80;
  else if (c.kind === "signup") n += 40;
  else if (c.kind === "quest") n += 25;
  else if (c.kind === "article") n += 10;
  else if (c.kind === "hub") n += 5;
  else if (c.kind === "listing" || c.kind === "points") n -= 20;
  if (looksLikeClaim(blob)) n += 15;
  if (looksLikePoints(blob) && c.kind !== "claim") n -= 10;
  return n;
}

export const HUBS: Campaign[] = [
  {
    id: "hub-galxe",
    name: "Galxe",
    url: "https://app.galxe.com",
    source: "Quest hubs",
    summary: "Open this hub and filter campaigns yourself. Many are points, some are tokens.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-layer3",
    name: "Layer3",
    url: "https://app.layer3.xyz",
    source: "Quest hubs",
    summary: "Public quest board.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-zealy",
    name: "Zealy",
    url: "https://zealy.io/explore",
    source: "Quest hubs",
    summary: "Community tasks. Reward type is per community.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-intract",
    name: "Intract",
    url: "https://www.intract.io",
    source: "Quest hubs",
    summary: "Campaign quests.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-taskon",
    name: "TaskOn",
    url: "https://taskon.xyz",
    source: "Quest hubs",
    summary: "Task campaigns.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-questn",
    name: "QuestN",
    url: "https://questn.com",
    source: "Quest hubs",
    summary: "Quest listings.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-llama",
    name: "DefiLlama airdrops",
    url: "https://defillama.com/airdrops",
    source: "Quest hubs",
    summary: "Tokenless protocols that might issue a token later.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-airdropsio",
    name: "Airdrops.io",
    url: "https://airdrops.io",
    source: "Quest hubs",
    summary: "Airdrop write-ups with project links.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-airdropalert",
    name: "AirdropAlert",
    url: "https://airdropalert.com/latest-airdrops",
    source: "Quest hubs",
    summary: "Large public airdrop catalog. Open each project page and verify the claim site.",
    status: "hub",
    kind: "hub",
  },
  {
    id: "hub-cryptorank",
    name: "CryptoRank Drop Hunting",
    url: "https://cryptorank.io/drophunting",
    source: "Quest hubs",
    summary: "Public airdrop board with claim links when a distribution is live.",
    status: "hub",
    kind: "hub",
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
    const blob = `${c.name} ${c.type} ${desc}`;
    const row: Campaign = {
      id: `galxe-${id}`,
      name: c.name || id,
      url,
      source: `Galxe ${listType}`,
      summary: desc || `${c.space?.name ?? "Galxe"} · ${c.type ?? "quest"}`,
      status: c.status || "unknown",
      kind: looksLikePoints(blob) ? "points" : "quest",
    };
    if (c.type) row.extra = c.type;
    return [row];
  });
}

async function fetchLlamaAirdropConfig(): Promise<Campaign[]> {
  const json = (await getJson(
    "https://raw.githubusercontent.com/DefiLlama/airdrop-checker/master/airdrop-config.json",
  )) as Record<string, { name?: string; description?: string; page?: string; tokenSymbol?: string; isActive?: boolean }>;
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
      kind: "quest",
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

async function fetchWpPosts(source: string, api: string, kind: string): Promise<Campaign[]> {
  const json = (await getJson(api)) as WpPost[];
  if (!Array.isArray(json)) return [];
  return json.flatMap((p) => {
    const url = absUrl(p.link || "");
    if (!url) return [];
    const row: Campaign = {
      id: `${source}-${p.id}`,
      name: stripHtml(p.title?.rendered || "Untitled"),
      url,
      source,
      summary: stripHtml(p.excerpt?.rendered || "").slice(0, 220),
      status: "article",
      kind,
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
  return json.slice(0, 15).map((p, i) => {
    const site = p.links?.find((l) => l.type === "website" || l.type === "Website")?.url;
    const url = absUrl(site || p.url || "") || "https://dexscreener.com";
    return {
      id: `dex-${p.chainId || "x"}-${p.tokenAddress || i}`,
      name: `${p.chainId || "chain"} ${(p.tokenAddress || "").slice(0, 8)}…`,
      url,
      source: "DexScreener new profiles",
      summary: (p.description || "New token profile (not a signup bonus).").slice(0, 220),
      status: "listing",
      kind: "listing",
      extra: p.chainId,
    };
  });
}

type RankCoin = { key?: string; name?: string; symbol?: string | null };
type RankRow = {
  key?: string;
  status?: string;
  rewardType?: string;
  linkToClaim?: string | null;
  checkLink?: string | null;
  isAuthProtected?: boolean;
  activityTypes?: string[];
  coin?: RankCoin;
};
type RankReward = {
  key?: string;
  linkToClaim?: string | null;
  coin?: { name?: string };
};
type RankHot = { key?: string; name?: string; firstType?: string };

async function fetchCryptoRank(): Promise<Campaign[]> {
  const html = await getHtml("https://cryptorank.io/drophunting");
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("CryptoRank page had no public data blob");
  const next = JSON.parse(m[1]) as {
    props?: {
      pageProps?: {
        fallbackTableData?: { data?: RankRow[] };
        widgetsData?: { nextRewards?: RankReward[]; hotEvents?: RankHot[] };
      };
    };
  };
  const pp = next.props?.pageProps;
  const out: Campaign[] = [];

  for (const r of pp?.widgetsData?.nextRewards ?? []) {
    const url = absUrl(r.linkToClaim || "");
    if (!url || !r.key) continue;
    out.push({
      id: `cr-claim-${r.key}`,
      name: `${r.coin?.name || r.key} claim`,
      url,
      source: "CryptoRank claims",
      summary: "Distribution / claim page listed on CryptoRank Drop Hunting.",
      status: "claim",
      kind: "claim",
      extra: r.key,
    });
  }

  for (const h of pp?.widgetsData?.hotEvents ?? []) {
    const url = absUrl(h.key ? `https://cryptorank.io/drophunting/${encodeURIComponent(h.key)}` : "");
    if (!url || !h.key) continue;
    out.push({
      id: `cr-hot-${h.key}`,
      name: h.name || h.key,
      url,
      source: "CryptoRank hot",
      summary: h.firstType ? `Hot Drop Hunting activity · ${h.firstType}` : "Hot Drop Hunting activity.",
      status: "listed",
      kind: "quest",
    });
  }

  for (const row of pp?.fallbackTableData?.data ?? []) {
    if (!row.key || row.isAuthProtected) continue;
    const claim = absUrl(row.linkToClaim || row.checkLink || "");
    const url = claim || absUrl(`https://cryptorank.io/drophunting/${encodeURIComponent(row.key)}`);
    if (!url) continue;
    const name = row.coin?.name || row.key;
    const types = (row.activityTypes || []).join(", ");
    const reward = row.rewardType || "activity";
    const kind = claim ? "claim" : looksLikePoints(reward) ? "points" : "quest";
    out.push({
      id: `cr-row-${row.key}`,
      name,
      url,
      source: "CryptoRank board",
      summary: [row.status, reward, types].filter(Boolean).join(" · ") || "Drop Hunting listing.",
      status: row.status || "listed",
      kind,
      extra: row.coin?.symbol || undefined,
    });
  }

  if (out.length === 0) throw new Error("CryptoRank public page returned no campaigns");
  return out;
}

const DEFAULT_TG = [
  "airdropalert",
  "AirdropInspector",
  "airdrops_io",
  "CryptoAirdrop",
  "freeairdrop",
  "CryptoAirdropsInc",
  "FreeAirdrops",
];

function telegramChannels(): string[] {
  const extra = (process.env.TELEGRAM_CHANNELS || "")
    .split(",")
    .map((s) => s.trim().replace(/^@/, ""))
    .filter(Boolean);
  return [...new Set([...DEFAULT_TG, ...extra])];
}

function parseTelegramPreview(html: string, channel: string): Campaign[] {
  const texts = [...html.matchAll(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];
  const out: Campaign[] = [];
  let n = 0;
  for (const m of texts) {
    const raw = m[1] || "";
    const text = stripHtml(raw).slice(0, 240);
    const hrefs = [...raw.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((x) => x[1].replace(/&amp;/g, "&"));
    const ext = hrefs
      .map((h) => absUrl(h))
      .filter((u): u is string => Boolean(u))
      .filter((u) => !/t\.me\/|telegram\.org/i.test(u));
    if (!ext[0] || !text) continue;
    n += 1;
    const name = text.split(/[.!|\n]/)[0]?.slice(0, 80) || text.slice(0, 80);
    out.push({
      id: `tg-${channel}-${n}-${ext[0].slice(-24)}`,
      name,
      url: ext[0],
      source: `Telegram @${channel}`,
      summary: text,
      status: "telegram",
      kind: looksLikeClaim(text) ? "claim" : "signup",
    });
  }
  return out;
}

async function fetchTelegramChannel(channel: string): Promise<Campaign[]> {
  const html = await getHtml(`https://t.me/s/${encodeURIComponent(channel)}`);
  if (!html.includes("tgme_widget_message_text")) {
    throw new Error(`no public posts for @${channel}`);
  }
  return parseTelegramPreview(html, channel);
}

async function fetchAllTelegram(): Promise<Campaign[]> {
  const chans = telegramChannels();
  const settled = await Promise.allSettled(chans.map((c) => fetchTelegramChannel(c)));
  const items: Campaign[] = [];
  for (const res of settled) {
    if (res.status === "fulfilled") items.push(...res.value);
  }
  if (items.length === 0) {
    const err = settled.find((s) => s.status === "rejected") as PromiseRejectedResult | undefined;
    throw new Error(err ? String(err.reason).slice(0, 160) : "no telegram posts");
  }
  return items;
}

async function fetchXSearch(): Promise<Campaign[]> {
  const token = process.env.X_BEARER_TOKEN?.trim();
  if (!token) {
    throw new Error("optional: set X_BEARER_TOKEN to index recent public X posts");
  }
  const q = encodeURIComponent("(airdrop OR faucet) (signup OR register OR task OR claim) -is:retweet lang:en");
  const json = (await getJson(`https://api.twitter.com/2/tweets/search/recent?query=${q}&max_results=20&tweet.fields=created_at,entities`, {
    headers: { authorization: `Bearer ${token}` },
  })) as { data?: { id: string; text: string; entities?: { urls?: { expanded_url?: string; url?: string }[] } }[] };
  const tweets = json.data ?? [];
  return tweets.flatMap((tw) => {
    const u = tw.entities?.urls?.[0]?.expanded_url || tw.entities?.urls?.[0]?.url;
    const url = absUrl(u || `https://x.com/i/web/status/${tw.id}`);
    if (!url) return [];
    return [
      {
        id: `x-${tw.id}`,
        name: tw.text.slice(0, 80),
        url,
        source: "X recent search",
        summary: tw.text.slice(0, 220),
        status: "tweet",
        kind: looksLikeClaim(tw.text) ? "claim" : "signup",
      } satisfies Campaign,
    ];
  });
}

export async function collectCampaigns(): Promise<{ items: Campaign[]; sources: SourceReport[] }> {
  const jobs: { source: string; run: () => Promise<Campaign[]> }[] = [
    { source: "Quest hubs", run: async () => HUBS },
    { source: "CryptoRank Drop Hunting", run: fetchCryptoRank },
    { source: "Galxe Trending", run: () => fetchGalxe("Trending") },
    { source: "Galxe Newest", run: () => fetchGalxe("Newest") },
    { source: "DefiLlama airdrop-checker", run: fetchLlamaAirdropConfig },
    { source: "Airdrops.io", run: () => fetchWpPosts("Airdrops.io", "https://airdrops.io/wp-json/wp/v2/posts?per_page=20&_fields=id,date,link,title,excerpt", "article") },
    {
      source: "AirdropAlert",
      run: () =>
        fetchWpPosts(
          "AirdropAlert",
          "https://airdropalert.com/wp-json/wp/v2/posts?per_page=40&categories=5&_fields=id,date,link,title,excerpt",
          "signup",
        ),
    },
    { source: "Telegram public channels", run: fetchAllTelegram },
    { source: "DexScreener new profiles", run: fetchDexProfiles },
  ];
  if (process.env.X_BEARER_TOKEN?.trim()) {
    jobs.push({ source: "X recent search", run: fetchXSearch });
  }

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
  if (!process.env.X_BEARER_TOKEN?.trim()) {
    sources.push({ source: "X recent search", ok: false, count: 0, error: "set X_BEARER_TOKEN to enable" });
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
  return { items, sources };
}
