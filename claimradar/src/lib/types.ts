export type Campaign = {
  id: string;
  name: string;
  url: string;
  source: string;
  summary: string;
  status: string;
  kind?: string;
  extra?: string;
};

export type SourceReport = {
  source: string;
  ok: boolean;
  count: number;
  error?: string;
};

export type CampaignPayload = {
  fetchedAt: string;
  nextRefreshSec: number;
  items: Campaign[];
  sources: SourceReport[];
};
