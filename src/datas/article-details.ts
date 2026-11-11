import type { ContentArticle } from "./types";

export const eventDetails: Record<string, NonNullable<ContentArticle["event"]>> = {
  "event-1": {
    date: "2026-11-20", time: "08:00 – 11:30", venue: "Không gian kết nối doanh nghiệp (mẫu)", address: "Phường Tân Sơn, TP. Hồ Chí Minh · Địa điểm minh họa",
    agenda: [{ time: "08:00", title: "Đón tiếp hội viên, giao lưu đầu giờ" }, { time: "08:30", title: "Giới thiệu doanh nghiệp và sản phẩm" }, { time: "09:30", title: "Kết nối cơ hội hợp tác" }, { time: "11:00", title: "Tổng kết và chụp ảnh lưu niệm" }],
  },
  "event-2": {
    date: "2026-10-25", time: "08:00 – 10:00", venue: "Không gian cà phê doanh nhân (mẫu)", address: "Phường Tân Sơn, TP. Hồ Chí Minh · Địa điểm minh họa",
    agenda: [{ time: "08:00", title: "Đón tiếp và kết nối hội viên" }, { time: "08:30", title: "Chia sẻ kinh nghiệm phát triển doanh nghiệp" }, { time: "09:30", title: "Trao đổi và thảo luận" }],
  },
  "event-3": {
    date: "2026-10-15", time: "13:30 – 16:30", venue: "Phòng hội thảo doanh nghiệp (mẫu)", address: "Phường Tân Sơn, TP. Hồ Chí Minh · Địa điểm minh họa",
    agenda: [{ time: "13:30", title: "Đón tiếp và giới thiệu chương trình" }, { time: "14:00", title: "Ứng dụng công nghệ trong vận hành" }, { time: "15:00", title: "Thảo luận tình huống và hỏi đáp" }],
  },
};

export const visitDetails: Record<string, NonNullable<ContentArticle["visit"]>> = {
  "visit-1": { company: "Công ty TNHH Minh An", representative: "Nguyễn Minh An", date: "2026-11-04", address: "Phường Tân Sơn, TP. Hồ Chí Minh", field: "Thương mại và dịch vụ" },
  "visit-2": { company: "Công ty CP Ngọc Anh", representative: "Trần Ngọc Anh", date: "2026-10-24", address: "Phường Tân Sơn, TP. Hồ Chí Minh", field: "Phân phối và phát triển thị trường" },
  "visit-3": { company: "Công ty TNHH Thanh Hà", representative: "Phạm Thanh Hà", date: "2026-10-15", address: "Phường Tân Sơn, TP. Hồ Chí Minh", field: "Dịch vụ doanh nghiệp" },
};
