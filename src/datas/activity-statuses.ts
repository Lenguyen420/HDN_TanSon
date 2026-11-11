import type { ActivityStatus } from "./types";

export const activityStatuses: { value: "all" | ActivityStatus; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "registered", label: "Đã đăng ký" },
  { value: "attended", label: "Đã tham gia" },
  { value: "absent", label: "Vắng mặt" },
  { value: "cancelled", label: "Đã hủy" },
];
