"use client";

import { useState } from "react";
import styles from "./RegionDropdown.module.css";

type Region = {
  name: string;
  id: string;
};

type RegionGroup = {
  continent: string;
  regions: Region[];
};

const REGION_GROUPS: RegionGroup[] = [
  {
    continent: "United States",
    regions: [
      { name: "N. Virginia", id: "us-east-1" },
      { name: "Ohio", id: "us-east-2" },
      { name: "N. California", id: "us-west-1" },
      { name: "Oregon", id: "us-west-2" },
    ],
  },
  {
    continent: "Asia Pacific",
    regions: [
      { name: "Mumbai", id: "ap-south-1" },
      { name: "Osaka", id: "ap-northeast-3" },
      { name: "Seoul", id: "ap-northeast-2" },
      { name: "Singapore", id: "ap-southeast-1" },
      { name: "Sydney", id: "ap-southeast-2" },
      { name: "Tokyo", id: "ap-northeast-1" },
    ],
  },
  {
    continent: "Canada",
    regions: [{ name: "Central", id: "ca-central-1" }],
  },
  {
    continent: "Europe",
    regions: [
      { name: "Frankfurt", id: "eu-central-1" },
      { name: "Ireland", id: "eu-west-1" },
      { name: "London", id: "eu-west-2" },
      { name: "Paris", id: "eu-west-3" },
      { name: "Stockholm", id: "eu-north-1" },
    ],
  },
  {
    continent: "South America",
    regions: [{ name: "São Paulo", id: "sa-east-1" }],
  },
];

function LockIcon() {
  return (
    <svg
      className={styles.lock}
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 1.5A3.5 3.5 0 004.5 5v1.5H4A1.5 1.5 0 002.5 8v5A1.5 1.5 0 004 14.5h8a1.5 1.5 0 001.5-1.5V8A1.5 1.5 0 0012 6.5h-.5V5A3.5 3.5 0 008 1.5zm2 5H6V5a2 2 0 114 0v1.5z" />
    </svg>
  );
}

type RegionDropdownProps = {
  id?: string;
};

/**
 * AWS console region picker — Route 53 is global, so regions stay locked.
 */
export function RegionDropdown({ id }: RegionDropdownProps) {
  const [tab, setTab] = useState<"regions" | "local">("regions");

  return (
    <div
      className={styles.dropdown}
      id={id}
      role="dialog"
      aria-label="Regions"
    >
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "regions"}
          className={`${styles.tab}${tab === "regions" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setTab("regions")}
        >
          Regions
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "local"}
          className={`${styles.tab}${tab === "local" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setTab("local")}
        >
          Local zones
        </button>
      </div>

      <div className={styles.body} role="tabpanel">
        {tab === "regions" ? (
          REGION_GROUPS.map((group) => (
            <section key={group.continent} className={styles.group}>
              <h3 className={styles.groupTitle}>{group.continent}</h3>
              <ul className={styles.list}>
                {group.regions.map((region) => (
                  <li key={region.id}>
                    <button
                      type="button"
                      className={styles.regionRow}
                      disabled
                      title="Route 53 is a global service. Regions cannot be selected."
                    >
                      <LockIcon />
                      <span className={styles.regionName}>{region.name}</span>
                      <span className={styles.regionId}>{region.id}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p className={styles.empty}>
            No local zones available for this global service.
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Manage Regions
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Manage local zones
        </a>
      </div>
    </div>
  );
}
