"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { CampaignPayload } from "@/lib/types";

export default function HomePage() {
  const [data, setData] = useState<CampaignPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
  const [kind, setKind] = useState("all");
  const [hidePoints, setHidePoints] = useState(true);
  const [hideListings, setHideListings] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as CampaignPayload;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const sources = useMemo(() => {
    const s = new Set(data?.items.map((i) => i.source) ?? []);
    return ["all", ...Array.from(s)];
  }, [data]);

  const kinds = useMemo(() => {
    const s = new Set((data?.items.map((i) => i.kind).filter(Boolean) as string[]) ?? []);
    return ["all", ...Array.from(s)];
  }, [data]);

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((i) => {
      if (hidePoints && i.kind === "points") return false;
      if (hideListings && i.kind === "listing") return false;
      if (source !== "all" && i.source !== source) return false;
      if (kind !== "all" && i.kind !== kind) return false;
      if (!q.trim()) return true;
      const hay = `${i.name} ${i.summary} ${i.url}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [data, q, source, kind, hidePoints, hideListings]);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px 80px" }}>
      <p style={{ color: "#8b9bb4", letterSpacing: "0.14em", fontSize: 12, margin: 0 }}>PUBLIC SCANNER</p>
      <h1 style={{ fontSize: 32, margin: "6px 0 8px" }}>ClaimRadar</h1>
      <p style={{ color: "#b7c3d6", lineHeight: 1.5, maxWidth: 740 }}>
        Pulls public Telegram channel previews, AirdropAlert, Airdrops.io, Galxe, DefiLlama, quest hubs, and optional X search.
        Each row is a <strong>name + link</strong>. You open it and do signup/tasks yourself. No auto-accounts.
      </p>
      <p style={{ color: "#9aa8bd", fontSize: 13 }}>
        Default view hides Galxe-style <em>points</em> and DexScreener <em>listings</em>. Turn those boxes off if you want them. Verify every site yourself.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0", alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, task, URL"
          style={{ flex: 1, minWidth: 180, padding: "10px 12px", borderRadius: 10, border: "1px solid #243044", background: "#101624", color: "#fff" }}
        />
        <select value={source} onChange={(e) => setSource(e.target.value)} style={sel}>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} style={sel}>
          {kinds.map((s) => (
            <option key={s} value={s}>
              kind: {s}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => void load()} style={btn}>
          Refresh
        </button>
      </div>
      <label style={lab}>
        <input type="checkbox" checked={hidePoints} onChange={(e) => setHidePoints(e.target.checked)} /> Hide points quests (Galxe XP)
      </label>
      <label style={lab}>
        <input type="checkbox" checked={hideListings} onChange={(e) => setHideListings(e.target.checked)} /> Hide DexScreener token listings
      </label>

      <p style={{ color: "#8b9bb4", fontSize: 13 }}>
        {loading ? "Loading…" : `${rows.length} rows`}
        {data?.fetchedAt ? ` · last fetch ${new Date(data.fetchedAt).toLocaleString()}` : ""}
        {" · auto-refresh 15 min"}
      </p>

      {data?.sources && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {data.sources.map((s) => (
            <span
              key={s.source}
              style={{
                fontSize: 12,
                padding: "4px 8px",
                borderRadius: 999,
                background: s.ok ? "#12351f" : "#3a1515",
                color: s.ok ? "#8ee0a8" : "#ffb4b4",
              }}
            >
              {s.source}: {s.ok ? s.count : s.error || "fail"}
            </span>
          ))}
        </div>
      )}

      {error && <p style={{ color: "#ff8a8a" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
        {rows.map((c) => (
          <li key={c.id} style={{ background: "#101624", border: "1px solid #1c2740", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <strong>{c.name}</strong>
              <span style={{ color: "#8b9bb4", fontSize: 12 }}>
                {c.source}
                {c.kind ? ` · ${c.kind}` : ""}
              </span>
            </div>
            <p style={{ margin: "8px 0", color: "#c5d0e0", fontSize: 14 }}>{c.summary}</p>
            <a href={c.url} target="_blank" rel="noreferrer noopener" style={{ color: "#7eb0ff", fontSize: 13, wordBreak: "break-all" }}>
              {c.url}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

const sel: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #243044",
  background: "#101624",
  color: "#fff",
};
const btn: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: 0,
  background: "#3d7cff",
  color: "#fff",
  fontWeight: 600,
};
const lab: CSSProperties = {
  display: "inline-flex",
  gap: 6,
  alignItems: "center",
  marginRight: 14,
  marginBottom: 10,
  color: "#c5d0e0",
  fontSize: 13,
};
