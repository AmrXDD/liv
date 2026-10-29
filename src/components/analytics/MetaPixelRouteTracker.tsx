import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

type Fbq = (command: string, event: string, params?: Record<string, unknown>) => void;

// The base snippet in index.html already tracks the first PageView. This fires one
// more on each in-app route change, which a single-page app would otherwise miss.
export function MetaPixelRouteTracker() {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
