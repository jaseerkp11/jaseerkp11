import { redirect } from "next/navigation";

export default async function CheckoutFailurePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  redirect(error ? `/checkout?error=${encodeURIComponent(error)}` : "/checkout?error=save");
}
