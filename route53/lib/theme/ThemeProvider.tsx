"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Mode, applyMode } from "@cloudscape-design/global-styles";

export type VisualMode = "browser" | "light" | "dark";

const STORAGE_KEY = "route53.visualMode";

type ThemeContextValue = {
  visualMode: VisualMode;
  setVisualMode: (mode: VisualMode) => void;
  resolvedDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): VisualMode {
  if (typeof window === "undefined") return "light";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "browser" || raw === "light" || raw === "dark") return raw;
  return "light";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveDark(mode: VisualMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return systemPrefersDark();
}

function applyDocumentTheme(mode: VisualMode) {
  const dark = resolveDark(mode);
  document.documentElement.dataset.visualMode = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  applyMode(dark ? Mode.Dark : Mode.Light);
}

/**
 * Persists AWS console visual mode (browser / light / dark).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [visualMode, setVisualModeState] = useState<VisualMode>("light");
  const [resolvedDark, setResolvedDark] = useState(false);

  useEffect(() => {
    const mode = readStoredMode();
    setVisualModeState(mode);
    const dark = resolveDark(mode);
    setResolvedDark(dark);
    applyDocumentTheme(mode);
  }, []);

  useEffect(() => {
    if (visualMode !== "browser") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      setResolvedDark(mq.matches);
      applyDocumentTheme("browser");
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [visualMode]);

  const setVisualMode = useCallback((mode: VisualMode) => {
    setVisualModeState(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    const dark = resolveDark(mode);
    setResolvedDark(dark);
    applyDocumentTheme(mode);
  }, []);

  const value = useMemo(
    () => ({ visualMode, setVisualMode, resolvedDark }),
    [visualMode, setVisualMode, resolvedDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
