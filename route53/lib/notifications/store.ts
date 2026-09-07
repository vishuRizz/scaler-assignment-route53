/**
 * Client-side console notifications (create / edit / delete activity).
 * Persisted in localStorage so the bell dropdown survives navigation.
 */

export type NotificationCategory = "user" | "aws";

export type ConsoleNotification = {
  id: string;
  title: string;
  body: string;
  href?: string;
  createdAt: number;
  category: NotificationCategory;
};

const STORAGE_KEY = "route53.notifications";
const MAX_ITEMS = 40;

type Listener = () => void;

let cache: ConsoleNotification[] | null = null;
const listeners = new Set<Listener>();

function read(): ConsoleNotification[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(raw) as ConsoleNotification[];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: ConsoleNotification[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  listeners.forEach((listener) => listener());
}

export function getNotifications(): ConsoleNotification[] {
  return read();
}

export function subscribeNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushNotification(
  input: Omit<ConsoleNotification, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
): ConsoleNotification {
  const item: ConsoleNotification = {
    id: input.id ?? `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    body: input.body,
    href: input.href,
    createdAt: input.createdAt ?? Date.now(),
    category: input.category,
  };
  const next = [item, ...read()].slice(0, MAX_ITEMS);
  write(next);
  return item;
}

export function clearNotifications() {
  write([]);
}

export function formatNotificationAge(createdAt: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - createdAt) / 1000));
  if (seconds < 45) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Record a Route 53 console CRUD event in the notifications tray. */
export function notifyConsoleActivity(input: {
  action: "created" | "updated" | "deleted";
  resource: string;
  name: string;
  href?: string;
  detail?: string;
}) {
  const verb =
    input.action === "created"
      ? "created"
      : input.action === "updated"
        ? "updated"
        : "deleted";
  const title =
    input.action === "created"
      ? `${input.resource} created`
      : input.action === "updated"
        ? `${input.resource} updated`
        : `${input.resource} deleted`;

  pushNotification({
    category: "user",
    title,
    body:
      input.detail ??
      `${input.resource} ${input.name} was successfully ${verb}.`,
    href: input.href,
  });
}
