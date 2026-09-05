export function trackClientEvent(name: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ name, path: window.location.pathname, metadata: metadata ?? {} });
  const url = "/api/analytics/track";
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload }).catch(() => {});
  }
}
