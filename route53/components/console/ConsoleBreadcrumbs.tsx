"use client";

import { useRouter } from "next/navigation";
import styles from "./ConsoleBreadcrumbs.module.css";

export type ConsoleBreadcrumbItem = {
  text: string;
  href: string;
};

type ConsoleBreadcrumbsProps = {
  items: ConsoleBreadcrumbItem[];
};

/**
 * Always-inline AWS-style breadcrumbs: Route 53 > Hosted zones > zone.name
 * (Cloudscape BreadcrumbGroup collapses into a dropdown when truncated.)
 */
export function ConsoleBreadcrumbs({ items }: ConsoleBreadcrumbsProps) {
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label="Breadcrumbs">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href}-${item.text}`} className={styles.item}>
              {index > 0 ? (
                <span className={styles.separator} aria-hidden>
                  ›
                </span>
              ) : null}
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {item.text}
                </span>
              ) : (
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => router.push(item.href)}
                >
                  {item.text}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
