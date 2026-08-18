import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Create account</h1>
      {params.error ? <p className="mt-4 text-sm text-[#9b2c2c]">{params.error}</p> : null}
      <form action="/api/auth/register" method="post" className="mt-6 space-y-3">
        <input name="name" required placeholder="Name" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <input name="phone" placeholder="Phone" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <input name="password" type="password" required placeholder="Password (min 8)" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <button className="h-12 w-full rounded-full bg-primary text-sm text-[#f6f1ea]">Register</button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
