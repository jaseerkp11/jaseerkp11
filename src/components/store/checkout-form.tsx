"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldName =
  | "email"
  | "phone"
  | "fullName"
  | "addrPhone"
  | "line1"
  | "line2"
  | "city"
  | "state"
  | "pincode";

function inputClass(invalid?: string) {
  return `h-11 w-full rounded-xl border px-3 text-sm ${
    invalid ? "border-[#9b2c2c] bg-[#f8ecec]" : "border-line"
  }`;
}

export function CheckoutForm({
  defaults,
  items,
  subtotalLabel,
  deliveryLabel,
  totalLabel,
}: {
  defaults: Record<FieldName, string>;
  items: Array<{ id: string; name: string; quantity: number; lineLabel: string }>;
  subtotalLabel: string;
  deliveryLabel: string;
  totalLabel: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(defaults);
  const [fields, setFields] = useState<Partial<Record<string, string>>>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function setField(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setFields((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        orderNumber?: string;
        message?: string;
        fields?: Record<string, string>;
      };
      if (data.ok && data.orderNumber) {
        router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`);
        return;
      }
      setFields(data.fields ?? {});
      setMessage(data.message ?? "Please correct the highlighted fields.");
    } catch {
      setMessage("The order could not be saved. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
      {message ? (
        <p className="rounded-2xl border border-[#9b2c2c]/30 bg-[#f8ecec] px-4 py-3 text-sm text-[#9b2c2c]">{message}</p>
      ) : null}
      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-medium">1. Customer</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Email
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Email"
              className={`mt-1 ${inputClass(fields.email)}`}
            />
            {fields.email ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.email}</span> : null}
          </label>
          <label className="text-sm">
            Mobile
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="10-digit mobile"
              className={`mt-1 ${inputClass(fields.phone)}`}
            />
            {fields.phone ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.phone}</span> : null}
          </label>
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-medium">2. Address</h2>
        <div className="mt-4 grid gap-3">
          <label className="text-sm">
            Full name
            <input
              name="fullName"
              value={values.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Full name"
              className={`mt-1 ${inputClass(fields.fullName)}`}
            />
            {fields.fullName ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.fullName}</span> : null}
          </label>
          <label className="text-sm">
            Delivery mobile
            <input
              name="addrPhone"
              type="tel"
              value={values.addrPhone}
              onChange={(e) => setField("addrPhone", e.target.value)}
              placeholder="Delivery mobile"
              className={`mt-1 ${inputClass(fields.addrPhone)}`}
            />
            {fields.addrPhone ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.addrPhone}</span> : null}
          </label>
          <label className="text-sm">
            House / street
            <input
              name="line1"
              value={values.line1}
              onChange={(e) => setField("line1", e.target.value)}
              placeholder="House / street"
              className={`mt-1 ${inputClass(fields.line1)}`}
            />
            {fields.line1 ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.line1}</span> : null}
          </label>
          <label className="text-sm">
            Landmark (optional)
            <input
              name="line2"
              value={values.line2}
              onChange={(e) => setField("line2", e.target.value)}
              placeholder="Landmark (optional)"
              className={`mt-1 ${inputClass(fields.line2)}`}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              City
              <input
                name="city"
                value={values.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="City"
                className={`mt-1 ${inputClass(fields.city)}`}
              />
              {fields.city ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.city}</span> : null}
            </label>
            <label className="text-sm">
              State
              <input
                name="state"
                value={values.state}
                onChange={(e) => setField("state", e.target.value)}
                placeholder="State"
                className={`mt-1 ${inputClass(fields.state)}`}
              />
              {fields.state ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.state}</span> : null}
            </label>
            <label className="text-sm">
              Pincode
              <input
                name="pincode"
                inputMode="numeric"
                value={values.pincode}
                onChange={(e) => setField("pincode", e.target.value)}
                placeholder="Pincode"
                className={`mt-1 ${inputClass(fields.pincode)}`}
              />
              {fields.pincode ? <span className="mt-1 block text-xs text-[#9b2c2c]">{fields.pincode}</span> : null}
            </label>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-medium">3. Review</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{item.lineLabel}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Goods</dt>
            <dd>{subtotalLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{deliveryLabel}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd>{totalLabel}</dd>
          </div>
        </dl>
      </section>
      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-medium">4. Payment</h2>
        <p className="mt-3 text-sm">
          <strong>Cash on delivery</strong>
          <span className="mt-1 block text-muted">Pay ₹80 delivery plus the goods total in cash when the parcel arrives.</span>
        </p>
      </section>
      {fields.form ? <p className="text-sm text-[#9b2c2c]">{fields.form}</p> : null}
      <button disabled={pending} className="h-12 w-full rounded-full bg-primary text-sm text-[#f6f1ea] disabled:opacity-60">
        {pending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
