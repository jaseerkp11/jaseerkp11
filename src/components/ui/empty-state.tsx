import Link from "next/link";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
