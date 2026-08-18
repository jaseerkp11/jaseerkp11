"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mb-4 h-10 rounded-full bg-primary px-4 text-sm text-[#f6f1ea] print:hidden"
    >
      Print / save PDF
    </button>
  );
}
