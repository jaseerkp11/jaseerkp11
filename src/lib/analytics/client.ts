export async function trackEvent(eventType: string, metadata: Record<string, unknown> = {}) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventType, metadata }),
    });
  } catch {
    // best-effort
  }
}
