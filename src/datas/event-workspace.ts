import type { IconName } from "@/components/icons";

export type EventSection = "calendar" | "attendance" | "documents" | "minutes";
export type EventResourceSection = Exclude<EventSection, "calendar">;
export const eventSections: { id: EventSection; title: string; icon: IconName; subtitle: string }[] = [
  { id: "calendar", title: "Lịch sự kiện", icon: "calendar", subtitle: "Tra cứu lịch và thông tin chương trình" },
  { id: "documents", title: "Tài liệu", icon: "document", subtitle: "Chọn sự kiện để xem tài liệu" },
  { id: "minutes", title: "Biên bản", icon: "check", subtitle: "Tra cứu biên bản và kết luận sự kiện" },
  { id: "attendance", title: "Điểm danh", icon: "members", subtitle: "Xác nhận tham dự theo từng sự kiện" },
];
