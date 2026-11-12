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
| `member-access.ts` | Xin quyền Zalo, POST `/member/session` để xác minh/lưu tài khoản; GET `/member/members` chỉ sau khi backend xác nhận là hội viên |
| `api.ts` | Base URL, timeout 15 giây, lỗi API, phân trang tối đa 100 mục/lần và URL ảnh `uploads/...` |

Tên Hội, logo và slogan giữ theo cấu hình thương hiệu trong `src/datas/association.ts`. Danh sách rỗng từ backend được hiển thị rỗng; lỗi kết nối có nút thử lại, không tự thay bằng dữ liệu mẫu.

Khi người dùng bấm một chức năng, mini app kiểm tra phiên xác thực. Nếu chưa có phiên, Zalo SDK xin quyền `scope.userInfo` và `scope.userPhonenumber` bằng popup của Zalo. Quyền đã cấp được Zalo ghi nhớ; không dựng popup giả hoặc ép hỏi lại mỗi lần bấm. Từ chối tên/ảnh thì giữ nguyên trang và cho phép thử lại; số điện thoại là tùy chọn. Sau khi xác thực và lưu thành công, mở tiếp đúng chức năng vừa chọn. Phiên giao diện có thời hạn 15 phút, token không lưu trên thiết bị.

Backend lấy ID/tên/ảnh từ máy chủ Zalo rồi upsert vào collection `zalo_users` theo ID, cập nhật lần đăng nhập/cấp quyền, không lưu access token. Số điện thoại chỉ được lưu sau khi backend đổi `phoneToken` thành số thật bằng Zalo API; cấu hình `ZALO_APP_SECRET` trong `.env` **của backend**, không đưa secret vào biến `VITE_*`. Thiếu secret vẫn lưu tên/ảnh và cho dùng chức năng chung, đồng thời thông báo chưa xác minh được số điện thoại.

Không có bước gửi hoặc nhập mã Zalo. Số điện thoại được Zalo xác minh tự đối chiếu hồ sơ hội viên đang hoạt động (hỗ trợ đầu 0/+84 và dấu cách). Chỉ tự liên kết khi có đúng một hồ sơ khớp, chưa thuộc tài khoản Zalo khác. Số trùng nhiều hồ sơ, chưa có hồ sơ hoặc chưa chia sẻ số không tự được cấp tư cách hội viên; tài khoản vẫn được lưu và có thể đăng ký hội viên bình thường. Danh bạ tiếp tục yêu cầu hội viên hợp lệ và không có API công khai.

Danh bạ trả tên, doanh nghiệp và vai trò; thông tin cá nhân chi tiết chỉ được tải cho chính hồ sơ đang đăng nhập. Token chỉ dùng trong lần xác thực, không lưu localStorage. Luồng Zalo thật cần thử trong ứng dụng Zalo trên thiết bị; không giả lập đăng nhập thành công trên trình duyệt. Backend chưa có dữ liệu thật cho hội phí, lịch sử tham gia và tài trợ. Không đưa tài khoản/token quản trị vào mini app. Trạng thái đọc thông báo vẫn lưu trên thiết bị.

Logo và 6 icon tiện ích nhúng trực tiếp từ `src/assets/` vào bundle qua plugin `fixed-brand-assets`; không lấy từ backend hoặc phụ thuộc đường dẫn ảnh của khung xem trước Zalo.

Đặt `VITE_USE_MOCK_DATA=true` để xem lại giao diện mẫu; gửi đăng ký bị chặn ở chế độ này. Mặc định ứng dụng gọi backend thật.

Nếu toàn bộ API báo lỗi khi chạy local, kiểm tra backend đang chạy ở cổng 4000: mở terminal tại `D:\HDN_TanSon_Backend\hdn_tanson_be` và chạy `npm start`. Giữ terminal backend chạy cùng mini app. Proxy dùng `127.0.0.1` để khớp địa chỉ IPv4 mà backend lắng nghe; khi backend tắt, ứng dụng hiển thị thông báo yêu cầu khởi động backend và nút thử lại. Zalo CLI mở khung xem trước ở cổng 3000, ứng dụng bên trong thường chạy ở cổng 2999; kiểm tra API trên cổng ứng dụng hoặc trực tiếp cổng 4000.

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

### Vercel

Repo có `vercel.json` cấu hình chạy `npm run build` và phục vụ thư mục `www`.
Trên Vercel, đặt Root Directory vào thư mục chứa `package.json` và khai báo
`VITE_API_BASE_URL=https://<backend-domain>/api/v1` trong Environment Variables
trước khi deploy. Backend cần cho phép domain frontend trong `CORS_ORIGINS`;
proxy phát triển trong Vite không chạy trên Vercel. Sau khi thay biến môi trường,
redeploy để đưa giá trị mới vào bundle.

### Zalo Mini App

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

## Backend Vercel

Cấu hình hiện tại thay thế hướng dẫn chạy backend local ở trên: .env dùng VITE_API_BASE_URL=/api/v1 qua proxy Vite tới https://behdntanson.vercel.app, không cần chạy backend cổng 4000. Khởi động lại dev server sau khi đổi cấu hình.

.env.production đặt VITE_API_BASE_URL=https://behdntanson.vercel.app/api/v1 và VITE_USE_MOCK_DATA=false; npm run build dùng cấu hình này. Nếu hosting đã có các biến cùng tên, cập nhật tương ứng rồi build/deploy lại.

Khi chạy Zalo thật, cho phép domain behdntanson.vercel.app trong cấu hình mạng Mini App; backend cần thêm origin thực tế của mini app vào CORS_ORIGINS. Không đưa secret Zalo hoặc MongoDB vào biến VITE_*. Ảnh uploads/... chưa được hỗ trợ trên Vercel; dùng URL ảnh từ dịch vụ lưu trữ ngoài.
