import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ page, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value !== "undefined") params.set(key, value);
    });
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `${baseUrl}${qs ? `?${qs}` : ""}`;
  };

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4) pages.push("...");
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) {
      pages.push(i);
    }
    if (page < totalPages - 3) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="mt-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className="rounded-lg border border-line px-3 py-1.5 hover:bg-card">
            Previous
          </Link>
        ) : null}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted">...</span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              className={`rounded-lg border px-3 py-1.5 ${
                p === page ? "border-primary bg-primary text-[#f6f1ea]" : "border-line hover:bg-card"
              }`}
            >
              {p}
            </Link>
          ),
        )}
        {page < totalPages ? (
          <Link href={buildHref(page + 1)} className="rounded-lg border border-line px-3 py-1.5 hover:bg-card">
            Next
          </Link>
        ) : null}
      </div>
      <span className="text-muted">Page {page} of {totalPages}</span>
    </nav>
  );
}
