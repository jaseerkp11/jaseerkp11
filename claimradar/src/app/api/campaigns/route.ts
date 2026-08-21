import { NextResponse } from "next/server";
import { collectCampaigns } from "@/lib/collect";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export async function GET() {
  const { items, sources, chains } = await collectCampaigns();
  return NextResponse.json(
    {
      fetchedAt: new Date().toISOString(),
      nextRefreshSec: 900,
      items,
      sources,
      chains,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=120",
      },
    },
  );
}
