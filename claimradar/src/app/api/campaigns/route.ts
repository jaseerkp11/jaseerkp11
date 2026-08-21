import { NextResponse } from "next/server";
import { collectCampaigns } from "@/lib/collect";

export const revalidate = 900;

export async function GET() {
  const { items, sources } = await collectCampaigns();
  return NextResponse.json(
    {
      fetchedAt: new Date().toISOString(),
      nextRefreshSec: 900,
      items,
      sources,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=120",
      },
    },
  );
}
