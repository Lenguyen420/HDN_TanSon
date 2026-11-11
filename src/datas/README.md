# Dữ liệu giao diện

- `association.ts`: thông tin Hội và logo chính thức trong assets.
- `banners.ts`: danh sách ảnh banner.
- `members.ts`: hội viên, Ban chấp hành và hồ sơ cá nhân mẫu. `jobTitle` là chức vụ tại doanh nghiệp, `position` là vai trò tại Hội. `avatar`, `birthDate`, `phone`, `email`, `joinedAt` có thể để trống; ảnh thiếu dùng chữ viết tắt, thông tin thiếu hiển thị “Chưa có”. Toàn bộ thông tin liên hệ đang là dữ liệu minh họa.
- `notifications.ts`: thông báo mẫu, ảnh, nội dung đầy đủ và liên kết đến bài viết/sự kiện liên quan. Trạng thái đọc được ghi đè và lưu trên thiết bị qua `src/services/notifications.ts`; không thay đổi dữ liệu mẫu gốc.
- `utilities.ts`: danh sách, nhãn và ảnh icon của các tiện ích.
- `utility-pages.ts`: dữ liệu cho Giới thiệu, hội phí, lịch sử tham gia, tài trợ, liên hệ và trợ lý sự kiện. Các bản ghi có trường riêng để lọc, tính tổng và thay bằng API.
  Phần `contact.hotlines` chứa hai hotline mẫu của hộp Liên hệ hỗ trợ; thay `number`, `email`, `zaloUrl` bằng thông tin chính thức khi có. `zaloUrl: null` hiển thị thông báo đang cập nhật thay vì mở một tài khoản không xác định.
- `activity-statuses.ts`: nhãn trạng thái tham gia: đăng ký, tham gia, vắng mặt, đã hủy. Khi không có bản ghi phù hợp, giao diện hiển thị trạng thái rỗng.
- `navigation.ts`: cấu hình điều hướng.
- `pages.ts`: tiêu đề và mô tả của từng trang.
- `content-categories.ts`: danh mục chọn nhanh và tiêu đề trang chi tiết cho Tin tức, Sự kiện, Thăm hội viên.
- `registration.ts`: danh sách đơn vị công tác mẫu. Form đăng kí dùng `RegistrationDraft`; đọc/lưu nháp và kiểm tra thông tin ở `src/services/registration.ts`. Nút Đăng ký hiện chỉ lưu trên thiết bị, chưa gửi hồ sơ đến backend.
- `news.ts`, `events.ts`, `member-visits.ts`: bài viết mẫu cho Tin tức, Sự kiện, Thăm hội viên. `image` có thể là URL hoặc `null`; thiếu ảnh hoặc tải lỗi sẽ dùng `assets/placeholder/article.svg`.
- `article-details.ts`: lịch trình sự kiện và thông tin doanh nghiệp được thăm, đều là dữ liệu mẫu.

Trường `topic` của bài viết là nhãn chủ đề dùng để tạo các nút lọc bên dưới danh mục. Danh sách và chi tiết dùng chung bản ghi `ContentArticle` để hiển thị và điều hướng.
- `types.ts`: kiểu dữ liệu mà giao diện sử dụng.

Các hồ sơ, lịch sử và thông báo là dữ liệu minh họa, không phải thông tin chính thức. `isDemo: true` bật nhãn Dữ liệu mẫu trên giao diện.

Trang Cá nhân có màn sửa riêng tại `pages/profile-edit/profile-edit.tsx`. `src/services/profile.ts` kiểm tra, lưu và đọc thay đổi trên thiết bị; `app-shell` áp dụng vào hội viên hiện tại để hồ sơ và danh bạ hiển thị nhất quán. Vai trò, mã và trạng thái hội viên không nằm trong trường chỉnh sửa. Chưa có API đồng bộ hồ sơ hoặc thanh toán hội phí.

Khung ứng dụng `src/components/app-shell.tsx` gọi `getAppData()` trong `src/services/association.ts` và truyền dữ liệu xuống từng trang. Khi có backend, thay phần thân hàm bằng lời gọi API, chuẩn hóa response theo `AppData`, rồi đặt `isDemo: false`. Các component không cần đổi cách lấy dữ liệu.
