"use client";

import { useState } from "react";
import { useTheme, type VisualMode } from "@/lib/theme/ThemeProvider";
import styles from "./SettingsDropdown.module.css";

const LANGUAGES = [
  { label: "Browser default", value: "browser" },
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
  { label: "한국어", value: "ko" },
] as const;

const VISUAL_OPTIONS: { label: string; value: VisualMode }[] = [
  { label: "Browser default", value: "browser" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

type SettingsDropdownProps = {
  id?: string;
};

/**
 * AWS console "Current user settings" tray (language + visual mode).
 */
export function SettingsDropdown({ id }: SettingsDropdownProps) {
  const { visualMode, setVisualMode } = useTheme();
  const [language, setLanguage] = useState("browser");

  return (
    <div
      className={styles.dropdown}
      id={id}
      role="dialog"
      aria-label="Current user settings"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Current user settings</h2>
      </div>

      <div className={styles.section}>
        <label className={styles.label} htmlFor="console-language">
          Language
        </label>
        <div className={styles.selectWrap}>
          <select
            id="console-language"
            className={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.selectCaret} aria-hidden />
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.label}>
          Visual mode - <em>beta</em>
        </p>
        <div
          className={styles.radioGroup}
          role="radiogroup"
          aria-label="Visual mode"
        >
          {VISUAL_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.radioRow}>
              <input
                type="radio"
                name="visual-mode"
                checked={visualMode === opt.value}
                onChange={() => setVisualMode(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <a href="#" onClick={(e) => e.preventDefault()}>
          See all user settings
        </a>
      </div>
    </div>
  );
}
