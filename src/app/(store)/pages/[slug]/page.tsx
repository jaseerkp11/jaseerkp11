import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/config/brand";
import { sanitizeRichText } from "@/lib/sanitize";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) return { title: "Page" };
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.body.slice(0, 160),
    alternates: { canonical: publicUrl(`/pages/${page.slug}`) },
  };
}

export default async function CmsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const { slug } = await params;
  const { sent } = await searchParams;
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl">{sanitizeRichText(page.title)}</h1>
      <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[#3f3a34]">{sanitizeRichText(page.body)}</p>
      {slug === "contact" && sent ? (
        <p className="mt-6 rounded-2xl border border-line bg-card p-4 text-sm">We received your message. We will reply to the email you entered.</p>
      ) : null}
      {slug === "contact" ? (
        <form action="/api/support" method="post" className="mt-10 grid gap-3 rounded-2xl border border-line bg-card p-5">
          <input name="email" type="email" required placeholder="Email" className="h-11 rounded-xl border border-line px-3 text-sm" />
          <input name="subject" required placeholder="Subject" className="h-11 rounded-xl border border-line px-3 text-sm" />
          <input name="orderId" placeholder="Order number (optional)" className="h-11 rounded-xl border border-line px-3 text-sm" />
          <textarea name="message" required placeholder="How can we help?" className="min-h-32 rounded-xl border border-line px-3 py-2 text-sm" />
          <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Send</button>
        </form>
      ) : null}
    </div>
  );
}
