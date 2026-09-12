import { NextRequest } from "next/server";
import { askAtria, detectIntent, detectBudget } from "@/lib/services/therareify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query ?? "").trim();
    if (!query) return Response.json({ products: [], message: "Please enter a query." });
    const result = await askAtria({
      query,
      sessionId: request.headers.get("x-session-id") ?? undefined,
      userId: body.userId,
      intent: body.intent,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
    });
    return Response.json(result);
  } catch {
    return Response.json({ products: [], message: "TheRareify is taking a quick break. Try again shortly." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return Response.json({ products: [], message: "Enter a question or request." });
  try {
    const result = await askAtria({
      query: q,
      sessionId: request.headers.get("x-session-id") ?? undefined,
      intent: detectIntent(q).intent,
      budgetMin: detectBudget(q)?.minPaise,
      budgetMax: detectBudget(q)?.maxPaise,
    });
    return Response.json(result);
  } catch {
    return Response.json({ products: [], message: "TheRareify is taking a quick break. Try again shortly." }, { status: 500 });
  }
}
