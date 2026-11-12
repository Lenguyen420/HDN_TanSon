import type { Utility } from "./types";
import aboutIcon from "@/assets/icon/about.png";
import membershipFeeIcon from "@/assets/icon/membership-fee.png";
import participationIcon from "@/assets/icon/participation.png";
import sponsorshipIcon from "@/assets/icon/sponsorship.png";
import contactIcon from "@/assets/icon/contact.png";
import eventAssistantIcon from "@/assets/icon/event-assistant.png";
import tanSonWardIcon from "@/assets/icon/tan-son-ward.png";
import giaoThuongIcon from "@/assets/icon/giao-thuong.png";

export const utilities: Utility[] = [
  { id: "about", title: "Giới thiệu", icon: aboutIcon, description: "Hội Doanh nghiệp Phường Tân Sơn là nơi kết nối cộng đồng doanh nghiệp, chia sẻ cơ hội hợp tác và đồng hành phát triển." },
  { id: "event-assistant", title: "Sự kiện", icon: eventAssistantIcon, description: "Hỗ trợ tìm hiểu chương trình, lịch trình và thông tin tham dự sự kiện của Hội.\nTính năng trợ lý đang được cập nhật." },
  { id: "activities", title: "Lịch sử tham gia", icon: participationIcon, description: "Dữ liệu mẫu\n20/10/2026 · Giao lưu kết nối doanh nghiệp\n05/10/2026 · Cà phê doanh nhân\n15/09/2026 · Hội thảo chuyển đổi số" },
  { id: "giao-thuong", title: "Giao thương", icon: giaoThuongIcon, description: "Kết nối giao thương giữa các doanh nghiệp.", comingSoon: true },
  { id: "tan-son-ward", title: "UBND phường Tân Sơn", icon: tanSonWardIcon, description: "Mở Mini App UBND phường Tân Sơn." },
  { id: "fees", title: "Hội phí", icon: membershipFeeIcon, description: "Theo dõi khoản hội phí cần đóng và lịch sử đóng hội phí." },
  { id: "sponsorships", title: "Lịch sử tài trợ", icon: sponsorshipIcon, description: "Dữ liệu mẫu\nChương trình đồng hành cùng cộng đồng\nGiá trị tài trợ: 5.000.000 đ\nNgày ghi nhận: 25/10/2026" },
  { id: "contact", title: "Liên hệ", icon: contactIcon, description: "Ban thư ký Hội Doanh nghiệp Phường Tân Sơn.\nThông tin liên hệ chính thức đang được cập nhật." },
];
