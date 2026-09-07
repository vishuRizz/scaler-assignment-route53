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

function ChevronDown({ size = 10 }: { size?: number }) {
  return (
    <svg
      className={styles.chevron}
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 4.25L6 7.75L9.5 4.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServicesGridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="3.2" height="3.2" rx="0.4" />
      <rect x="6.4" y="1" width="3.2" height="3.2" rx="0.4" />
      <rect x="11.8" y="1" width="3.2" height="3.2" rx="0.4" />
      <rect x="1" y="6.4" width="3.2" height="3.2" rx="0.4" />
      <rect x="6.4" y="6.4" width="3.2" height="3.2" rx="0.4" />
      <rect x="11.8" y="6.4" width="3.2" height="3.2" rx="0.4" />
      <rect x="1" y="11.8" width="3.2" height="3.2" rx="0.4" />
      <rect x="6.4" y="11.8" width="3.2" height="3.2" rx="0.4" />
      <rect x="11.8" y="11.8" width="3.2" height="3.2" rx="0.4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 11l3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 4.5V8l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudShellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="1.75"
        y="2.75"
        width="12.5"
        height="10.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M4.5 6.25L6.75 8L4.5 9.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 10.25H11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.75a3.75 3.75 0 013.75 3.75v1.7c0 .55.16 1.09.46 1.55l.84 1.3A1 1 0 0112.2 11.5H3.8a1 1 0 01-.85-1.55l.84-1.3c.3-.46.46-1 .46-1.55V5.5A3.75 3.75 0 018 1.75z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.25 12.25a1.75 1.75 0 003.5 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.35 6.2a1.7 1.7 0 013.3.55c0 1.05-.9 1.5-1.55 1.85-.4.2-.6.4-.6.85v.35"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.55" r="0.7" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6.7 1.7h2.6l.35 1.55c.4.15.78.36 1.12.62l1.5-.7 1.3 1.3-.7 1.5c.26.34.47.72.62 1.12L15 6.7v2.6l-1.55.35c-.15.4-.36.78-.62 1.12l.7 1.5-1.3 1.3-1.5-.7c-.34.26-.72.47-1.12.62L9.3 15H6.7l-.35-1.55a4.9 4.9 0 01-1.12-.62l-1.5.7-1.3-1.3.7-1.5a4.9 4.9 0 01-.62-1.12L1 9.3V6.7l1.55-.35c.15-.4.36-.78.62-1.12l-.7-1.5 1.3-1.3 1.5.7c.34-.26.72-.47 1.12-.62L6.7 1.7z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/**
 * Dark AWS Management Console header — matched to Route 53 screenshot.
 * Swap `/public/assets/aws-logo.svg` for the official white wordmark when you have it.
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
            width={40}
            height={22}
            priority
          />
        </a>

        <span className={styles.divider} aria-hidden />

        <button type="button" className={styles.qButton} aria-label="Amazon Q">
          <Image
            className={styles.qIcon}
            src="/assets/amazon-q.svg"
            alt=""
            width={26}
            height={26}
            aria-hidden
          />
        </button>

        <span className={styles.divider} aria-hidden />

        <IconButton label="Services">
          <ServicesGridIcon />
        </IconButton>
      </div>

      <div className={styles.center}>
        <label className={styles.search}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search"
            aria-label="Search"
          />
          <kbd className={styles.shortcut}>Option+S</kbd>
          <button
            type="button"
            className={styles.historyButton}
            aria-label="Search history"
          >
            <HistoryIcon />
          </button>
        </label>
      </div>

      <div className={styles.right}>
        <IconButton label="CloudShell">
          <CloudShellIcon />
        </IconButton>
        <IconButton label="Notifications">
          <BellIcon />
        </IconButton>
        <IconButton label="Help">
          <HelpIcon />
        </IconButton>
        <IconButton label="Settings">
          <SettingsIcon />
        </IconButton>

        <button type="button" className={styles.regionButton} aria-label="Regions">
          Global
          <ChevronDown />
        </button>

        <button type="button" className={styles.accountButton} aria-label="Account menu">
          <span>
            <span className={styles.accountPrimary}>
              {CONSOLE_ACCOUNT.displayName} ({CONSOLE_ACCOUNT.accountId})
              <ChevronDown />
            </span>
            <span className={styles.accountSecondary}>
              {CONSOLE_ACCOUNT.displayName}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
