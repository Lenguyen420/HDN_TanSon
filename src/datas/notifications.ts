import eventImage from "@/assets/banner/2.png";
import communityImage from "@/assets/banner/1.jpeg";
import type { Notification } from "./types";

export const notifications: Notification[] = [
  {
    id: "notice-1", title: "Gặp gỡ và kết nối doanh nghiệp", category: "Sự kiện", date: "10/11/2026", time: "09:00", unread: true, image: eventImage,
    description: "Kính mời Quý hội viên tham dự chương trình giao lưu, giới thiệu doanh nghiệp và kết nối cơ hội hợp tác.",
    paragraphs: ["Kính gửi Quý hội viên Hội Doanh nghiệp Phường Tân Sơn,", "Dữ liệu mẫu: Hội giới thiệu chương trình gặp gỡ và kết nối doanh nghiệp, tạo cơ hội để hội viên trao đổi nhu cầu, chia sẻ kinh nghiệm và mở rộng quan hệ hợp tác.", "Quý hội viên có thể xem bài viết sự kiện để tìm hiểu nội dung, thời gian và lịch trình minh họa. Thông tin tổ chức chính thức sẽ được cập nhật khi hệ thống kết nối API.", "Trân trọng cảm ơn sự quan tâm và đồng hành của Quý doanh nghiệp."],
    related: { category: "events", articleId: "event-1" },
  },
  {
    id: "notice-2", title: "Thông báo cập nhật hồ sơ hội viên", category: "Hội viên", date: "08/11/2026", time: "14:30", unread: true, image: null,
    description: "Quý hội viên vui lòng kiểm tra thông tin doanh nghiệp để Ban thư ký hoàn thiện danh bạ hội viên.",
    paragraphs: ["Kính gửi Quý hội viên,", "Dữ liệu mẫu: Để hoàn thiện danh bạ và tăng cường kết nối, Ban thư ký đề nghị hội viên chuẩn bị thông tin doanh nghiệp, chức vụ, lĩnh vực hoạt động và thông tin liên hệ.", "Thông tin chính xác giúp Hội giới thiệu doanh nghiệp và kết nối những nhu cầu hợp tác phù hợp. Biểu mẫu cập nhật trực tuyến sẽ được mở khi có kết nối hệ thống chính thức.", "Ban thư ký trân trọng cảm ơn sự phối hợp của Quý hội viên."],
    related: { category: "news", articleId: "news-3" },
  },
  {
    id: "notice-3", title: "Đồng hành cùng các hoạt động cộng đồng", category: "Cộng đồng", date: "05/11/2026", time: "08:15", unread: false, image: communityImage,
    description: "Hội trân trọng cảm ơn sự đồng hành và đóng góp của Quý doanh nghiệp trong các hoạt động cộng đồng.",
    paragraphs: ["Kính gửi Quý doanh nghiệp,", "Dữ liệu mẫu: Hội trân trọng ghi nhận những đóng góp và sự đồng hành của các doanh nghiệp trong các chương trình cộng đồng.", "Sự chung tay của hội viên góp phần lan tỏa tinh thần trách nhiệm và xây dựng cộng đồng doanh nghiệp phát triển bền vững.", "Các hoạt động tiếp theo sẽ được cập nhật tại chuyên mục Tin tức. Trân trọng cảm ơn Quý doanh nghiệp."],
    related: { category: "news", articleId: "news-1" },
  },
];
