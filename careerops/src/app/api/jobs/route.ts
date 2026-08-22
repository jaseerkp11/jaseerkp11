import { NextResponse } from "next/server";
import { PROFILE } from "@/lib/profile";
import { scanJobs } from "@/lib/scan";

export const dynamic = "force-dynamic";

export async function GET() {
  const { jobs, counts } = await scanJobs();
  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    profile: PROFILE.fullName,
    counts,
    jobs,
  });
}
