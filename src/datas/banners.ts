import first from "@/assets/banner/optimized/1.jpg";
import second from "@/assets/banner/optimized/2.jpg";
import third from "@/assets/banner/optimized/3.jpg";
import type { BannerItem } from "./types";

export const banners: BannerItem[] = [
  { id: "banner-1", image: first, alt: "Hoạt động chung tay hỗ trợ cộng đồng" },
  { id: "banner-2", image: second, alt: "Hoạt động kết nối doanh nghiệp" },
  { id: "banner-3", image: third, alt: "Chương trình và sự kiện của Hội" },
];
