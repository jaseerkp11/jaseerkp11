import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PasswordForm } from "@/components/account/password-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-4xl">Security</h1>
      <PasswordForm />
    </div>
  );
}
