import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { productCardInclude } from "@/lib/catalog";

type SectionProductInput = {
  productId: string;
  sortOrder?: number;
};

type SectionInput = {
  key: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href?: string;
  placement?: string;
  enabled?: boolean;
  sortOrder?: number;
  config?: Record<string, unknown>;
  products?: SectionProductInput[];
};

export async function listSectionsByPrefix(prefix: string) {
  return prisma.homepageSection.findMany({
    where: { key: { startsWith: prefix } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSectionById(id: string) {
  return prisma.homepageSection.findUnique({ where: { id } });
}

export async function createSectionItem(input: SectionInput, actorId?: string) {
  const section = await prisma.homepageSection.create({
    data: {
      key: input.key,
      title: input.title,
      config: input.config ? JSON.stringify(input.config) : "{}",
      enabled: input.enabled ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  if (actorId) {
    await writeAudit({ actorId, action: "section.create", entity: "HomepageSection", entityId: section.id });
  }
  return section;
}

export async function updateSectionItem(id: string, input: SectionInput, actorId?: string) {
  const section = await prisma.homepageSection.update({
    where: { id },
    data: {
      key: input.key,
      title: input.title,
      config: input.config !== undefined ? JSON.stringify(input.config) : undefined,
      enabled: input.enabled ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  if (actorId) {
    await writeAudit({ actorId, action: "section.update", entity: "HomepageSection", entityId: id });
  }
  return section;
}

export async function deleteSectionItem(id: string, actorId?: string) {
  await prisma.homepageSection.delete({ where: { id } });
  if (actorId) {
    await writeAudit({ actorId, action: "section.delete", entity: "HomepageSection", entityId: id });
  }
}

export function parseSectionConfig(section: { config: string }) {
  try {
    return JSON.parse(section.config) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function getDropBySlug(slug: string) {
  const sections = await prisma.homepageSection.findMany({
    where: { key: { startsWith: "drop-" } },
  });
  const section = sections.find((s) => {
    const cfg = parseSectionConfig(s);
    return cfg.slug === slug;
  });
  if (!section) return null;
  const cfg = parseSectionConfig(section);
  const productIds = (cfg.productIds as string[]) ?? [];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, status: "ACTIVE" },
        include: productCardInclude,
      })
    : [];
  return { section, config: cfg, products };
}

export async function getPublicDrops() {
  return prisma.homepageSection.findMany({
    where: { key: { startsWith: "drop-" }, enabled: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFindBySlug(slug: string) {
  const sections = await prisma.homepageSection.findMany({
    where: { key: { startsWith: "find-" } },
  });
  const section = sections.find((s) => {
    const cfg = parseSectionConfig(s);
    return cfg.slug === slug;
  });
  if (!section) return null;
  const cfg = parseSectionConfig(section);
  const productIds = (cfg.productIds as string[]) ?? [];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, status: "ACTIVE" },
        include: productCardInclude,
      })
    : [];
  return { section, config: cfg, products };
}

export async function getPublicFinds() {
  return prisma.homepageSection.findMany({
    where: { key: { startsWith: "find-" }, enabled: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCollectionBySlug(slug: string) {
  const sections = await prisma.homepageSection.findMany({
    where: { key: { startsWith: "collection-" } },
  });
  const section = sections.find((s) => {
    const cfg = parseSectionConfig(s);
    return cfg.slug === slug;
  });
  if (!section) return null;
  const cfg = parseSectionConfig(section);
  const productIds = (cfg.productIds as string[]) ?? [];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, status: "ACTIVE" },
        include: productCardInclude,
      })
    : [];
  return { section, config: cfg, products };
}

export async function getPublicCollections() {
  return prisma.homepageSection.findMany({
    where: { key: { startsWith: "collection-" }, enabled: true },
    orderBy: { sortOrder: "asc" },
  });
}
