import type { Utility } from "./types";
import aboutIcon from "@/assets/icon/about.png";
import membershipFeeIcon from "@/assets/icon/membership-fee.png";
import participationIcon from "@/assets/icon/participation.png";
import sponsorshipIcon from "@/assets/icon/sponsorship.png";
import contactIcon from "@/assets/icon/contact.png";
import eventAssistantIcon from "@/assets/icon/event-assistant.png";
import tanSonWardIcon from "@/assets/icon/tan-son-ward.png";
import giaoThuongIcon from "@/assets/icon/giao-thuong.png";
import mapIcon from "@/assets/icon/ban-do.png";

export const utilities: Utility[] = [
  { id: "about", title: "Giới thiệu", icon: aboutIcon, description: "Hội Doanh nghiệp Phường Tân Sơn là nơi kết nối cộng đồng doanh nghiệp, chia sẻ cơ hội hợp tác và đồng hành phát triển." },
  { id: "event-assistant", title: "Sự kiện", icon: eventAssistantIcon, description: "Hỗ trợ tìm hiểu chương trình, lịch trình và thông tin tham dự sự kiện của Hội.\nTính năng trợ lý đang được cập nhật." },
  { id: "activities", title: "Lịch sử tham gia", icon: participationIcon, description: "Theo dõi các sự kiện đã đăng ký, điểm danh và trạng thái tham gia." },
  { id: "giao-thuong", title: "Giao thương", icon: giaoThuongIcon, description: "Kết nối sản phẩm, dịch vụ và cơ hội hợp tác giữa doanh nghiệp hội viên." },
  { id: "tan-son-ward", title: "UBND phường Tân Sơn", icon: tanSonWardIcon, description: "Mở Mini App UBND phường Tân Sơn." },
  { id: "ban-do", title: "Bản đồ", icon: mapIcon, description: "Bản đồ đang được hoàn thiện để giúp Quý hội viên dễ dàng tìm kiếm địa điểm và kết nối cộng đồng doanh nghiệp." },
  { id: "fees", title: "Theo dõi thu chi", icon: membershipFeeIcon, description: "Theo dõi khoản hội phí cần đóng và lịch sử đóng hội phí." },
  { id: "sponsorships", title: "Đơn vị đồng hành", icon: sponsorshipIcon, description: "Dữ liệu mẫu\nChương trình đồng hành cùng cộng đồng\nGiá trị tài trợ: 5.000.000 đ\nNgày ghi nhận: 25/10/2026" },
  { id: "contact", title: "Liên hệ", icon: contactIcon, description: "Ban thư ký Hội Doanh nghiệp Phường Tân Sơn.\nThông tin liên hệ chính thức đang được cập nhật." },
];
