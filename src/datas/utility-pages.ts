import type { UtilityPageData } from "./types";

export const utilityPages: UtilityPageData = {
  about: {
    introduction: "Hội Doanh nghiệp Phường Tân Sơn là ngôi nhà chung của cộng đồng doanh nghiệp, nơi doanh nhân gặp gỡ, chia sẻ kinh nghiệm và cùng nhau phát triển.",
    mission: "Kết nối nguồn lực, đồng hành cùng hội viên và kiến tạo những giá trị bền vững cho cộng đồng.",
    values: [
      { title: "Kết nối", description: "Mở rộng mạng lưới, tạo cơ hội hợp tác giữa các doanh nghiệp." },
      { title: "Đồng hành", description: "Lắng nghe và chia sẻ kinh nghiệm trong hành trình phát triển." },
      { title: "Cống hiến", description: "Lan tỏa tinh thần trách nhiệm và đóng góp cho cộng đồng." },
    ],
    fields: ["Kết nối giao thương", "Chia sẻ kiến thức", "Thăm doanh nghiệp", "Hoạt động cộng đồng"],
  },
  fees: [
    { id: "fee-2026", year: 2026, title: "Hội phí thường niên 2026", amount: 2000000, date: "2026-10-01", status: "paid", reference: "HP-2026-004" },
    { id: "fee-event", year: 2026, title: "Phí tham dự chương trình kết nối", amount: 300000, date: "2026-11-01", status: "pending", reference: "HP-2026-018" },
    { id: "fee-2025", year: 2025, title: "Hội phí thường niên 2025", amount: 1800000, date: "2025-10-01", status: "paid", reference: "HP-2025-004" },
  ],
  activities: [
    { id: "activity-1", title: "Giao lưu và kết nối doanh nghiệp", date: "2026-11-20", venue: "Không gian kết nối doanh nghiệp (mẫu)", status: "registered", eventId: "event-1" },
    { id: "activity-2", title: "Cà phê doanh nhân", date: "2026-10-25", venue: "Không gian cà phê doanh nhân (mẫu)", status: "attended", eventId: "event-2" },
    { id: "activity-3", title: "Hội thảo ứng dụng công nghệ", date: "2026-10-15", venue: "Phòng hội thảo (mẫu)", status: "absent", eventId: "event-3" },
  ],
  sponsorships: [
    { id: "sponsor-1", title: "Đồng hành cùng cộng đồng", date: "2026-10-25", amount: 5000000, kind: "cash", description: "Đóng góp cho hoạt động hỗ trợ cộng đồng.", status: "Đã ghi nhận" },
    { id: "sponsor-2", title: "Quà tặng chương trình giao lưu", date: "2026-10-10", amount: 2000000, kind: "in-kind", description: "20 phần quà dành cho chương trình; giá trị quy đổi minh họa.", status: "Đã ghi nhận" },
    { id: "sponsor-3", title: "Kết nối doanh nghiệp", date: "2025-12-15", amount: 3000000, kind: "cash", description: "Đồng hành tổ chức chương trình giao thương.", status: "Đã ghi nhận" },
  ],
  contact: {
    department: "Ban thư ký Hội Doanh nghiệp Phường Tân Sơn",
    address: "Phường Tân Sơn, Thành phố Hồ Chí Minh",
    hours: "Thứ Hai – Thứ Sáu · 08:00 – 17:00 (minh họa)",
    phone: "0909 123 456", email: "hotro@example.com",
    hotlines: [
      { id: "hotline-1", label: "Hotline", number: "0909 123 456" },
      { id: "hotline-2", label: "Hotline", number: "0938 654 321" },
    ],
    zaloUrl: null,
    topics: ["Thông tin hội viên", "Hội phí", "Hoạt động và sự kiện", "Hợp tác, tài trợ", "Nội dung khác"],
  },
  assistant: {
    greeting: "Kính chào Quý Doanh nhân! Tôi có thể giúp bạn tìm chương trình, xem lịch trình và thông tin tham dự trong dữ liệu sự kiện mẫu.",
    questions: [
      { question: "Xem lịch sự kiện", answer: "Bạn có thể chọn một sự kiện bên dưới để xem thời gian, địa điểm và lịch trình chi tiết." },
      { question: "Làm sao để tham dự?", answer: "Mở chi tiết sự kiện để xem thông tin tham dự. Hiện đây là giao diện mẫu; việc đăng kí chính thức sẽ được kết nối khi có API." },
      { question: "Liên hệ ban tổ chức", answer: "Bạn có thể mở mục Liên hệ để xem thông tin Ban thư ký và chuẩn bị lời nhắn. Số điện thoại, email chính thức đang được cập nhật." },
    ],
  },
};
