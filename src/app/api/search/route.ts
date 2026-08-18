import { NextRequest } from "next/server";
import { searchProvider } from "@/lib/search/provider";
import { jsonError } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return Response.json({ hits: [] });
  try {
    const hits = await searchProvider.suggest(q);
    return Response.json({ hits });
  } catch {
    return jsonError("Search unavailable", 500);
  }
}
