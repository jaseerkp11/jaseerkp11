import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "sale" | "ok" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        tone === "ink" && "bg-[#161513] text-[#f6f1ea]",
        tone === "sale" && "bg-accent text-white",
        tone === "ok" && "bg-[#2f6b4f] text-white",
        tone === "muted" && "bg-[#ece6dc] text-[#5c564e]",
      )}
    >
      {children}
    </span>
  );
}
