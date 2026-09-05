import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function listSectionsByPrefix(prefix: string) {
  return prisma.homepageSection.findMany({
    where: { key: { startsWith: prefix } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createSectionItem(input: {
  id?: string;
  key: string;
  title: string;
  enabled: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
}) {
  const section = await prisma.homepageSection.create({
    data: {
      id: input.id ?? crypto.randomUUID(),
      key: input.key,
      title: input.title,
      config: JSON.stringify(input.config),
      enabled: input.enabled,
      sortOrder: input.sortOrder,
    },
  });
  return section;
}

export async function getSectionById(id: string) {
  return prisma.homepageSection.findUnique({ where: { id } });
}

export async function updateSectionItem(id: string, data: Record<string, unknown>, actorId?: string) {
  const section = await prisma.homepageSection.update({
    where: { id },
    data: {
      ...(data.key ? { key: data.key as string } : {}),
      ...(data.title ? { title: data.title as string } : {}),
      ...(data.enabled !== undefined ? { enabled: data.enabled as boolean } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder as number } : {}),
      ...(data.config ? { config: JSON.stringify(data.config) } : {}),
    },
  });
  if (actorId) {
    await writeAudit({ actorId, action: "update", entity: "homepageSection", entityId: id, metadata: data as Record<string, unknown> });
  }
  return section;
}

export async function deleteSectionItem(id: string, actorId?: string) {
  await prisma.homepageSection.delete({ where: { id } });
  if (actorId) {
    await writeAudit({ actorId, action: "delete", entity: "homepageSection", entityId: id });
  }
}

export function parseSectionConfig(section: { config: string }) {
  try {
    return JSON.parse(section.config);
  } catch {
    return {};
  }
}
