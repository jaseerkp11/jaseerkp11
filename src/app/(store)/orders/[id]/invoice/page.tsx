import { notFound, redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument } from "@/components/store/invoice-document";
import { getStoreSettings } from "@/lib/services/store-settings";
import { PrintButton } from "@/components/admin/print-button";

export const dynamic = "force-dynamic";

export default async function CustomerInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  if (order.customerId !== user.id && !isStaff(user.role)) notFound();
  const settings = await getStoreSettings();
  return (
    <div className="px-4 py-8">
      <PrintButton />
      <InvoiceDocument order={order} settings={settings} />
    </div>
  );
}
