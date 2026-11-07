import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top on route change. (The animated cover panel was removed
 * because it added ~1.2s to every page load and navigation.)
 */
export function PageTransitionCover() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}
