import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { askAtria } from "@/lib/services/atria";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const query = String(form.get("query") ?? "").trim();
    const session = await getSessionUser();
    if (!query) return jsonError("Query required", 400);
    const result = await askAtria({
      query,
      sessionId: request.headers.get("x-session-id") ?? undefined,
      userId: session?.id,
    });
    return Response.json(result);
  } catch {
    return jsonError("Atria is taking a quick break. Try again shortly.", 500);
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return Response.json({ products: [], message: "Enter a question or request." });
  try {
    const session = await getSessionUser();
    const result = await askAtria({
      query: q,
      sessionId: request.headers.get("x-session-id") ?? undefined,
      userId: session?.id,
    });
    return Response.json(result);
  } catch {
    return jsonError("Atria is taking a quick break. Try again shortly.", 500);
  }
}
