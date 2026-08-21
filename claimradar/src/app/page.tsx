"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CampaignPayload } from "@/lib/types";

export default function HomePage() {
  const [data, setData] = useState<CampaignPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
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

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((i) => {
      if (source !== "all" && i.source !== source) return false;
      if (!q.trim()) return true;
      const hay = `${i.name} ${i.summary} ${i.url}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [data, q, source]);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px 80px" }}>
      <p style={{ color: "#8b9bb4", letterSpacing: "0.14em", fontSize: 12, margin: 0 }}>PUBLIC INDEX</p>
      <h1 style={{ fontSize: 32, margin: "6px 0 8px" }}>ClaimRadar</h1>
      <p style={{ color: "#b7c3d6", lineHeight: 1.5, maxWidth: 720 }}>
        Lists <strong>public</strong> quest hubs, Galxe campaigns, DefiLlama airdrop-checker projects, Airdrops.io posts, and new DexScreener profiles.
        You open the link and sign up yourself. This app does <strong>not</strong> create accounts, complete tasks, or withdraw tokens.
      </p>
      <p style={{ color: "#f0c36d", fontSize: 14, lineHeight: 1.45 }}>
        Many “free $1 / instant swap” posts are scams or die in hours. Never paste a seed phrase. Prefer the official domain. Points are often not cash.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or URL"
          style={{ flex: 1, minWidth: 180, padding: "10px 12px", borderRadius: 10, border: "1px solid #243044", background: "#101624", color: "#fff" }}
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #243044", background: "#101624", color: "#fff" }}
        >
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          style={{ padding: "10px 14px", borderRadius: 10, border: 0, background: "#3d7cff", color: "#fff", fontWeight: 600 }}
        >
          Refresh
        </button>
      </div>

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
                {c.status ? ` · ${c.status}` : ""}
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
