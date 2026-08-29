"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Cookieless pageview tracking — no client-side storage at all, nothing to
// ask consent for. Each transition (including the very first load) fires a
// non-blocking beacon to /api/track, which proxies to sly-crm's analytics
// table server-to-server. See sly-crm/backend/routes/analytics.js for how
// the visitor identity (daily-rotating hash) is derived.
function TrackPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const payload = {
      path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      utmSource: searchParams.get("utm_source") || undefined,
      utmMedium: searchParams.get("utm_medium") || undefined,
      utmCampaign: searchParams.get("utm_campaign") || undefined,
    };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon("/api/track", blob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()]);

  return null;
}

export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <TrackPageview />
    </Suspense>
  );
}
