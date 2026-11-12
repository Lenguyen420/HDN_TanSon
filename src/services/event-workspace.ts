import { apiRequest, useMockData } from "./api";
import type { ContentArticle } from "@/datas/types";

export interface AttendanceReceipt { eventId: string; name: string; company: string; checkedAt: string; }
const storageKey = "tanson-event-attendance-tokens";
let tokens: Record<string, string> = Object.create(null);
function readTokens() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (value && typeof value === "object" && !Array.isArray(value))
      for (const [id, token] of Object.entries(value))
        if (typeof token === "string" && /^[a-f0-9]{64}$/.test(token)) tokens[id] = token;
  } catch { /* Keep receipts available in memory for this session. */ }
  return tokens;
}
export function eventToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function eventStatus(article: ContentArticle, today = eventToday()) {
  const date = article.event?.date;
  return !date ? "Chưa có lịch" : date > today ? "Sắp diễn ra" : date === today ? "Diễn ra hôm nay" : "Đã diễn ra";
}
export function sortEvents(events: ContentArticle[]) {
  const today = eventToday();
  return [...events].sort((a, b) => {
    const ad = a.event?.date || "", bd = b.event?.date || "";
    const af = ad >= today, bf = bd >= today;
    return af !== bf ? af ? -1 : 1 : af ? ad.localeCompare(bd) : bd.localeCompare(ad);
  });
}
export function matchesEvent(article: ContentArticle, query: string) {
  return [article.title, article.event?.venue, article.event?.address, article.event?.host, article.author].join(" ").toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi"));
}
export function matchesEventPeriod(date: string | undefined, period: string, today = eventToday()) {
  if (period === "all") return true;
  if (!date) return false;
  if (period === "upcoming") return date >= today;
  if (period === "past") return date < today;
  if (period === "month") return date.slice(0, 7) === today.slice(0, 7);
  const start = new Date(`${today}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 7);
  return date >= start.toISOString().slice(0, 10) && date < end.toISOString().slice(0, 10);
}
export async function getEventAttendance(eventId: string): Promise<AttendanceReceipt | null> {
  const token = readTokens()[eventId];
  if (!token || useMockData) return null;
  return (await apiRequest<{ data: AttendanceReceipt | null }>(`public/events/${encodeURIComponent(eventId)}/check-in`, { headers: { "X-Attendance-Token": token } })).data;
}
export async function checkInEvent(eventId: string, name: string, company: string) {
  if (useMockData) throw new Error("Điểm danh chỉ khả dụng với sự kiện chính thức.");
  const existing = readTokens()[eventId];
  const token = existing || Array.from(crypto.getRandomValues(new Uint8Array(32)), (value) => value.toString(16).padStart(2, "0")).join("");
  tokens[eventId] = token;
  let persisted = true;
  try { localStorage.setItem(storageKey, JSON.stringify(tokens)); } catch { persisted = false; }
  const result = await apiRequest<{ data: AttendanceReceipt }>(`public/events/${encodeURIComponent(eventId)}/check-in`, { method: "POST", body: JSON.stringify({ token, name: name.trim(), company: company.trim() }) });
  return { receipt: result.data, persisted };
}
export async function openEventFile(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("Tài liệu cần có đường dẫn HTTPS hợp lệ.");
  if (window.location.hostname === "h5.zdn.vn" || /Zalo/i.test(navigator.userAgent)) {
    const { openWebview } = await import("zmp-sdk/apis");
    await openWebview({ url: parsed.href });
  } else window.open(parsed.href, "_blank", "noopener,noreferrer");
}
