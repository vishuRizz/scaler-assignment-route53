"use client";

import Image from "next/image";
import { CONSOLE_ACCOUNT } from "@/lib/constants/console";
import styles from "./TopNav.module.css";

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={styles.iconButton} aria-label={label}>
      {children}
    </button>
  );
}

function ServicesGridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="4" height="4" rx="0.5" />
      <rect x="6" y="1" width="4" height="4" rx="0.5" />
      <rect x="11" y="1" width="4" height="4" rx="0.5" />
      <rect x="1" y="6" width="4" height="4" rx="0.5" />
      <rect x="6" y="6" width="4" height="4" rx="0.5" />
      <rect x="11" y="6" width="4" height="4" rx="0.5" />
      <rect x="1" y="11" width="4" height="4" rx="0.5" />
      <rect x="6" y="11" width="4" height="4" rx="0.5" />
      <rect x="11" y="11" width="4" height="4" rx="0.5" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Dark AWS Management Console header.
 * Replace /public/assets/aws-logo.svg with the official mark when you have it.
 */
export function TopNav() {
  return (
    <header className={styles.topNav} role="banner">
      <div className={styles.left}>
        <a href="/" className={styles.logoLink} aria-label="Amazon Web Services">
          <Image
            className={styles.logoImage}
            src="/assets/aws-logo.svg"
            alt="AWS"
            width={48}
            height={22}
            priority
          />
        </a>

        <IconButton label="Favorites">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path
              fill="#aab7ff"
              d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4.1L8 11.7 4.4 13.8l.7-4.1-3-2.9 4.1-.6L8 1.5z"
            />
          </svg>
        </IconButton>

        <IconButton label="Services">
          <ServicesGridIcon />
        </IconButton>
      </div>

      <div className={styles.center}>
        <label className={styles.search}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M11.5 10.4l3.2 3.2-.9.9-3.2-3.2a5.5 5.5 0 11.9-1zM6.5 10.5a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search"
            aria-label="Search"
          />
          <kbd className={styles.shortcut}>Option+S</kbd>
        </label>
      </div>

      <div className={styles.right}>
        <IconButton label="CloudShell">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M2 3h12v10H2V3zm1 1v8h10V4H3zm2 2.5L7.5 8 5 9.5v-1l1.2-.7L5 6.5v-1zm3 4h3v1H8v-1z" />
          </svg>
        </IconButton>
        <IconButton label="Notifications">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 1a4 4 0 014 4v2.5l1.5 2H2.5L4 7.5V5a4 4 0 014-4zm-2 11a2 2 0 004 0H6z" />
          </svg>
        </IconButton>
        <IconButton label="Help">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 10.2a.9.9 0 100 1.8.9.9 0 000-1.8zM8 3.8c-1.5 0-2.5.9-2.5 2.1h1.3c0-.6.5-1 1.2-1s1.2.4 1.2 1c0 .7-.4 1-1.1 1.4-.8.5-1.3 1-1.3 2v.4h1.3v-.3c0-.5.3-.8 1.1-1.3.9-.6 1.5-1.2 1.5-2.3C9.7 4.6 8.9 3.8 8 3.8z" />
          </svg>
        </IconButton>
        <IconButton label="Settings">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M6.5 1h3l.4 1.6a5 5 0 011.4.8L13 2.8l2 2-1.6 1.7c.2.45.3.9.3 1.4 0 .5-.1.95-.3 1.4L15 11l-2 2-1.7-1.6a5 5 0 01-1.4.8L9.5 15h-3l-.4-1.6a5 5 0 01-1.4-.8L3 13l-2-2 1.6-1.7A5 5 0 012.3 8c0-.5.1-.95.3-1.4L1 5l2-2 1.7 1.6a5 5 0 011.4-.8L6.5 1zM8 5.5A2.5 2.5 0 108 10.5 2.5 2.5 0 008 5.5z" />
          </svg>
        </IconButton>

        <button type="button" className={styles.menuButton} aria-label="Regions">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.2a5.8 5.8 0 110 11.6A5.8 5.8 0 018 2.2zM1.5 7.4h13v1.2h-13V7.4z" />
          </svg>
          Global
          <ChevronDown />
        </button>

        <button type="button" className={styles.menuButton} aria-label="Account">
          {CONSOLE_ACCOUNT.displayName} ({CONSOLE_ACCOUNT.accountId})
          <ChevronDown />
        </button>
      </div>
    </header>
  );
}
