import { emailProvider } from "@/lib/notifications/email";

export default function ForgotPasswordPage() {
  const configured = emailProvider.configured;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Reset password</h1>
      <p className="mt-3 text-sm text-muted">
        {configured
          ? "If this email exists, a reset message will be sent when the mail transport is fully connected."
          : "Password reset email cannot be sent until SMTP_HOST or RESEND_API_KEY is configured. This form will not pretend a message was delivered."}
      </p>
      <form action="/api/auth/forgot" method="post" className="mt-6 space-y-3">
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full rounded-xl border border-line px-3 text-sm" />
        <button className="h-12 w-full rounded-full bg-primary text-sm text-[#f6f1ea]" disabled={!configured}>
          {configured ? "Send reset link" : "Email provider required"}
        </button>
      </form>
    </div>
  );
}
