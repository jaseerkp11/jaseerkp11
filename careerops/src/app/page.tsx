"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Job, ScanPayload } from "@/lib/types";

type Status = "new" | "saved" | "applied" | "skip";

export default function HomePage() {
  const [data, setData] = useState<ScanPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [fit, setFit] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [pack, setPack] = useState<{ id: string; html: string; coverLetter: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((await res.json()) as ScanPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "scan failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    try {
      const raw = localStorage.getItem("careerops-status");
      if (raw) setStatuses(JSON.parse(raw) as Record<string, Status>);
    } catch {
      /* ignore */
    }
  }, [load]);

  function setStatus(id: string, s: Status) {
    const next = { ...statuses, [id]: s };
    setStatuses(next);
    localStorage.setItem("careerops-status", JSON.stringify(next));
  }

  const rows = useMemo(() => {
    return (data?.jobs ?? []).filter((j) => {
      if (fit !== "all" && j.fit !== fit) return false;
      const st = statuses[j.id] || "new";
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (!q.trim()) return true;
      const hay = `${j.title} ${j.company} ${j.location} ${j.why.join(" ")}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [data, q, fit, statusFilter, statuses]);

  async function tailor(job: Job) {
    setBusyId(job.id);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(job),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { html: string; coverLetter: string };
      setPack({ id: job.id, html: json.html, coverLetter: json.coverLetter });
    } catch (e) {
      setError(e instanceof Error ? e.message : "CV failed");
    } finally {
      setBusyId(null);
    }
  }

  function downloadHtml(job: Job) {
    if (!pack || pack.id !== job.id) return;
    const blob = new Blob([pack.html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Mohammed_Jaseer_${job.company.replace(/\W+/g, "_")}.html`;
    a.click();
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 80px" }}>
      <p style={{ letterSpacing: "0.14em", fontSize: 12, color: "#6a5a3a", margin: 0 }}>LOCAL JOB DESK</p>
      <h1 style={{ margin: "6px 0 8px", color: "#0F2C3C" }}>CareerOps</h1>
      <p style={{ lineHeight: 1.5, maxWidth: 760, color: "#3a4650" }}>
        Built for <strong>Mohammed Jaseer</strong> (Accountant / procurement / operations, UAE Abu Dhabi experience).
        It scans public job APIs, scores roles against your CV, and builds an ATS HTML resume + cover letter per job.
        You open the apply link and submit yourself — this does <strong>not</strong> auto-fill Greenhouse/LinkedIn forms
        (that violates most site terms and is not what the open-source Career-Ops tool does either; it drafts answers for you to paste).
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, company, city" style={inp} />
        <select value={fit} onChange={(e) => setFit(e.target.value)} style={inp}>
          <option value="all">all fits</option>
          <option value="strong">strong</option>
          <option value="possible">possible</option>
          <option value="stretch">stretch</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inp}>
          <option value="all">all statuses</option>
          <option value="new">new</option>
          <option value="saved">saved</option>
          <option value="applied">applied</option>
          <option value="skip">skip</option>
        </select>
        <button type="button" onClick={() => void load()} style={btn}>
          Rescan
        </button>
      </div>

      <p style={{ fontSize: 13, color: "#5A6570" }}>
        {loading ? "Scanning public boards…" : `${rows.length} matched roles`}
        {data?.fetchedAt ? ` · ${new Date(data.fetchedAt).toLocaleString()}` : ""}
      </p>
      {data?.counts && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {data.counts.map((s) => (
            <span key={s.source} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, background: s.ok ? "#e3f4ea" : "#f8d8d8" }}>
              {s.source}: {s.ok ? s.count : s.error}
            </span>
          ))}
        </div>
      )}
      {error && <p style={{ color: "#a33" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {rows.map((j) => {
          const st = statuses[j.id] || "new";
          const open = pack?.id === j.id;
          return (
            <li key={j.id} style={{ background: "#fff", border: "1px solid #e2d8c4", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <strong>
                  {j.title} · {j.company}
                </strong>
                <span style={{ fontSize: 12, color: "#5A6570" }}>
                  score {j.score} · {j.fit} · {st}
                </span>
              </div>
              <p style={{ margin: "6px 0", color: "#5A6570", fontSize: 13 }}>
                {j.location || "Location n/a"} · {j.source}
              </p>
              <p style={{ margin: "0 0 8px", fontSize: 14 }}>{j.why.join(" · ")}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={j.url} target="_blank" rel="noreferrer" style={link}>
                  Open apply page
                </a>
                <button type="button" onClick={() => void tailor(j)} style={btnGhost} disabled={busyId === j.id}>
                  {busyId === j.id ? "Tailoring…" : "Tailor CV + letter"}
                </button>
                <button type="button" onClick={() => setStatus(j.id, "saved")} style={btnGhost}>
                  Save
                </button>
                <button type="button" onClick={() => setStatus(j.id, "applied")} style={btnGhost}>
                  Mark applied
                </button>
                <button type="button" onClick={() => setStatus(j.id, "skip")} style={btnGhost}>
                  Skip
                </button>
              </div>
              {open && (
                <div style={{ marginTop: 12 }}>
                  <button type="button" onClick={() => downloadHtml(j)} style={btn}>
                    Download ATS HTML (Print → PDF)
                  </button>
                  <pre style={{ whiteSpace: "pre-wrap", background: "#f6f1e6", padding: 12, borderRadius: 10, fontSize: 13 }}>
                    {pack.coverLetter}
                  </pre>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

const inp: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d9d2c5",
  background: "#fff",
};
const btn: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: 0,
  background: "#0F2C3C",
  color: "#fff",
  fontWeight: 600,
};
const btnGhost: CSSProperties = {
  ...btn,
  background: "#eef4f7",
  color: "#0F2C3C",
};
const link: CSSProperties = { color: "#0F2C3C", fontWeight: 600, padding: "10px 0" };
