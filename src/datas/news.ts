import communityImage from "@/assets/banner/optimized/1.jpg";
import activityImage from "@/assets/banner/optimized/3.jpg";
import type { ContentCollection } from "./types";

export const news: ContentCollection = {
  title: "Tin tức",
  subtitle: "Thông tin và hoạt động mới từ Hội",
  articles: [
    {
      id: "news-1", topic: "Cộng đồng", title: "Doanh nghiệp Tân Sơn chung tay vì cộng đồng", publishedAt: "2026-11-08", image: communityImage,
      summary: "Lan tỏa tinh thần sẻ chia và trách nhiệm xã hội trong cộng đồng doanh nghiệp.",
      paragraphs: ["Dữ liệu mẫu: Hội Doanh nghiệp Phường Tân Sơn kết nối các doanh nghiệp trong những hoạt động hỗ trợ cộng đồng, đồng hành cùng các hoàn cảnh khó khăn.", "Những đóng góp của hội viên góp phần lan tỏa tinh thần sẻ chia và xây dựng cộng đồng phát triển bền vững. Nội dung này dùng để minh họa giao diện."],
    },
    {
      id: "news-2", topic: "Hoạt động hội", title: "Kết nối doanh nhân, mở rộng cơ hội hợp tác", publishedAt: "2026-11-03", image: activityImage,
      summary: "Chia sẻ kinh nghiệm, giới thiệu sản phẩm và tìm kiếm đối tác trong cộng đồng hội viên.",
      paragraphs: ["Dữ liệu mẫu: Chương trình kết nối doanh nhân tạo không gian để hội viên giới thiệu doanh nghiệp, trao đổi nhu cầu và tìm kiếm cơ hội hợp tác.", "Thông tin chương trình chính thức sẽ được cập nhật khi hệ thống kết nối dữ liệu thực tế."],
    },
    {
      id: "news-3", topic: "Hội viên", title: "Cập nhật thông tin danh bạ hội viên năm 2026", publishedAt: "2026-10-28", image: null,
      summary: "Hoàn thiện thông tin doanh nghiệp để tăng cường kết nối hội viên.",
      paragraphs: ["Dữ liệu mẫu: Hội viên có thể chuẩn bị thông tin giới thiệu doanh nghiệp, lĩnh vực hoạt động và nhu cầu kết nối để cập nhật hồ sơ.", "Bài viết chưa có ảnh riêng, hệ thống hiển thị ảnh placeholder."],
    },
  ],
};
