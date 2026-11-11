import type { IconName } from "@/components/icons";
import type { NavigationTab } from "./types";
import { associationSlogan } from "./association";

type PageContent = { title: string; subtitle: string; icon: IconName; heading: string; description: string; };
export const pageContent: Record<Exclude<NavigationTab, "home">, PageContent> = {
  register: { title: "Đăng kí hội viên", subtitle: associationSlogan, icon: "register", heading: "Gia nhập cộng đồng doanh nghiệp", description: "Để lại thông tin của bạn để chuẩn bị hồ sơ đăng kí hội viên." },
  members: { title: "Hội viên", subtitle: "Cộng đồng doanh nghiệp Phường Tân Sơn", icon: "members", heading: "Danh bạ hội viên", description: "Kết nối, đồng hành và chia sẻ cơ hội hợp tác." },
  notifications: { title: "Thông báo", subtitle: "Cập nhật thông tin từ Hội", icon: "bell", heading: "Thông báo từ Hội", description: "Thông tin hoạt động, sự kiện và chương trình dành cho hội viên." },
  profile: { title: "Cá nhân", subtitle: "Thông tin hội viên của bạn", icon: "user", heading: "Hồ sơ hội viên", description: "Thông tin cá nhân và doanh nghiệp đồng hành cùng Hội." },
};
