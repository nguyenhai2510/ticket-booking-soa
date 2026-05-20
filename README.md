[PROJECT ONBOARDING - TÀI LIỆU BÀN GIAO CONTEXT DỰ ÁN]

Xin chào Cursor Agent. Bạn đang tham gia vào dự án "Ticket Booking System" (Hệ thống bán vé sự kiện) với vai trò là Senior Fullstack Developer. Dưới đây là toàn cảnh dự án và vị trí chúng ta đang đứng. Hãy đọc thật kỹ trước khi nhận task mới.

# 1. KIẾN TRÚC & TECH STACK (OVERVIEW)

- Kiến trúc: Microservices áp dụng chuẩn Database-per-service.
- Nền tảng: Java Spring Boot, Spring Cloud (Eureka Server, API Gateway).
- Cơ sở dữ liệu: PostgreSQL (Chia thành nhiều DB độc lập: db_user, db_event, db_booking).
- Frontend: React, TypeScript, Vite, Tailwind CSS v4, Shadcn UI, React-hook-form, Zod, Axios.

# 2. TRẠNG THÁI HIỆN TẠI (MILESTONES COMPLETED)

## 🟢 Sprint 1: User & Authentication (ĐÃ HOÀN TẤT)

- `user-service` (Port 8081, DB: `db_user`): Đã hoàn thiện API Login và Register. Mật khẩu mã hóa BCrypt.
- `api-gateway` (Port 8080): Đã cấu hình CORS cho Frontend và định tuyến Route `/api/users/**` -> `lb://user-service` bằng Java DSL (`GatewayConfig.java`).
- `frontend` (Port 5173): Đã setup UI bằng Shadcn. Hoàn thiện Form Login/Register, đã tích hợp gọi API qua Gateway (Axios baseURL: 8080) và nhận status 200 OK.

## 🟡 Sprint 2: Event Management (ĐANG THỰC HIỆN - ĐÃ XONG TASK 2)

- `event-service` (Port 8082, DB: `db_event`): Đã khởi tạo và đăng ký Eureka thành công.
- Đã thiết kế 2 Entity: `Event` và `TicketCategory` với quan hệ 1-Nhiều (One-to-Many). Đã cấu hình `@JsonBackReference` và `@JsonManagedReference` để triệt tiêu lỗi Infinite Recursion. Đã xử lý logic `ticketCategory.setEvent(event)` để giữ vẹn toàn khóa ngoại.
- Đã hoàn thiện Controller, Service, Repository cho các API: `POST /api/events`, `GET /api/events`, `GET /api/events/{id}`.
- Đã test trực tiếp API `POST` bằng Postman tạo thành công sự kiện (ví dụ: Liveshow Làn Sóng Xanh ở Hà Nội) xuống CSDL. `ddl-auto` đang được cấu hình là `update`.

# 3. MỤC TIÊU TIẾP THEO CẦN THỰC HIỆN (NEXT TASKS)

Agent hãy chuẩn bị tinh thần xử lý 2 Task tiếp theo để đóng gói Sprint 2:

- **Task 3 (Backend):** Cập nhật `GatewayConfig.java` trong `api-gateway` để mở đường dẫn `/api/events/`** trỏ xuống `lb://event-service`. BẮT BUỘC giữ nguyên cấu trúc route của `user-service` hiện tại.
- **Task 4 (Frontend):** Xây dựng Trang chủ (Home Page). Gọi API `GET /api/events` qua cổng Gateway 8080. Render danh sách sự kiện nhận được ra giao diện bằng Card Component của Shadcn UI dưới dạng Grid.

# 4. RÀNG BUỘC CỐT LÕI (CORE RULES)

1. TUYỆT ĐỐI không thay đổi kiến trúc Database-per-service.
2. Frontend BẮT BUỘC chỉ được giao tiếp với hệ thống qua 1 cổng duy nhất là API Gateway (8080).
3. Khi sinh code, chỉ in ra những file bị thay đổi hoặc file tạo mới, không giải thích dông dài.
4. Bám sát các công nghệ UI đã chốt: Tailwind CSS và Shadcn.