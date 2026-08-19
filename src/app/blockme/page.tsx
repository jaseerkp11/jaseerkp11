import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlockMe helper",
  robots: { index: false, follow: false },
};

export default function BlockMeHelperPage() {
  return (
    <iframe
      title="BlockMe line helper"
      src="/blockme.html"
      style={{ width: "100%", height: "100vh", border: 0, display: "block" }}
    />
  );
}
