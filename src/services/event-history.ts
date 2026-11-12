import type { ActivityRecord, ContentArticle } from "@/datas/types";
import type { EventParticipation } from "./event-workspace";
export function buildEventHistory(
  events: ContentArticle[],
  participations: EventParticipation[],
): ActivityRecord[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  const unique = new Map(participations.map((item) => [item.eventId, item]));
  return [...unique.values()]
    .map((item) => {
      const article = byId.get(item.eventId);
      return {
        id: item.eventId,
        eventId: item.eventId,
        title: article?.title || "Sự kiện không còn công khai",
        date: article?.event?.date || "",
        venue: article?.event?.venue || "Chưa cập nhật địa điểm",
        status: item.status,
        eventAvailable: Boolean(article),
      };
    })
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "vi"),
    );
}
