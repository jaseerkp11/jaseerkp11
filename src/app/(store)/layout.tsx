import { prisma } from "@/lib/prisma";
import { getBrand } from "@/config/brand";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { loadCart } from "@/lib/services/cart";
import { connection } from "next/server";
import { SetupRequired } from "@/components/store/setup-required";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const brand = getBrand();
  let categories: Array<{ name: string; slug: string }> = [];
  let cartCount = 0;
  let announcement: string | null = null;
  let dbOk = true;
  try {
    categories = await prisma.category.findMany({
      where: { status: "ACTIVE", parentId: null },
      orderBy: { sortOrder: "asc" },
      take: 12,
      select: { name: true, slug: true },
    });
    const cart = await loadCart();
    cartCount = cart
      ? cart.items.filter((i) => !i.savedForLater).reduce((s, i) => s + i.quantity, 0)
      : 0;
    const setting = await prisma.siteSetting.findUnique({
      where: { id: "announcement" },
    });
    announcement = setting?.value ?? null;
  } catch {
    dbOk = false;
  }

  if (!dbOk) {
    return <SetupRequired />;
  }

  return (
    <>
      {announcement ? (
        <div className="bg-primary px-4 py-2 text-center text-xs text-[#f6f1ea] sm:text-sm">
          {announcement}
        </div>
      ) : null}
      <Header categories={categories} cartCount={cartCount} brandName={brand.brandName} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </>
  );
}
