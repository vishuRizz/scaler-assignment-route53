"use client";

import { LandingSections } from "@/components/landing/LandingSections";
import styles from "./LandingPage.module.css";

/**
 * Marketing entry used by `app/page.tsx`.
 *
 * `document` — full AWS-accurate static marketing page from /home
 * `sections` — React-composed nav / hero / benefits (LandingSections)
 */
const LANDING_MODE: "document" | "sections" = "document";

export function LandingPage() {
  if (LANDING_MODE === "sections") {
    return <LandingSections />;
  }

  return (
    <div className={styles.root}>
      <iframe
        className={styles.frame}
        src="/home/index.html"
        title="Amazon Route 53"
      />
    </div>
  );
}
