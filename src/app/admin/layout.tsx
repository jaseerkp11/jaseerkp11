import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isStaff } from "@/lib/auth";
import { getBrand } from "@/config/brand";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/products/new", label: "Add product" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || !isStaff(user.role)) redirect("/login?next=/admin");
  const brand = getBrand();

  return (
    <div className="flex min-h-screen bg-[#ece7e0] text-foreground">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-[#161513] text-[#f6f1ea] md:block">
        <div className="px-5 py-6">
          <p className="text-xs uppercase tracking-widest text-[#b7b0a6]">Admin</p>
          <p className="font-display text-2xl">{brand.brandName}</p>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-8 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 hover:bg-white/10">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="mt-4 rounded-lg px-3 py-2 text-[#c4a574]">
            View store
          </Link>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-card px-4 py-3">
          <p className="text-sm">
            {user.name} · {user.role}
          </p>
          <Link href="/admin/products/new" className="rounded-full bg-primary px-4 py-2 text-sm text-[#f6f1ea]">
            New product
          </Link>
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
