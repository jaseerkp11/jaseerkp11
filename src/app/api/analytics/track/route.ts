import { NextRequest } from "next/server";
import { trackEvent } from "@/lib/analytics/track";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await trackEvent({
      name: body.name,
      path: body.path,
      productId: body.productId,
      metadata: body.metadata,
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
