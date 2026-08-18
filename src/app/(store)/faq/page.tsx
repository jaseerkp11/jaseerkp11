import { prisma } from "@/lib/prisma";
import { ensureBusinessPages } from "@/lib/services/business-pages";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  await ensureBusinessPages();
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl">FAQ</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <section key={faq.id} className="rounded-2xl border border-line bg-card p-5">
            <h2 className="font-medium">{faq.question}</h2>
            <p className="mt-2 text-sm leading-6 text-[#3f3a34]">{faq.answer}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
