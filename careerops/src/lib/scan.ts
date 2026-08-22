import { TITLE_HINTS } from "./profile";
import { scoreJob } from "./match";
import type { Job } from "./types";

const UA = "CareerOps/0.1 (local job match for Mohammed Jaseer; public APIs only)";
const TIMEOUT_MS = 14000;

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

function looksRelevant(title: string): boolean {
  const t = title.toLowerCase();
  return TITLE_HINTS.some((h) => t.includes(h));
}

type GhJob = {
  id: number;
  title?: string;
  absolute_url?: string;
  location?: { name?: string };
  updated_at?: string;
  content?: string;
};

async function fetchGreenhouse(board: string, company: string): Promise<Job[]> {
  const json = (await getJson(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`,
  )) as { jobs?: GhJob[] };
  const jobs = json.jobs ?? [];
  return jobs.flatMap((j) => {
    const title = j.title || "";
    if (!looksRelevant(title)) return [];
    const scored = scoreJob({
      id: `gh-${board}-${j.id}`,
      title,
      company,
      location: j.location?.name || "",
      url: j.absolute_url || `https://boards.greenhouse.io/${board}/jobs/${j.id}`,
      source: `Greenhouse · ${company}`,
      description: (j.content || "").replace(/<[^>]+>/g, " "),
      posted: j.updated_at,
    });
    return scored ? [scored] : [];
  });
}

type RemotiveJob = {
  id: number;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  url?: string;
  description?: string;
  publication_date?: string;
};

async function fetchRemotive(q: string): Promise<Job[]> {
  const json = (await getJson(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}`,
  )) as { jobs?: RemotiveJob[] };
  return (json.jobs ?? []).slice(0, 40).flatMap((j) => {
    const scored = scoreJob({
      id: `remotive-${j.id}`,
      title: j.title || "",
      company: j.company_name || "Unknown",
      location: j.candidate_required_location || "Remote",
      url: j.url || "https://remotive.com",
      source: "Remotive",
      description: j.description || "",
      posted: j.publication_date,
    });
    return scored ? [scored] : [];
  });
}

type JobicyJob = {
  id?: number | string;
  url?: string;
  jobTitle?: string;
  companyName?: string;
  jobGeo?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate?: string;
};

async function fetchJobicy(): Promise<Job[]> {
  const json = (await getJson("https://jobicy.com/api/v2/remote-jobs?count=50&tag=finance")) as {
    jobs?: JobicyJob[];
  };
  return (json.jobs ?? []).flatMap((j) => {
    const scored = scoreJob({
      id: `jobicy-${j.id}`,
      title: j.jobTitle || "",
      company: j.companyName || "Unknown",
      location: j.jobGeo || "Remote",
      url: j.url || "https://jobicy.com",
      source: "Jobicy",
      description: `${j.jobExcerpt || ""} ${j.jobDescription || ""}`,
      posted: j.pubDate,
    });
    return scored ? [scored] : [];
  });
}

export async function scanJobs(): Promise<{ jobs: Job[]; counts: { source: string; ok: boolean; count: number; error?: string }[] }> {
  const jobsList: { source: string; run: () => Promise<Job[]> }[] = [
    { source: "Greenhouse Careem (UAE)", run: () => fetchGreenhouse("careem", "Careem") },
    { source: "Greenhouse Remote.com", run: () => fetchGreenhouse("remotecom", "Remote.com") },
    { source: "Greenhouse Stripe", run: () => fetchGreenhouse("stripe", "Stripe") },
    { source: "Greenhouse Airbnb", run: () => fetchGreenhouse("airbnb", "Airbnb") },
    { source: "Remotive accountant", run: () => fetchRemotive("accountant") },
    { source: "Remotive procurement", run: () => fetchRemotive("procurement") },
    { source: "Remotive operations", run: () => fetchRemotive("operations coordinator") },
    { source: "Jobicy finance", run: fetchJobicy },
  ];

  const counts: { source: string; ok: boolean; count: number; error?: string }[] = [];
  const chunks: Job[][] = [];
  const settled = await Promise.allSettled(jobsList.map((j) => j.run()));
  settled.forEach((res, i) => {
    const source = jobsList[i].source;
    if (res.status === "fulfilled") {
      chunks.push(res.value);
      counts.push({ source, ok: true, count: res.value.length });
    } else {
      counts.push({ source, ok: false, count: 0, error: String(res.reason).slice(0, 160) });
    }
  });

  const seen = new Set<string>();
  const jobs: Job[] = [];
  for (const j of chunks.flat()) {
    const key = j.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push(j);
  }
  jobs.sort((a, b) => b.score - a.score);
  return { jobs: jobs.slice(0, 80), counts };
}
