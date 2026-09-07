import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { AddressForm } from "@/components/account/address-form";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/addresses");
  const addresses = await prisma.address.findMany({ where: { userId: user.id } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">Addresses</h1>
      {addresses.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No addresses" description="Add a delivery address for faster checkout." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
              <p className="font-medium">{a.label} · {a.fullName}</p>
              <p className="text-muted">
                {a.line1}, {a.city}, {a.state} {a.pincode}
              </p>
            </li>
          ))}
        </ul>
      )}
      <AddressForm />
    </div>
  );
}
