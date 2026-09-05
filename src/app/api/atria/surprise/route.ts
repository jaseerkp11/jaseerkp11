import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { surpriseMe } from "@/lib/services/atria";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const exclude = request.nextUrl.searchParams.get("exclude") ?? undefined;
    const product = await surpriseMe({
      sessionId: request.headers.get("x-session-id") ?? undefined,
      userId: session?.id,
      excludeProductId: exclude ?? undefined,
    });
    if (!product) return jsonError("No products available right now.", 404);
    return Response.json({ product });
  } catch {
    return jsonError("Atria is taking a quick break. Try again shortly.", 500);
  }
}
