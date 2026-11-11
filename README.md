# Zalo Mini App

## Kết nối backend Tân Sơn

Các lời gọi API nằm trong `src/services/`; `AppShell` tải dữ liệu qua `getAppData()` và truyền xuống giao diện bằng props.

1. Tạo `.env` ở thư mục gốc theo `.env.example` (hoặc bổ sung các biến nếu đã có).
2. Khi phát triển local, để `VITE_API_BASE_URL=/api/v1` (cũng là mặc định ở chế độ dev). Vite proxy `/api` và `/uploads` tới `http://localhost:4000`, tránh phụ thuộc CORS của backend. Có thể đặt URL tuyệt đối để gọi backend trực tiếp. Khởi động lại mini app sau khi sửa biến môi trường.
3. Chạy backend tại `D:\HDN_TanSon_Backend\hdn_tanson_be` với cấu hình MongoDB của backend, rồi chạy `npm start` tại mini app.
4. Trước khi build/chạy trên điện thoại/Zalo, đặt `VITE_API_BASE_URL=https://<backend-domain>/api/v1` và cấu hình domain mạng của Mini App. Backend phải cho phép origin của mini app trong `CORS_ORIGINS`; proxy Vite chỉ dùng khi phát triển và localhost trên điện thoại không trỏ tới máy tính.

| Service | API đã nối |
| --- | --- |
| `content.ts` | GET `/public/news`, `/public/events`, `/public/member-visits`, `/public/banners`, `/public/notifications`; có hàm lấy chi tiết bài viết |
| `settings.ts` | GET `/public/settings`: giới thiệu, sứ mệnh, liên hệ, trợ lý và câu hỏi |
| `registration.ts` | POST `/public/registrations`: ánh xạ tên công ty và `position` sang `jobTitle`, nhận kết quả chờ duyệt |
| `api.ts` | Base URL, timeout 15 giây, lỗi API, phân trang tối đa 100 mục/lần và URL ảnh `uploads/...` |

Tên Hội, logo và slogan giữ theo cấu hình thương hiệu trong `src/datas/association.ts`. Danh sách rỗng từ backend được hiển thị rỗng; lỗi kết nối có nút thử lại, không tự thay bằng dữ liệu mẫu.

Backend hiện chỉ cung cấp `/admin/members` có xác thực quản trị, chưa có API public cho danh bạ/doanh nghiệp, hồ sơ cá nhân, hội phí, lịch sử tham gia và tài trợ. Những mục này chưa có dữ liệu thật; form đăng ký cho phép nhập tên doanh nghiệp trực tiếp. Không đưa tài khoản/token quản trị vào mini app. Trạng thái đọc thông báo vẫn lưu trên thiết bị.

Đặt `VITE_USE_MOCK_DATA=true` để xem lại giao diện mẫu; gửi đăng ký bị chặn ở chế độ này. Mặc định ứng dụng gọi backend thật.

## Development

### Using Zalo Mini App Extension

1. Install [Visual Studio Code](https://code.visualstudio.com/download) and [Zalo Mini App Extension](https://mini.zalo.me/docs/dev-tools).
1. In the **Home** tab, process **Config App ID** and **Install Dependencies**.
1. Navigate to the **Run** tab, select the suitable launcher, and click **Start**.

### Using Zalo Mini App CLI

1. [Install Node JS](https://nodejs.org/en/download/).
1. [Install Zalo Mini App CLI](https://mini.zalo.me/docs/dev-tools/cli/intro/).
1. **Install dependencies**:
   ```bash
   npm install
   ```
1. **Start** the dev server:
   ```bash
   zmp start
   ```
1. **Open** `localhost:3000` in your browser.

## Deployment

1. **Create** a mini program. For instructions on how to create a mini program, please refer to the [Coffee Shop Tutorial](https://mini.zalo.me/tutorial/coffee-shop/step-1/)

1. **Deploy** your mini program to Zalo using the mini app ID created.

   - **Using Zalo Mini App Extension**: navigate to the **Deploy** panel > **Login** > **Deploy**.
   - **Using Zalo Mini App CLI**:
     ```bash
     zmp login
     zmp deploy
     ```

1. Open the mini app in Zalo by scanning the QR code.

## Resources

- [Zalo Mini App Official Website](https://mini.zalo.me/)
- [ZaUI Documentation](https://mini.zalo.me/documents/zaui/)
- [ZMP SDK Documentation](https://mini.zalo.me/documents/api/)
- [DevTools Documentation](https://mini.zalo.me/docs/dev-tools/)
- [Ready-made Mini App Templates](https://mini.zalo.me/zaui-templates)
- [Community Support](https://mini.zalo.me/community)
