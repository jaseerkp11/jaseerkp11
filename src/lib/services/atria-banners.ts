import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { productCardInclude } from "@/lib/catalog";

type BannerProductInput = {
  productId: string;
  sortOrder?: number;
};

type BannerInput = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href?: string;
  placement: string;
  enabled?: boolean;
  sortOrder?: number;
  config?: Record<string, unknown>;
  products?: BannerProductInput[];
};

export async function listBannersByPlacement(placement: string) {
  return prisma.banner.findMany({
    where: { placement },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getBannerById(id: string) {
  return prisma.banner.findUnique({ where: { id } });
}

export async function createBannerItem(input: BannerInput, actorId?: string) {
  const { products, ...data } = input;
  const banner = await prisma.banner.create({
    data: {
      ...data,
      config: data.config ? JSON.stringify(data.config) : "{}",
    },
  });
  if (actorId) {
    await writeAudit({ actorId, action: "banner.create", entity: "Banner", entityId: banner.id });
  }
  return banner;
}

export async function updateBannerItem(id: string, input: BannerInput, actorId?: string) {
  const { products, ...data } = input;
  const banner = await prisma.banner.update({
    where: { id },
    data: {
      ...data,
      config: data.config ? JSON.stringify(data.config) : "{}",
    },
  });
  if (actorId) {
    await writeAudit({ actorId, action: "banner.update", entity: "Banner", entityId: id });
  }
  return banner;
}

export async function deleteBannerItem(id: string, actorId?: string) {
  await prisma.banner.delete({ where: { id } });
  if (actorId) {
    await writeAudit({ actorId, action: "banner.delete", entity: "Banner", entityId: id });
  }
}

export function parseBannerConfig(banner: { config: string }) {
  try {
    return JSON.parse(banner.config) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function getDropBySlug(slug: string) {
  const banners = await prisma.banner.findMany({
    where: { placement: "atria-drop" },
  });
  const banner = banners.find((b) => {
    const cfg = parseBannerConfig(b);
    return cfg.slug === slug;
  });
  if (!banner) return null;
  const cfg = parseBannerConfig(banner);
  const productIds = (cfg.productIds as string[]) ?? [];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, status: "ACTIVE" },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        },
      })
    : [];
  return { ...banner, config: cfg, products };
}

export async function getPublicDrops() {
  const banners = await prisma.banner.findMany({
    where: { placement: "atria-drop", enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  return banners.map((b) => ({ ...b, config: parseBannerConfig(b) }));
}

export async function getFindBySlug(slug: string) {
  const banners = await prisma.banner.findMany({
    where: { placement: "atria-find" },
  });
  const banner = banners.find((b) => {
    const cfg = parseBannerConfig(b);
    return cfg.slug === slug;
  });
  if (!banner) return null;
  const cfg = parseBannerConfig(banner);
  const productIds = (cfg.productIds as string[]) ?? [];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, status: "ACTIVE" },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        },
      })
    : [];
  return { ...banner, config: cfg, products };
}

export async function getPublicFinds() {
  const banners = await prisma.banner.findMany({
    where: { placement: "atria-find", enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  return banners.map((b) => ({ ...b, config: parseBannerConfig(b) }));
}

export async function getCollectionBySlug(slug: string) {
  const banners = await prisma.banner.findMany({
    where: { placement: "atria-collection" },
  });
  const banner = banners.find((b) => {
    const cfg = parseBannerConfig(b);
    return cfg.slug === slug;
  });
  if (!banner) return null;
  const cfg = parseBannerConfig(banner);
  const productIds = (cfg.productIds as string[]) ?? [];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, status: "ACTIVE" },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        },
      })
    : [];
  return { ...banner, config: cfg, products };
}

export async function getPublicCollections() {
  const banners = await prisma.banner.findMany({
    where: { placement: "atria-collection", enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  return banners.map((b) => ({ ...b, config: parseBannerConfig(b) }));
}
