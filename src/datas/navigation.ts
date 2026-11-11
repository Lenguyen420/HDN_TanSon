import type { IconName } from "@/components/icons";
import type { NavigationTab } from "./types";

export const navigationItems: { id: NavigationTab; label: string; icon: IconName }[] = [
  { id: "register", label: "Đăng kí", icon: "register" },
  { id: "members", label: "Hội viên", icon: "members" },
  { id: "home", label: "Trang chủ", icon: "home" },
  { id: "notifications", label: "Thông báo", icon: "bell" },
  { id: "profile", label: "Cá nhân", icon: "user" },
];
