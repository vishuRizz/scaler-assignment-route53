"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AmazonQContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const AmazonQContext = createContext<AmazonQContextValue | null>(null);

export function AmazonQProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );
  return (
    <AmazonQContext.Provider value={value}>{children}</AmazonQContext.Provider>
  );
}

export function useAmazonQ(): AmazonQContextValue {
  const ctx = useContext(AmazonQContext);
  if (!ctx) {
    throw new Error("useAmazonQ must be used within AmazonQProvider");
  }
  return ctx;
}
