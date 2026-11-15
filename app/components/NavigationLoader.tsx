"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function NavigationLoader() {
  const pathname = usePathname();
  const [sourcePathname, setSourcePathname] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const startNavigation = useCallback((sourcePath: string) => {
    setSourcePathname(sourcePath);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setSourcePathname(null);
      timeoutRef.current = null;
    }, 30000);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      const navigationTarget = link ?? event.target.closest<HTMLElement>("[data-navigation-path]");
      if (!navigationTarget || (link && (link.target === "_blank" || link.hasAttribute("download")))) return;

      if (!link) {
        const interactiveTarget = event.target.closest("button, input, select, textarea, [role='button']");
        if (interactiveTarget && interactiveTarget !== navigationTarget) return;
      }

      const href = link?.href ?? navigationTarget.dataset.navigationPath;
      if (!href) return;

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      startNavigation(window.location.pathname);
    };
    const handlePopState = () => startNavigation(pathname);

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, startNavigation]);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname]);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  if (!sourcePathname || sourcePathname !== pathname) return null;

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-4 shadow-lg">
        <span className="sr-only">Loading</span>
        <span aria-hidden="true" className="floating-loader-dot" />
        <span aria-hidden="true" className="floating-loader-dot" />
        <span aria-hidden="true" className="floating-loader-dot" />
      </div>
    </div>
  );
}
