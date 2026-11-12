import first from "@/assets/banner/legacy/c45fd865-8891-4c6c-8d4b-79a6150cc44a.webp";
import second from "@/assets/banner/legacy/5a684cf6-a336-4567-b89e-4ee0e19cb910.webp";
import third from "@/assets/banner/legacy/1237e65e-00c1-4f95-9843-c373979ed2bb.webp";

// Bản sao đúng các ảnh cũ trong uploads local, không phải banner dữ liệu mẫu.
// Banner mới dùng URL lưu trữ ảnh do backend trả về.
export const legacyBannerImages: Record<string, string> = {
  "uploads/banners/c45fd865-8891-4c6c-8d4b-79a6150cc44a.webp": first,
  "uploads/banners/5a684cf6-a336-4567-b89e-4ee0e19cb910.webp": second,
  "uploads/banners/1237e65e-00c1-4f95-9843-c373979ed2bb.webp": third,
};
