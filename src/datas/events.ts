import eventImage from "@/assets/banner/optimized/2.jpg";
import connectionImage from "@/assets/banner/optimized/3.jpg";
import type { ContentCollection } from "./types";
import { eventDetails } from "./article-details";

export const events: ContentCollection = {
  title: "Sự kiện",
  subtitle: "Giao lưu, kết nối và đồng hành cùng doanh nghiệp",
  articles: [
    {
      id: "event-1", topic: "Kết nối", title: "Chương trình giao lưu và kết nối doanh nghiệp", publishedAt: "2026-11-06", image: eventImage, event: eventDetails["event-1"],
      summary: "Không gian gặp gỡ, giới thiệu sản phẩm và chia sẻ cơ hội kinh doanh.",
      paragraphs: ["Dữ liệu mẫu: Chương trình gồm hoạt động giao lưu doanh nhân, giới thiệu doanh nghiệp và kết nối theo lĩnh vực quan tâm.", "Thời gian và địa điểm tổ chức chính thức đang được cập nhật. Thông tin này minh họa giao diện sự kiện."],
    },
    {
      id: "event-2", topic: "Giao lưu", title: "Cà phê doanh nhân: Chia sẻ kinh nghiệm phát triển", publishedAt: "2026-10-20", image: connectionImage, event: eventDetails["event-2"],
      summary: "Cùng thảo luận những kinh nghiệm quản trị và vận hành doanh nghiệp.",
      paragraphs: ["Dữ liệu mẫu: Buổi gặp gỡ tạo điều kiện để hội viên trao đổi kinh nghiệm thực tiễn và kết nối với các doanh nghiệp cùng mối quan tâm.", "Thông tin tham dự sẽ được công bố trong các thông báo chính thức từ Hội."],
    },
    {
      id: "event-3", topic: "Hội thảo", title: "Hội thảo ứng dụng công nghệ trong doanh nghiệp", publishedAt: "2026-10-10", image: null, event: eventDetails["event-3"],
      summary: "Trao đổi về công cụ số và các hướng ứng dụng trong hoạt động kinh doanh.",
      paragraphs: ["Dữ liệu mẫu: Hội thảo giới thiệu các tình huống ứng dụng công nghệ vào quản lý, chăm sóc khách hàng và vận hành doanh nghiệp.", "Nội dung, diễn giả và lịch trình chính thức đang được cập nhật."],
    },
  ],
};
