# Quy ước cấu trúc dự án

- Mỗi trang đặt tại `src/pages/<tên-trang>/<tên-trang>.tsx`.
- Component riêng của trang đặt trong `src/components/<tên-trang>/`; `index.tsx` lắp ghép các component nhỏ cùng thư mục.
- Áp dụng cấu trúc này cho tất cả trang hiện có và trang thêm mới. Không gộp giao diện, biểu mẫu và logic của nhiều trang vào một component như `feature-page`.
- Component thực sự dùng chung đặt trong `src/components/shared/`. Điều phối tab, tải dữ liệu và khung ứng dụng nằm trong `src/components/app-shell.tsx`, không nằm trong một trang cụ thể.
- Header có nút quay lại dùng chung `PageToolbar`: nền xanh, nút tròn trắng. Danh sách nội dung dùng `ContentCategories` ở đầu màn và `ContentListItem` cho thẻ ngang mở trang chi tiết.
- Dữ liệu mẫu và cấu hình nội dung đặt trong `src/datas/`. Lời gọi API hoặc lớp thay thế dữ liệu mẫu đặt trong `src/services/`. Truyền dữ liệu qua props cho component giao diện.
- Giữ tên thương hiệu là Hội Doanh nghiệp Phường Tân Sơn; dùng logo có sẵn trong assets.
- Slogan thống nhất là "Trách nhiệm - Sẵn sàng - Vươn mình", dùng dữ liệu `association.slogan` hoặc hằng `associationSlogan` trong `src/datas/association.ts`.
