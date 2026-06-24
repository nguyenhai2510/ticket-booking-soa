# 🎟️ EVENTPASS - TÀI LIỆU KHẢO SÁT & BÀN GIAO DỰ ÁN (PROJECT ONBOARDING)

Chào mừng bạn đến với **Ticket Booking System (EventPass)** - Hệ thống bán vé sự kiện trực tuyến được thiết kế theo kiến trúc Microservices (SOA). Tài liệu này cung cấp cái nhìn toàn diện về kiến trúc hệ thống, trạng thái hiện tại, và hướng dẫn thiết lập nhanh môi trường phát triển cục bộ.

> [!IMPORTANT]
> Chi tiết build/run và các quy tắc phát triển nghiêm ngặt được quy định tại [CLAUDE.md](file:///d:/Project_ca_nhan/ticket-booking-soa/CLAUDE.md) và [GEMINI.md](file:///d:/Project_ca_nhan/ticket-booking-soa/GEMINI.md). Để triển khai dự án lên môi trường thực tế (Production), tham khảo hướng dẫn tại [DEPLOYMENT.md](file:///d:/Project_ca_nhan/ticket-booking-soa/DEPLOYMENT.md). Hãy đọc kỹ trước khi thực hiện bất kỳ thay đổi nào.

---

## 🏗️ 1. Kiến Trúc Hệ Thống & Sơ Đồ Cổng (Ports Map)

Hệ thống tuân thủ mô hình **Database-per-service** độc lập hoàn toàn. Toàn bộ các yêu cầu từ phía Client (Frontend) bắt buộc phải đi qua API Gateway duy nhất.

| Thành phần | Port | Eureka Service Name | Cơ sở dữ liệu | Ghi chú / Vai trò |
| :--- | :---: | :--- | :--- | :--- |
| **`eureka-server`** | `8761` | — | Không có | Service Registry (Quản lý & định vị các dịch vụ) |
| **`api-gateway`** | `8080` | — | Không có | Cổng kết nối duy nhất, quản lý Routing & CORS |
| **`user-service`** | `8081` | `user-service` | `db_user` | Quản lý người dùng, đăng ký, đăng nhập & phân quyền |
| **`event-service`** | `8082` | `event-service` | `db_event` | Quản lý sự kiện, hạng vé & quản lý tồn kho |
| **`booking-service`**| `8083` | `booking-service`| `db_booking` | Quản lý đặt vé, thanh toán & điều phối SAGA |
| **`frontend`** | `5173` | — | Cục bộ | Giao diện khách hàng & Admin (React + Vite) |

### Giao tiếp liên dịch vụ (Inter-service Communication):
- Tất cả giao tiếp HTTP giữa các service backend bắt buộc phải đi qua `@LoadBalanced RestTemplate` hoặc `WebClient` với định danh Eureka (`lb://SERVICE-NAME`).
- Không được phép gọi chéo database hoặc hardcode địa chỉ IP/localhost giữa các service backend.
- Cấu hình định tuyến Gateway được triển khai tập trung qua Java DSL `RouterFunction` tại [GatewayConfig.java](file:///d:/Project_ca_nhan/ticket-booking-soa/api-gateway/src/main/java/com/ticketbooking/api_gateway/config/GatewayConfig.java).

---

## 🟢 2. Trạng Thái Phát Triển (Sprints Completed)

### 👥 Sprint 1: Quản Lý Người Dùng & Xác Thực (HOÀN TẤT)
- **Backend (`user-service`):** Triển khai API đăng ký tài khoản (`POST /api/users/register`) và đăng nhập (`POST /api/users/login`). Sử dụng BCrypt để băm mật khẩu, tích hợp Spring Security cơ bản.
- **API Gateway (`api-gateway`):** Định tuyến `/api/users/**` về `user-service`. Thiết lập cấu hình CORS cho phép giao diện frontend kết nối an toàn.
- **Frontend (`frontend`):** Thiết lập trang Đăng nhập (`/login`) và Đăng ký (`/register`) sử dụng thư viện Shadcn UI, Zod validation và react-hook-form.

### 📅 Sprint 2: Quản Lý Sự Kiện & Hạng Vé (HOÀN TẤT)
- **Backend (`event-service`):** Triển khai thực thể `Event` & `TicketCategory` với quan hệ 1-N. Hỗ trợ tự động tạo bảng thông qua JPA `ddl-auto: update`. Cung cấp CRUD API cho sự kiện.
- **API Gateway (`api-gateway`):** Định tuyến `/api/events/**` về `event-service`.
- **Frontend (`frontend`):** Trang chủ hiển thị danh sách sự kiện dưới dạng lưới thẻ (Grid Cards), hỗ trợ lọc danh mục cơ bản và thanh tìm kiếm động.

### 🔄 Sprint 3: Quy Trình Đặt Vé & Giao Dịch SAGA (HOÀN TẤT)
- **Backend (`booking-service` & `event-service`):**
  - Áp dụng mẫu thiết kế **SAGA Orchestration** qua `BookingSagaOrchestrator` để quản lý các bước tạo đơn đặt vé, giữ chỗ vé, và bồi hoàn (compensate) khi xảy ra lỗi.
  - Sử dụng cơ chế khóa lạc quan (Optimistic Locking) `@Version` trên `TicketCategory` ở `event-service` để tránh hiện tượng bán lố vé (overbooking) khi có nhiều yêu cầu mua vé đồng thời.
  - Hỗ trợ giữ chỗ vé có thời hạn (mặc định 5 phút), tự động giải phóng tồn kho bằng bộ lập lịch quét đơn hàng hết hạn (Scheduler).
  - Chi tiết tài liệu luồng SAGA: [sprint3-saga.md](file:///d:/Project_ca_nhan/ticket-booking-soa/docs/sprint3-saga.md).
- **Frontend (`frontend`):**
  - Trang chi tiết sự kiện (`/events/:id`) cho phép chọn số lượng vé theo từng hạng và gửi yêu cầu đặt vé.
  - Trang Checkout (`/checkout/:bookingId`) hiển thị thông tin hóa đơn tạm thời, tích hợp đồng hồ đếm ngược giữ chỗ 5 phút và mô phỏng nút thanh toán/hủy đơn.

### 📊 Sprint 4: Admin Dashboard & Quản Lý Sliders (HOÀN TẤT)
- **Giao diện Quản trị (`/admin`):**
  - Thiết kế layout quản trị chuyên nghiệp [AdminLayout.tsx](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/components/layout/AdminLayout.tsx) với sidebar điều hướng tiện lợi.
  - **Dashboard tổng quan ([Dashboard.tsx](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/pages/admin/Dashboard.tsx)):** Hiển thị các chỉ số kinh doanh chính (Tổng sự kiện, Lượng vé đã bán, Doanh thu ước tính, Sự kiện sắp diễn ra). Tích hợp biểu đồ cột động trực quan bằng thư viện `recharts` so sánh lượng vé đã bán trên tổng số vé.
  - **Quản lý Sự kiện ([Events.tsx](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/pages/admin/Events.tsx)):** Giao diện CRUD toàn diện cho phép Admin thêm, sửa, xóa sự kiện, quản lý các hạng vé đi kèm (tên hạng, số lượng, giá bán) và cập nhật đường dẫn ảnh poster.
  - **Quản lý Sliders ([Sliders.tsx](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/pages/admin/Sliders.tsx)):** Quản lý các slide banner hiển thị trên đầu trang chủ. Thông tin slide (ảnh, tiêu đề, thứ tự hiển thị, liên kết) được điều phối thông qua [sliderService.ts](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/api/sliderService.ts) lưu trữ ở `localStorage`.

### 🐳 Sprint 5: Hạ Tầng Docker & Tối Ưu Hóa Kết Nối (HOÀN TẤT)
- **Container hóa dịch vụ (Dockerization):**
  - Viết `Dockerfile` tối ưu hóa hai giai đoạn (multi-stage build) sử dụng Eclipse Temurin Alpine JRE 17 cho toàn bộ dịch vụ backend nhằm giảm dung lượng ảnh Docker và đảm bảo an toàn bảo mật (chạy bằng user non-root `spring:spring`).
  - Thiết lập file [docker-compose.prod.yml](file:///d:/Project_ca_nhan/ticket-booking-soa/docker-compose.prod.yml) để khởi chạy đồng bộ toàn bộ hạ tầng backend với cấu hình giới hạn tài nguyên RAM tối đa (512MB) và tham số JVM (`JAVA_TOOL_OPTIONS`) giúp tránh lỗi tràn bộ nhớ (OOM).
- **Kết nối cơ sở dữ liệu đám mây:**
  - Định hình cấu hình kết nối database trong tệp biến môi trường [.env](file:///d:/Project_ca_nhan/ticket-booking-soa/.env) kết nối tới dịch vụ PostgreSQL đám mây (Neon Tech), giúp đơn giản hóa việc triển khai độc lập mà không bắt buộc cài đặt Postgres cục bộ.
- **Tối ưu hóa Frontend Client:**
  - Cấu hình interceptor toàn cục trong [axiosClient.ts](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/api/axiosClient.ts) để tự động đính kèm Token xác thực vào tiêu đề Request, đồng thời bắt lỗi 401 Unauthorized để xóa token và điều hướng về trang đăng nhập.
  - Triển khai hook kiểm soát quyền truy cập [useRequireAuth.ts](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/hooks/useRequireAuth.ts) để tự động bảo vệ các trang yêu cầu đăng nhập (Home, Profile, Admin) bằng cách chuyển hướng người dùng chưa xác thực về `/login`.
  - Bổ sung trang hồ sơ cá nhân [Profile.tsx](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/pages/Profile.tsx) cho phép xem lại lịch sử đặt vé và trạng thái thanh toán cụ thể.

---

## 📂 3. Cấu Trúc Database Schema

Sơ đồ quan hệ dữ liệu chuẩn hóa của dự án được mô tả chi tiết tại [docs/schema.dbml](file:///d:/Project_ca_nhan/ticket-booking-soa/docs/schema.dbml).

| Database | Tên Bảng | Vai trò & Cấu trúc chính |
| :--- | :--- | :--- |
| **`db_user`** | `users` | Thông tin người dùng (`id` UUID, `username`, `email`, `password_hash`, `role`) |
| **`db_event`** | `events`<br>`ticket_categories` | `events`: lưu thông tin sự kiện (`id` UUID, `title`, `description`, `location`, `event_date`, `image_url`, `version`) <br>`ticket_categories`: lưu hạng vé và số lượng (`id`, `event_id`, `name`, `price`, `total_quantity`, `available_quantity`, `version`) |
| **`db_booking`** | `bookings`<br>`booking_items` | `bookings`: lưu thông tin đơn đặt vé (`id` UUID, `user_id`, `total_amount`, `status`, `reserved_until`, `booking_time`) <br>`booking_items`: lưu chi tiết từng loại vé trong đơn (`id`, `booking_id`, `ticket_category_id`, `quantity`, `price`) |

---

## 🛠️ 4. Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### Yêu Cầu Cần Thiết (Prerequisites):
- Java JDK 17 & Node.js (phiên bản 18+)
- Docker Desktop (được khuyến nghị để quản lý database nhanh)

### 👉 Cách 1: Khởi chạy toàn bộ hạ tầng Backend qua Docker Compose (Khuyên dùng)
Nếu bạn chỉ muốn thử nghiệm ứng dụng mà không cần sửa mã nguồn Spring Boot:
1. Đảm bảo Docker Desktop đã được mở.
2. Thiết lập biến mật khẩu và đường dẫn trong tệp [.env](file:///d:/Project_ca_nhan/ticket-booking-soa/.env).
3. Chạy lệnh tại thư mục gốc dự án:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```
4. Đợi docker hoàn thành build và khởi chạy các service: `eureka-server` (8761), `api-gateway` (8080) cùng các dịch vụ.
5. Truy cập Dashboard Eureka tại: [http://localhost:8761](http://localhost:8761) để kiểm tra trạng thái đăng ký của các service.

### 👉 Cách 2: Chạy Thủ Công Dưới Dạng Nhà Phát Triển (Development Mode)

#### Bước 1: Thiết lập cơ sở dữ liệu PostgreSQL cục bộ
Dự án đã có tệp cấu hình docker-compose cho database dev [docker-compose.db.yml](file:///d:/Project_ca_nhan/ticket-booking-soa/docker-compose.db.yml):
```bash
docker-compose -f docker-compose.db.yml up -d
```
Docker sẽ khởi chạy container PostgreSQL ở cổng `5432` và kích hoạt đoạn mã [init-scripts/init.sh](file:///d:/Project_ca_nhan/ticket-booking-soa/init-scripts/init.sh) để tạo sẵn 3 database trống: `db_user`, `db_event`, và `db_booking`.

#### Bước 2: Chạy các dịch vụ Spring Boot (Backend)
Hãy khởi chạy các dịch vụ theo **đúng thứ tự** sau, mở từng tab terminal riêng cho mỗi dịch vụ:
1. **Khởi chạy Eureka Server:**
   ```bash
   cd eureka-server && ./mvnw spring-boot:run
   ```
   *(Chờ khoảng 30 giây để Eureka khởi động hoàn toàn trước khi tiếp tục).*
2. **Khởi chạy các Microservices:**
   ```bash
   cd ../user-service && ./mvnw spring-boot:run
   cd ../event-service && ./mvnw spring-boot:run
   cd ../booking-service && ./mvnw spring-boot:run
   ```
3. **Khởi chạy API Gateway:**
   ```bash
   cd ../api-gateway && ./mvnw spring-boot:run
   ```

#### Bước 3: Khởi chạy ứng dụng React (Frontend)
Mở một tab terminal mới và thực thi:
```bash
cd frontend
npm install
npm run dev
```
Trình duyệt sẽ tự động mở trang web phát triển (thường là [http://localhost:5173](http://localhost:5173)). Đăng nhập với tài khoản mẫu hoặc đăng ký tài khoản mới để bắt đầu trải nghiệm!

---

## 🚀 5. Triển Khai Lên Production (Production Deployment)

Dự án hỗ trợ triển khai thực tế trên môi trường Production (ví dụ: VPS Ubuntu 22.04 LTS) tích hợp HTTPS tự động thông qua Web Server **Caddy** và cơ sở dữ liệu đám mây **Neon PostgreSQL**.

### Tóm tắt các thành phần triển khai:
- **Frontend (React + Vite):** Được build thành mã HTML/JS tĩnh và phục vụ trực tiếp bởi Caddy từ đường dẫn `/var/www/frontend`.
- **Backend (Spring Boot):** Đóng gói dạng Docker Container, quản lý qua `docker-compose.prod.yml` và được reverse proxy qua cổng `8080` bởi Caddy.
- **SSL/HTTPS:** Caddy tự động cấu hình và gia hạn chứng chỉ Let's Encrypt miễn phí cho tên miền riêng.

Xem toàn bộ quy trình thiết lập VPS, cấu hình DNS, và quy trình cập nhật code mới (redeploy) chi tiết tại **[DEPLOYMENT.md](file:///d:/Project_ca_nhan/ticket-booking-soa/DEPLOYMENT.md)**.

---

## 🔮 6. Kế Hoạch Tiếp Theo (Backlog — Sprint 6+)

1. **Security:** Tích hợp xác thực JSON Web Token (JWT) tập trung thay thế cho việc cấu hình mở `permitAll()`, phân quyền truy cập chi tiết cho các đầu API đặt vé và API quản lý của Admin.
2. **Thanh toán thực tế:** Kết nối cổng thanh toán thật (như VNPay, MoMo, hoặc Stripe) thay vì quy trình giả lập thanh toán thành công hiện tại.
3. **Giám sát hệ thống (Observability):** Cấu hình Spring Boot Actuator, Micrometer và tích hợp Prometheus/Grafana để theo dõi hiệu năng hệ thống, cùng OpenTelemetry/Zipkin cho việc truy vết các request (tracing) liên dịch vụ.
4. **Dọn dẹp mã nguồn:** Loại bỏ tệp mẫu mặc định [App.tsx](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/App.tsx) và [App.css](file:///d:/Project_ca_nhan/ticket-booking-soa/frontend/src/App.css) không sử dụng trong dự án.
