"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { LandingSections } from "@/components/landing/LandingSections";
import styles from "./LandingPage.module.css";

/**
 * Marketing entry used by `app/page.tsx`.
 *
 * `document` — full AWS-accurate static marketing page from /home
 * `sections` — React-composed nav / hero / benefits (LandingSections)
 */
const LANDING_MODE: "document" | "sections" = "document";

/** Paths that must navigate the top-level Next.js app (not the iframe). */
function isAppPath(pathname: string): boolean {
  return (
    pathname === "/signin" ||
    pathname.startsWith("/signin?") ||
    pathname.startsWith("/hosted-zones") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/health-checks") ||
    pathname.startsWith("/profiles") ||
    pathname.startsWith("/domains") ||
    pathname.startsWith("/traffic") ||
    pathname.startsWith("/global-resolver") ||
    pathname.startsWith("/vpc-resolver") ||
    pathname.startsWith("/ip-based-routing")
  );
}

export function LandingPage() {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const bindFrameNavigation = useCallback(() => {
    const iframe = frameRef.current;
    const win = iframe?.contentWindow;
    const doc = iframe?.contentDocument;
    if (!iframe || !win || !doc) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const raw = anchor.getAttribute("href");
      if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) return;
      if (anchor.getAttribute("target") === "_blank") return;

      let url: URL;
      try {
        url = new URL(raw, win.location.href);
      } catch {
        return;
      }

      // Keep purely in-document hash jumps inside the frame.
      if (
        url.origin === win.location.origin &&
        url.pathname === win.location.pathname &&
        url.hash
      ) {
        return;
      }

      // Static marketing assets under /home stay in the iframe.
      if (
        url.origin === window.location.origin &&
        url.pathname.startsWith("/home/")
      ) {
        return;
      }

      // App routes (and any other same-origin pages) must break out so the
      // browser URL bar updates. Without this, /signin and /hosted-zones load
      // inside the iframe while the parent stays on "/".
      event.preventDefault();
      event.stopPropagation();

      if (url.origin !== window.location.origin) {
        window.top!.location.href = url.href;
        return;
      }

      const next = `${url.pathname}${url.search}${url.hash}`;
      if (isAppPath(url.pathname)) {
        router.push(next);
        return;
      }

      // Other AWS marketing paths — open on aws.amazon.com rather than 404 here.
      window.open(`https://aws.amazon.com${next}`, "_blank", "noopener,noreferrer");
    };

    doc.addEventListener("click", onClick, true);

    // Belt-and-suspenders for app entry CTAs.
    doc.querySelectorAll('a[href="/signin"], a[href^="/signin?"]').forEach((a) => {
      a.setAttribute("target", "_top");
    });
  }, [router]);

  if (LANDING_MODE === "sections") {
    return <LandingSections />;
  }

  return (
    <div className={styles.root}>
      <iframe
        ref={frameRef}
        className={styles.frame}
        src="/home/index.html"
        title="Amazon Route 53"
        onLoad={bindFrameNavigation}
      />
    </div>
  );
}
