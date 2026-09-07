import { apiFetch, ApiError } from "@/lib/api/client";
import {
  invalidateHostedZone,
  invalidateZoneList,
  isHostedZoneFresh,
  isZoneListFresh,
  peekHostedZone,
  peekZoneList,
  setHostedZoneCache,
  setZoneListCache,
} from "@/lib/api/cache";
import { mapHostedZone, type ApiHostedZone } from "@/lib/api/mappers";
import { getToken } from "@/lib/auth/session-storage";
import { notifyConsoleActivity } from "@/lib/notifications/store";
import type { HostedZone, HostedZoneType } from "@/lib/types/hosted-zone";

function requireToken(): string {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function listHostedZones(options?: {
  fresh?: boolean;
}): Promise<HostedZone[]> {
  if (!options?.fresh) {
    const cached = peekZoneList();
    if (cached && isZoneListFresh()) return cached;
  }

  const token = requireToken();
  const rows = await apiFetch<ApiHostedZone[]>("/hosted-zones", { token });
  const zones = rows.map(mapHostedZone);
  setZoneListCache(zones);
  return zones;
}

export async function getHostedZone(
  id: string,
  options?: { fresh?: boolean },
): Promise<HostedZone | null> {
  if (!options?.fresh) {
    const cached = peekHostedZone(id);
    if (cached && isHostedZoneFresh(id)) return cached;
  }

  const token = requireToken();
  try {
    const row = await apiFetch<ApiHostedZone>(`/hosted-zones/${id}`, { token });
    const zone = mapHostedZone(row);
    setHostedZoneCache(zone);
    return zone;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      invalidateHostedZone(id);
      return null;
    }
    const stale = peekHostedZone(id);
    if (stale) return stale;
    throw err;
  }
}

export async function createHostedZone(input: {
  name: string;
  description?: string;
  type: HostedZoneType;
}): Promise<HostedZone> {
  const token = requireToken();
  const row = await apiFetch<ApiHostedZone>("/hosted-zones", {
    method: "POST",
    token,
    body: {
      name: input.name,
      description: input.description ?? "",
      type: input.type,
    },
  });
  const zone = mapHostedZone(row);
  setHostedZoneCache(zone);
  invalidateZoneList();
  notifyConsoleActivity({
    action: "created",
    resource: "Hosted zone",
    name: zone.name,
    href: `/hosted-zones/${zone.id}`,
  });
  return zone;
}

export async function updateHostedZone(
  id: string,
  input: { description: string },
): Promise<HostedZone> {
  const token = requireToken();
  const row = await apiFetch<ApiHostedZone>(`/hosted-zones/${id}`, {
    method: "PUT",
    token,
    body: { description: input.description },
  });
  const zone = mapHostedZone(row);
  setHostedZoneCache(zone);
  notifyConsoleActivity({
    action: "updated",
    resource: "Hosted zone",
    name: zone.name,
    href: `/hosted-zones/${zone.id}`,
  });
  return zone;
}

export async function deleteHostedZone(id: string): Promise<void> {
  const token = requireToken();
  const existing = peekHostedZone(id);
  await apiFetch<{ message: string }>(`/hosted-zones/${id}`, {
    method: "DELETE",
    token,
  });
  invalidateHostedZone(id);
  invalidateZoneList();
  notifyConsoleActivity({
    action: "deleted",
    resource: "Hosted zone",
    name: existing?.name ?? id,
  });
}
