import { prisma } from "@/lib/prisma";
import { getBrand } from "@/config/brand";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { loadCart } from "@/lib/services/cart";
import { connection } from "next/server";
import { SetupRequired } from "@/components/store/setup-required";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { ensureBusinessPages } from "@/lib/services/business-pages";

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
    await ensureBusinessPages();
  } catch {
    dbOk = false;
  }

  if (!dbOk) {
    return <SetupRequired />;
  }

  return (
    <>
      <Header categories={categories} cartCount={cartCount} brandName={brand.brandName} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <WhatsAppButton />
    </>
  );
}
