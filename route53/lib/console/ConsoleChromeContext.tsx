"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ConsoleContentType =
  | "default"
  | "table"
  | "form"
  | "wizard"
  | "cards"
  | "dashboard";

export type ConsoleChromeState = {
  breadcrumbs?: ReactNode;
  contentType?: ConsoleContentType;
  navigationOpenByDefault?: boolean;
};

type ConsoleChromeContextValue = {
  chrome: ConsoleChromeState;
  setChrome: (next: ConsoleChromeState) => void;
};

const ConsoleChromeContext = createContext<ConsoleChromeContextValue | null>(
  null,
);

export function ConsoleChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChromeState] = useState<ConsoleChromeState>({
    contentType: "default",
    navigationOpenByDefault: true,
  });

  const setChrome = useCallback((next: ConsoleChromeState) => {
    setChromeState((prev) => ({
      ...prev,
      ...next,
    }));
  }, []);

  const value = useMemo(
    () => ({ chrome, setChrome }),
    [chrome, setChrome],
  );

  return (
    <ConsoleChromeContext.Provider value={value}>
      {children}
    </ConsoleChromeContext.Provider>
  );
}

export function useConsoleChromeContext(): ConsoleChromeContextValue {
  const ctx = useContext(ConsoleChromeContext);
  if (!ctx) {
    throw new Error("useConsoleChromeContext must be used within ConsoleChromeProvider");
  }
  return ctx;
}
