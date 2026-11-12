import { apiRequest } from "./api";
import type { Notification, RegistrationProfile } from "@/datas/types";
const key = "tanson-registration-receipts";
let memory: string[] = [];
export function registrationTokens(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(stored)) memory = [...new Set([...memory, ...stored.filter((v): v is string => typeof v === "string" && /^[a-f0-9]{64}$/.test(v))])].slice(-20);
  } catch { /* In-memory tracking remains available for this open session. */ }
  return [...memory];
}
export function prepareRegistrationTracking() {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) => v.toString(16).padStart(2, "0")).join("");
  memory = [...registrationTokens(), token].slice(-20);
  let persisted = true;
  try { localStorage.setItem(key, JSON.stringify(memory)); } catch { persisted = false; }
  return { token, persisted };
}
export function announceRegistrationSubmitted() {
  if (typeof window.dispatchEvent === "function") window.dispatchEvent(new Event("tanson-registration-updated"));
}
export async function getRegistrationUpdates(): Promise<{data: Notification[]; profiles: RegistrationProfile[]}> {
  const tokens = registrationTokens();
  if (!tokens.length) return {data: [], profiles: []};
  const result = await apiRequest<{ data: Notification[]; profiles?: RegistrationProfile[] }>("public/registration-notifications", { method: "POST", body: JSON.stringify({ tokens }) });
  if (!Array.isArray(result.data)) throw new Error("Không đọc được kết quả đăng ký.");
  return { data: result.data, profiles: Array.isArray(result.profiles) ? result.profiles : [] };
}

export async function getRegistrationNotifications(): Promise<Notification[]> { return (await getRegistrationUpdates()).data; }
