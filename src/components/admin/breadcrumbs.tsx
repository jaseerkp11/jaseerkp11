"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  "products/new": "New product",
  categories: "Categories",
  inventory: "Inventory",
  orders: "Orders",
  customers: "Customers",
  suppliers: "Suppliers",
  coupons: "Coupons",
  content: "Content",
  tickets: "Support",
  analytics: "Analytics",
  settings: "Settings",
  drops: "Drops",
  finds: "Finds",
  collections: "Collections",
  "demand-signals": "Demand Signals",
  recommendations: "Recommendations",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] !== "admin") return null;

  const crumbs: { href: string; label: string }[] = [{ href: "/admin", label: "Admin" }];
  let current = "";
  for (let i = 1; i < segments.length; i++) {
    current += `/${segments[i]}`;
    const key = segments.slice(1).join("/");
    const label = LABELS[key] || segments[i];
    crumbs.push({ href: `/admin${current}`, label });
  }

  return (
    <nav className="mb-4 flex items-center gap-2 text-sm text-muted">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-2">
          {i > 0 ? <span className="text-line">/</span> : null}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:underline">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
