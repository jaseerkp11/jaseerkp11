export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description: string;
  posted?: string;
  score: number;
  why: string[];
  fit: "strong" | "possible" | "stretch";
};

export type ScanPayload = {
  fetchedAt: string;
  profile: string;
  counts: { source: string; ok: boolean; count: number; error?: string }[];
  jobs: Job[];
};
