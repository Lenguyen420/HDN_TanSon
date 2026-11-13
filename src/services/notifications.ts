import type { Notification } from "@/datas/types";

export type NotificationReadState = Record<string, boolean>;
const storageKey = "tanson-notification-read-state";

export function readNotificationState(): NotificationReadState {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.keys(value).reduce<NotificationReadState>((result, key) => {
      if (typeof value[key] === "boolean") result[key] = value[key];
      return result;
    }, {});
  } catch {
    return {};
  }
}

export function saveNotificationState(state: NotificationReadState): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function mergeNotifications(
  publicNotices: Notification[],
  privateNotices: Notification[],
  readState: NotificationReadState,
): Notification[] {
  const merged = new Map<string, Notification>();
  // Private receipts retain priority and their existing IDs/read state.
  for (const [items, scope] of [
    [privateNotices, "private"],
    [publicNotices, "public"],
  ] as const) {
    for (const notice of items) {
      if (merged.has(notice.id)) continue;
      merged.set(notice.id, {
        ...notice,
        scope,
        unread:
          readState[notice.id] === undefined
            ? notice.unread
            : !readState[notice.id],
      });
    }
  }
  const dateKey = (notice: Notification) =>
    notice.date + "T" + (notice.time || "00:00");
  return [...merged.values()].sort(
    (a, b) =>
      dateKey(b).localeCompare(dateKey(a)) ||
      (b.createdAt || "").localeCompare(a.createdAt || "") ||
      a.id.localeCompare(b.id),
  );
}
