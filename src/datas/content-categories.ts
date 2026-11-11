import type { ContentCategory } from "./types";
import type { IconName } from "@/components/icons";

export const contentCategories: { id: ContentCategory; title: string; detailTitle: string; icon: IconName }[] = [
  { id: "news", title: "Tin tức", detailTitle: "Chi tiết tin tức", icon: "info" },
  { id: "events", title: "Sự kiện", detailTitle: "Chi tiết sự kiện", icon: "calendar" },
  { id: "member-visits", title: "Thăm hội viên", detailTitle: "Chi tiết thăm hội viên", icon: "building" },
];
