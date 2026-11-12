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
| `association.ts` | Tải danh bạ công khai GET `/public/members`, không yêu cầu xác thực Zalo |
| `api.ts` | Base URL, timeout 15 giây, lỗi API, phân trang tối đa 100 mục/lần và URL ảnh `uploads/...` |

Tên Hội, logo và slogan giữ theo cấu hình thương hiệu trong `src/datas/association.ts`. Danh sách rỗng từ backend được hiển thị rỗng; lỗi kết nối có nút thử lại, không tự thay bằng dữ liệu mẫu.

Mini App mở tất cả các màn hình mà không yêu cầu xác thực hoặc cấp quyền Zalo. Danh bạ và Ban chấp hành lấy từ GET `/public/members`, gồm các hội viên đang hoạt động và thông tin tên, doanh nghiệp, chức danh, vai trò. Không tự chọn một hội viên làm người đang sử dụng; tab Cá nhân hiển thị trạng thái khách khi chưa có hồ sơ. Các màn hình hội phí, lịch sử tham gia và tài trợ vẫn mở được, nhưng chưa có dữ liệu thật từ backend.

Đăng ký hội viên gửi trực tiếp tới POST `/public/registrations`. API quản trị và API hồ sơ cá nhân vẫn yêu cầu xác thực riêng. Trạng thái đọc thông báo được lưu trên thiết bị. Khi triển khai thay đổi này, deploy backend có `/public/members` trước frontend.

Logo và 6 icon tiện ích giữ nguyên file gốc trong `src/assets/`, được Vite build thành ảnh có tên hash để tải/cache riêng. Không nhúng base64 vào JavaScript và không phụ thuộc backend ảnh.

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

Khi chạy Zalo thật, cho phép domain behdntanson.vercel.app trong cấu hình mạng Mini App; backend cần thêm origin thực tế của mini app vào CORS_ORIGINS. Không đưa secret Zalo hoặc MongoDB vào biến VITE_*. Backend lưu ảnh mới trong MongoDB GridFS và phục vụ qua /uploads/....

Ba ảnh banner cũ đã được sao chép nguyên file từ uploads local vào `src/assets/banner/legacy/` và ánh xạ theo đường dẫn cũ trong `src/datas/legacy-banner-images.ts`. Frontend phục vụ bản sao này qua asset build; thứ tự, nội dung và trạng thái banner vẫn lấy từ API. Banner mới dùng đường dẫn uploads/... của backend GridFS hoặc URL ảnh công khai. Ánh xạ chỉ áp dụng cho ba đường dẫn cũ, không thay ảnh mới bằng dữ liệu mẫu.


## Tối ưu tốc độ tải

AppShell chọn resources theo màn hình: trang chủ tải cấu hình, banner, danh bạ Ban chấp hành, thông báo và danh mục đang chọn; sự kiện/thăm hội viên được tải khi mở. getAppData hỗ trợ resources, force và onUpdate để hiển thị từng phần mà không chờ API chậm nhất. Cache public trong RAM 30 giây và chia sẻ request đang chạy, không lưu dữ liệu cache vào localStorage; nút Thử lại bỏ cache của màn hình. Chuyển màn hình kiểm tra lại TTL. Không áp dụng cache này cho API xác thực Zalo hoặc đăng ký.

Bản build đo được: JS chính giảm từ khoảng 2.150 KB (gzip 1.470 KB) xuống 345 KB (gzip 109 KB). Ảnh không bị thay đổi; được tải riêng qua assets. Đây là số đo JS, không phải tổng dung lượng ảnh.


## Lưu tên và ảnh Zalo SDK

Khi chọn Cá nhân hoặc Đăng kí, Mini App kiểm tra quyền scope.userInfo và hiển thị hộp thoại Zalo nếu chưa được cấp quyền. Sau khi đồng ý, getUserInfo lấy ID/tên/ảnh, rồi gửi POST /api/v1/public/zalo-profiles. Chỉ mở tab sau khi backend ghi MongoDB thành công. Không có màn hình hoặc nút xác nhận riêng.

Không xin số điện thoại/access token và không gọi API xác minh phía server. Backend lưu riêng vào zalo_sdk_profiles với verificationStatus=unverified, không liên kết hoặc cấp tư cách hội viên. Thông tin này chưa chứng minh danh tính; không dùng cho tính năng cần xác thực. Từ chối quyền hoặc lỗi MongoDB thì giữ nguyên trang và cho chọn lại tab để thử.

Luồng này hoạt động với backend Vercel, không cần chuyển VPS hoặc App Secret. Deploy lại backend trước, sau đó build/deploy Mini App. Cần thử cấp quyền thật trên Zalo ở thiết bị; trình duyệt chỉ dùng để kiểm tra giao diện.


## Thông báo kết quả đăng ký

Khi gửi hồ sơ, Mini App tạo mã theo dõi ngẫu nhiên 256 bit và lưu trên thiết bị trước khi gọi API. Mã đi kèm hồ sơ; MongoDB chỉ lưu SHA-256. Mục Thông báo và badge nhận trạng thái đã tiếp nhận, được duyệt hoặc từ chối (kèm lý do nếu có). Mỗi sự kiện có ID ổn định để không đánh dấu chưa đọc lại sau mỗi lần tải. Thông báo đọc/chưa đọc được lưu trên thiết bị.

Ứng dụng kiểm tra kết quả mỗi 5 giây khi đang hiển thị và ngay sau khi gửi hồ sơ/quay lại ứng dụng. Khi mất mạng giữ thông báo cũ và tự thử lại. Không có push khi Zalo đã đóng. Chỉ giữ mã theo dõi của 20 lần gửi gần nhất trên thiết bị này; xóa bộ nhớ, đổi thiết bị hoặc đổi origin sẽ mất quyền đọc kết quả cũ. Nếu bộ nhớ bị chặn thì vẫn gửi hồ sơ được và có cảnh báo chỉ theo dõi trong phiên đang mở. Không dùng ID Zalo chưa xác minh để truy cập kết quả người khác.

Deploy backend, admin và Mini App để sử dụng các API mới. Hồ sơ cũ trước thay đổi này không có mã theo dõi nên không tự xuất hiện trong thông báo cá nhân.


## Hồ sơ Cá nhân sau xét duyệt

API kết quả theo mã theo dõi trả thêm profiles của đúng hồ sơ sở hữu mã. Trang Cá nhân hiển thị thông tin cá nhân, doanh nghiệp và thông tin hệ thống; sau khi duyệt hiển thị thêm mã hội viên, ngày gia nhập, vai trò và trạng thái hiện tại từ collection members. Dữ liệu này cập nhật cùng chu kỳ thông báo 5 giây. Nếu bị từ chối, hiển thị lý do đã lưu. Trạng thái pending vẫn hiển thị hồ sơ đã gửi. Không tự liên kết tài khoản Zalo hoặc mở quyền admin/danh bạ riêng chỉ vì có tên/ảnh SDK.

Các trường hệ thống chỉ đọc từ backend; không dùng sửa hồ sơ cục bộ cho hồ sơ được theo dõi bằng mã. Mã theo dõi lưu trên thiết bị gửi hồ sơ, nên xóa bộ nhớ hoặc đổi thiết bị không tự tìm lại được hồ sơ.


## Chỉnh sửa Cá nhân và Hỗ trợ

Trang Cá nhân hiện thay khối Thông tin hệ thống bằng Liên hệ hỗ trợ, Về chúng tôi, Điều khoản & chính sách. Liên hệ và giới thiệu dùng dữ liệu đã có từ cấu hình Hội; trang điều khoản mở được nhưng để trống theo yêu cầu. Chỉnh sửa thông tin cho phép thay tên, ngày sinh, số điện thoại, email, doanh nghiệp, chức vụ, địa chỉ và mã số thuế. Hồ sơ có mã theo dõi lưu trực tiếp lên MongoDB; với hồ sơ đã duyệt, backend cập nhật hồ sơ đăng ký và hội viên cùng transaction. Từ chối lưu thì giữ biểu mẫu và hiện lỗi; không báo lưu thành công trước khi API hoàn tất.

Không chỉnh sửa mã hội viên, ngày gia nhập, trạng thái xét duyệt hoặc vai trò. Quyền sửa bằng mã theo dõi đã lưu trên thiết bị, không dùng ID Zalo tự khai báo. Deploy lại backend và Mini App trước khi dùng API mới.
