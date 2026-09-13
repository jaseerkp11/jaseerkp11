export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-[#ece6dc]" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-[#ece6dc]" />
        ))}
      </div>
    </div>
  );
}
