import { prisma } from "@/lib/prisma";

export async function trackEvent(input: {
  name: string;
  path?: string;
  productId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.analyticsEvent.create({
    data: {
      name: input.name,
      path: input.path,
      productId: input.productId,
      metadata: JSON.stringify(input.metadata ?? {}),
    },
  });
}
