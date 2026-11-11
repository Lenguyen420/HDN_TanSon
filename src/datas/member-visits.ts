import type { ContentCollection } from "./types";
import { visitDetails } from "./article-details";

export const memberVisits: ContentCollection = {
  title: "Thăm hội viên",
  subtitle: "Lắng nghe, chia sẻ và đồng hành cùng hội viên",
  articles: [
    {
      id: "visit-1", topic: "Giao lưu", title: "Gặp gỡ và tìm hiểu hoạt động doanh nghiệp hội viên", publishedAt: "2026-11-05", image: null, visit: visitDetails["visit-1"],
      summary: "Lắng nghe chia sẻ và tìm hiểu nhu cầu kết nối của doanh nghiệp.",
      paragraphs: ["Dữ liệu mẫu: Đại diện Hội gặp gỡ doanh nghiệp hội viên để tìm hiểu hoạt động sản xuất, kinh doanh và chia sẻ định hướng phát triển.", "Hoạt động hướng đến tăng cường gắn kết và tìm kiếm cơ hội đồng hành trong cộng đồng hội viên."],
    },
    {
      id: "visit-2", topic: "Đồng hành", title: "Đồng hành cùng hội viên phát triển thị trường", publishedAt: "2026-10-25", image: null, visit: visitDetails["visit-2"],
      summary: "Chia sẻ định hướng hợp tác, giới thiệu sản phẩm và mở rộng kết nối.",
      paragraphs: ["Dữ liệu mẫu: Chương trình thăm hội viên là dịp trao đổi kinh nghiệm và giới thiệu những sản phẩm, dịch vụ của doanh nghiệp.", "Hình ảnh và thông tin thực tế sẽ được bổ sung khi hệ thống kết nối API."],
    },
    {
      id: "visit-3", topic: "Hội viên mới", title: "Kết nối hội viên mới trong cộng đồng Tân Sơn", publishedAt: "2026-10-16", image: null, visit: visitDetails["visit-3"],
      summary: "Chào đón doanh nghiệp mới và chia sẻ các hoạt động của Hội.",
      paragraphs: ["Dữ liệu mẫu: Hội giới thiệu các hoạt động kết nối và tạo điều kiện để hội viên mới làm quen với cộng đồng doanh nghiệp.", "Nội dung này dùng để minh họa chuyên mục Thăm hội viên."],
    },
  ],
};
