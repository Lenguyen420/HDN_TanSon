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
  } catch { return {}; }
}

export function saveNotificationState(state: NotificationReadState): boolean {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; }
  catch { return false; }
}
