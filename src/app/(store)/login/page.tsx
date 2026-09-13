import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  return (
    <LoginInner searchParams={searchParams} />
  );
}

async function LoginInner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Passwords are hashed. There is no social login until you add a provider.</p>
      {params.error ? <p className="mt-4 text-sm text-[#9b2c2c]">{params.error}</p> : null}
      <form action="/api/auth/login" method="post" className="mt-6 space-y-3">
        <input type="hidden" name="next" value={params.next ?? "/account"} />
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <input name="password" type="password" required placeholder="Password" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <button className="h-12 w-full rounded-full bg-primary text-sm text-[#f6f1ea]">Sign in</button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/register" className="underline">
          Create an account
        </Link>
        {" · "}
        <Link href="/forgot-password" className="underline">
          Forgot password
        </Link>
      </p>
    </div>
  );
}
