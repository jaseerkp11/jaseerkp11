import { formatMoney } from "@/lib/money";
import { getBrand } from "@/config/brand";
import type { StoreSettings } from "@/lib/services/store-settings";

type InvoiceOrder = {
  orderNumber: string;
  createdAt: Date;
  email: string;
  phone: string;
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  shippingMethod: string | null;
  trackingNumber: string | null;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  paymentStatus: string;
  status: string;
  items: Array<{
    name: string;
    sku: string;
    variantLabel: string;
    quantity: number;
    unitPricePaise: number;
  }>;
};

export function InvoiceDocument({
  order,
  settings,
}: {
  order: InvoiceOrder;
  settings: StoreSettings;
}) {
  const brand = getBrand();
  const taxInvoice = Boolean(settings.gstin);
  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-[#161513] print:max-w-none print:p-0">
      <div className="flex justify-between gap-6">
        <div>
          <p className="font-display text-3xl">{brand.brandName}</p>
          <p className="mt-1 text-sm">{brand.legalName}</p>
          {settings.businessAddress ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-[#3f3a34]">{settings.businessAddress}</p>
          ) : null}
          {settings.gstin ? <p className="mt-2 text-sm">GSTIN {settings.gstin}</p> : null}
          {settings.pan ? <p className="text-sm">PAN {settings.pan}</p> : null}
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">{taxInvoice ? "Tax invoice" : "Bill of supply"}</p>
          <p className="mt-1">{order.orderNumber}</p>
          <p>{order.createdAt.toLocaleString("en-IN")}</p>
          <p className="mt-2">Payment: {order.paymentStatus.replaceAll("_", " ")}</p>
          <p>Status: {order.status.replaceAll("_", " ")}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#6f675e]">Bill to / ship to</p>
          <p className="mt-2 font-medium">{order.shippingName}</p>
          <p>{order.shippingLine1}</p>
          {order.shippingLine2 ? <p>{order.shippingLine2}</p> : null}
          <p>
            {order.shippingCity}, {order.shippingState} {order.shippingPincode}
          </p>
          <p>{order.shippingPhone}</p>
          <p>{order.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#6f675e]">Delivery</p>
          <p className="mt-2">{order.shippingMethod ?? "Standard"}</p>
          {order.trackingNumber ? <p>Tracking {order.trackingNumber}</p> : <p>Tracking not assigned yet</p>}
        </div>
      </div>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#d9d1c7]">
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            <th className="py-2">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={`${item.sku}-${item.name}`} className="border-b border-[#efe8de]">
              <td className="py-2">
                {item.name}
                {item.variantLabel ? ` (${item.variantLabel})` : ""}
              </td>
              <td className="py-2">{item.sku}</td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2 text-right">{formatMoney(item.unitPricePaise * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
        <p className="flex justify-between">
          <span>Goods</span>
          <span>{formatMoney(order.subtotalPaise)}</span>
        </p>
        <p className="flex justify-between">
          <span>Discount</span>
          <span>-{formatMoney(order.discountPaise)}</span>
        </p>
        <p className="flex justify-between">
          <span>Shipping</span>
          <span>{formatMoney(order.shippingPaise)}</span>
        </p>
        <p className="flex justify-between font-medium">
          <span>Total</span>
          <span>{formatMoney(order.totalPaise)}</span>
        </p>
      </div>
      <p className="mt-8 text-xs text-[#6f675e]">{settings.invoiceNote}</p>
      <p className="mt-2 text-xs text-[#6f675e]">Prices include tax. Cash on delivery is collected when the parcel arrives.</p>
    </div>
  );
}
