import { NextResponse } from "next/server";
import { coverLetter, resumeHtml } from "@/lib/cv";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const job = (await req.json()) as Job;
  if (!job?.title || !job?.company) {
    return NextResponse.json({ error: "job required" }, { status: 400 });
  }
  return NextResponse.json({
    html: resumeHtml(job),
    coverLetter: coverLetter(job),
  });
}
