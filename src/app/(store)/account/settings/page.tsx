import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-4xl">Security</h1>
      <form action="/api/account/password" method="post" className="mt-6 space-y-3">
        <input name="current" type="password" required placeholder="Current password" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <input name="next" type="password" required placeholder="New password" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <button className="h-11 w-full rounded-full bg-primary text-sm text-[#f6f1ea]">Update password</button>
      </form>
    </div>
  );
}
