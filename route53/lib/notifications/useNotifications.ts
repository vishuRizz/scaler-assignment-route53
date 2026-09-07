"use client";

import { useSyncExternalStore } from "react";
import {
  getNotifications,
  subscribeNotifications,
  type ConsoleNotification,
} from "./store";

const EMPTY: ConsoleNotification[] = [];

export function useNotifications(): ConsoleNotification[] {
  return useSyncExternalStore(
    subscribeNotifications,
    getNotifications,
    () => EMPTY,
  );
}
