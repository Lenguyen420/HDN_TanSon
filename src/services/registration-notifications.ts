import { apiRequest } from "./api";
import type { Notification } from "@/datas/types";
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
export async function getRegistrationNotifications(): Promise<Notification[]> {
  const tokens = registrationTokens();
  if (!tokens.length) return [];
  const result = await apiRequest<{ data: Notification[] }>("public/registration-notifications", { method: "POST", body: JSON.stringify({ tokens }) });
  if (!Array.isArray(result.data)) throw new Error("Không đọc được kết quả đăng ký.");
  return result.data;
}
