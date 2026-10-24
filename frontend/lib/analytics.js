// Client-side analytics helper for Teacher Jobs UZ

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function trackEvent(eventName, properties = {}) {
  try {
    // 1. Send to internal backend telemetry
    fetch(`${API_BASE}/api/metrics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        properties: {
          ...properties,
          url: typeof window !== "undefined" ? window.location.pathname : "",
          timestamp: new Date().toISOString()
        }
      })
    }).catch(() => {
      // Ignore background network errors
    });

    // 2. Google Analytics 4 integration (if gtag is loaded)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, properties);
    }
  } catch (e) {
    console.debug("Analytics track error:", e);
  }
}
