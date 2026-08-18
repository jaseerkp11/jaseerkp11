import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument } from "@/components/store/invoice-document";
import { getStoreSettings } from "@/lib/services/store-settings";
import { PrintButton } from "@/components/admin/print-button";

export const dynamic = "force-dynamic";

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const settings = await getStoreSettings();
  return (
    <div>
      <PrintButton />
      <InvoiceDocument order={order} settings={settings} />
    </div>
  );
}
