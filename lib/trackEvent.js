// Fire-and-forget usage event logger, called from client components.
//
// This never blocks the UI and never surfaces an error to the user — losing a
// single analytics event is not worth interrupting someone creating a word list.
// `navigator.sendBeacon` is preferred when the browser supports it and the page
// is being left (e.g. the user navigates away before a normal fetch would finish);
// otherwise it falls back to a plain fetch with keepalive.
export function trackEvent(event) {
  try {
    const body = JSON.stringify(event);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/events", blob);
      if (sent) return;
    }
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the app it's observing.
  }
}

// Tracks how long a page was open before the user navigated away or triggered
// `onBeforeLeave` (e.g. clicking "Generate"). Call the returned function once,
// typically in a useEffect cleanup or a button handler, to record the duration.
// Calling it more than once is harmless — only the first call sends an event.
export function startPageTimer(page) {
  const start = Date.now();
  let sent = false;
  return function flush() {
    if (sent) return;
    sent = true;
    trackEvent({ type: "PAGE_VIEW", page, durationMs: Date.now() - start });
  };
}
