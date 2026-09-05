import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const eventType = String(body.eventType ?? "page_view");
  const metadata = (body.metadata ?? {}) as Record<string, unknown>;
  const anonymousId = crypto.randomUUID();
  await prisma.analyticsEvent.create({
    data: {
      name: eventType,
      path: String(body.path ?? "/"),
      productId: metadata.productId ? String(metadata.productId) : undefined,
      metadata: JSON.stringify({ ...metadata, anonymousId }),
    },
  });
  return Response.json({ ok: true, anonymousId });
}
