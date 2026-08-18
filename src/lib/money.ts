export type MoneyMinor = number;

export function paise(amount: number): MoneyMinor {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount);
}

export function rupeesToPaise(rupees: number): MoneyMinor {
  return Math.round(rupees * 100);
}

export function formatMoney(
  minor: MoneyMinor,
  currency = "INR",
  symbol = "₹",
): string {
  const value = (minor / 100).toFixed(2);
  if (currency === "INR") {
    const [whole, fraction] = value.split(".");
    const formatted = formatIndianWhole(whole);
    return fraction === "00" ? `${symbol}${formatted}` : `${symbol}${formatted}.${fraction}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(minor / 100);
}

function formatIndianWhole(whole: string): string {
  const negative = whole.startsWith("-");
  const digits = negative ? whole.slice(1) : whole;
  if (digits.length <= 3) return `${negative ? "-" : ""}${digits}`;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${grouped},${lastThree}`;
}

export function profitPaise(selling: MoneyMinor, cost: MoneyMinor): MoneyMinor {
  return selling - cost;
}

export function marginPercent(selling: MoneyMinor, cost: MoneyMinor): number {
  if (selling <= 0) return 0;
  return Number((((selling - cost) / selling) * 100).toFixed(2));
}

export type OrderTotals = {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
};

export function computeOrderTotals(input: {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
}): OrderTotals {
  const subtotalPaise = Math.max(0, paise(input.subtotalPaise));
  const discountPaise = Math.min(subtotalPaise, Math.max(0, paise(input.discountPaise)));
  const shippingPaise = Math.max(0, paise(input.shippingPaise));
  const taxable = Math.max(0, subtotalPaise - discountPaise);
  const taxPaise = Math.max(0, paise(input.taxPaise));
  const totalPaise = taxable + shippingPaise + taxPaise;
  return { subtotalPaise, discountPaise, shippingPaise, taxPaise, totalPaise };
}

export function applyCouponDiscount(input: {
  type: "PERCENTAGE" | "FIXED";
  value: number;
  subtotalPaise: number;
  maxDiscountPaise?: number | null;
}): number {
  const subtotal = Math.max(0, input.subtotalPaise);
  let discount =
    input.type === "PERCENTAGE"
      ? Math.round((subtotal * input.value) / 100)
      : input.value;
  if (input.maxDiscountPaise != null) {
    discount = Math.min(discount, input.maxDiscountPaise);
  }
  return Math.max(0, Math.min(subtotal, discount));
}
