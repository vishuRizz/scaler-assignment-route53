"use client";

import { useEffect, useState } from "react";
import {
  formatNotificationAge,
  type ConsoleNotification,
} from "@/lib/notifications/store";
import { useNotifications } from "@/lib/notifications/useNotifications";
import styles from "./NotificationsDropdown.module.css";

type TabId = "recent" | "user" | "aws";

type NotificationsDropdownProps = {
  id?: string;
};

function WindowsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="3.5"
        width="8"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="#161d27"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1.5c-2.67 0-8 1.34-8 4V15h16v-1.5c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="2.5"
        width="13"
        height="9"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M5 14.5h6M8 11.5v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotificationRow({ item }: { item: ConsoleNotification }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const age = formatNotificationAge(item.createdAt, now);
  const content = (
    <>
      <div className={styles.itemHeader}>
        <span className={styles.itemIcon}>
          <WindowsIcon />
        </span>
        <span className={styles.itemTitle}>{item.title}</span>
        <span className={styles.itemAge}>{age}</span>
      </div>
      <p className={styles.itemBody}>{item.body}</p>
    </>
  );

  if (item.href) {
    return (
      <a className={styles.item} href={item.href}>
        {content}
      </a>
    );
  }

  return <div className={styles.item}>{content}</div>;
}

/**
 * AWS console notifications tray — shows Route 53 create/edit/delete activity.
 */
export function NotificationsDropdown({ id }: NotificationsDropdownProps) {
  const items = useNotifications();
  const [tab, setTab] = useState<TabId>("recent");

  const filtered =
    tab === "recent"
      ? items
      : tab === "user"
        ? items.filter((n) => n.category === "user")
        : items.filter((n) => n.category === "aws");

  return (
    <div
      className={styles.dropdown}
      id={id}
      role="dialog"
      aria-label="Notifications"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Notifications</h2>
        <a
          className={styles.centreLink}
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          Notification centre
        </a>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "recent"}
          className={`${styles.tab}${tab === "recent" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setTab("recent")}
        >
          Most recent
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "user"}
          className={`${styles.tab}${tab === "user" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setTab("user")}
        >
          <PersonIcon />
          User configured
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "aws"}
          className={`${styles.tab}${tab === "aws" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setTab("aws")}
        >
          <MonitorIcon />
          AWS managed
        </button>
      </div>

      <div className={styles.list} role="tabpanel">
        {filtered.length === 0 ? (
          <p className={styles.empty}>
            {tab === "aws"
              ? "No AWS managed notifications."
              : "No recent activity. Create, edit, or delete hosted zones and records to see them here."}
          </p>
        ) : (
          filtered.map((item) => <NotificationRow key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
