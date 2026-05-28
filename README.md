[PROJECT ONBOARDING - TÀI LIỆU BÀN GIAO CONTEXT DỰ ÁN]

Xin chào Cursor Agent. Bạn đang tham gia vào dự án **Ticket Booking System** (Hệ thống bán vé sự kiện) với vai trò Senior Fullstack Developer. Đọc kỹ trước khi nhận task mới. Chi tiết build/run xem thêm `CLAUDE.md`.

# 1. KIẾN TRÚC & TECH STACK

- **Kiến trúc:** Microservices, Database-per-service.
- **Backend:** Java 17, Spring Boot 4.0.6, Spring Cloud 2025.1.1 (Eureka, API Gateway MVC).
- **Cơ sở dữ liệu:** PostgreSQL — `db_user`, `db_event`, `db_booking` (user `postgres`, cấu hình trong từng `application.yml`).
- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, Shadcn UI, react-hook-form, Zod, Axios, React Router.

| Thành phần        | Port | Eureka name      | Ghi chú                          |
|-------------------|------|------------------|----------------------------------|
| `eureka-server`   | 8761 | —                | Khởi động trước (~30s)           |
| `api-gateway`     | 8080 | —                | Cổng duy nhất cho frontend       |
| `user-service`    | 8081 | `user-service`   | DB `db_user`                     |
| `event-service`   | 8082 | `event-service`  | DB `db_event`                    |
| `booking-service` | 8083 | `booking-service`| DB `db_booking`                  |
| `frontend`        | 5173 | —                | `axios` baseURL → `http://localhost:8080` |

Gateway routing: `api-gateway/.../config/GatewayConfig.java` (Java DSL `RouterFunction`, `lb://<service-name>`).

# 2. TRẠNG THÁI HIỆN TẠI

## 🟢 Sprint 1: User & Authentication (HOÀN TẤT)

- **`user-service`:** `POST /api/users/register`, `POST /api/users/login`; BCrypt; Spring Security `permitAll` (chưa JWT).
- **`api-gateway`:** CORS (`CorsConfig.java`); route `/api/users/**` → `lb://user-service`.
- **`frontend`:** Trang `/login`, `/register` (Shadcn + Zod); gọi API qua Gateway 8080.

## 🟢 Sprint 2: Event Management (HOÀN TẤT)

- **`event-service`:** Entity `Event` + `TicketCategory` (1-N); API CRUD cơ bản; `ddl-auto: update`.
- **`api-gateway`:** Route `/api/events/**` → `lb://event-service`.
- **`frontend`:** Trang chủ `/` — `GET /api/events`, Card grid (title, eventDate, imageUrl, giá vé).

## 🟢 Schema DB (ĐÃ CHỐT — xem `docs/schema.dbml`)

| DB | Bảng | Ghi chú |
|----|------|---------|
| `db_user` | `users` | Khớp ERD |
| `db_event` | `events`, `ticket_categories` | `events`: +`image_url`, `version`, `created_at` |
| `db_booking` | `bookings`, `booking_items` | `user_id` UUID, `total_amount`, `booking_time`; items: `ticket_category_id`, `quantity`, `price` |

Sau khi đổi entity: migrate an toàn — `event-service/migrate-schema.sql`, `booking-service/migrate-schema.sql` (hoặc `./mvnw` + `SchemaMigrationRunner` trong từng service); hoặc reset dev DB: `*/reset-database.sql` rồi khởi động lại service.

## 🟢 Sprint 3: Booking — Backend SAGA (HOÀN TẤT Task 1–3)

- **Patterns:** SAGA Orchestration (`BookingSagaOrchestrator`), Optimistic lock (`TicketCategory.@Version`).
- **event-service:** `POST /api/inventory/reserve`, `POST /api/inventory/release`.
- **booking-service:** OpenFeign → `user-service`, `event-service`; luồng `PENDING` → `RESERVED` → `CONFIRMED` / `CANCELLED` / `FAILED`.
- **Tài liệu:** [`docs/sprint3-saga.md`](docs/sprint3-saga.md).

## 🟢 Sprint 3: Frontend (HOÀN TẤT)

- `/events/:id` — chi tiết sự kiện, chọn số lượng vé, `POST /api/bookings`.
- `/checkout/:bookingId` — mock thanh toán 2 bước (`confirm-payment`, `cancel`).
- `bookingService.ts`; guard đăng nhập (`userId` trong `localStorage`).

# 3. VIỆC CẦN LÀM TIẾP THEO (BACKLOG)

1. **Auth (tuỳ chọn):** JWT; route guard chặt hơn.
2. **Dọn frontend:** `App.tsx` template Vite không dùng.

# 4. API GATEWAY — ROUTES HIỆN CÓ

| Path prefix        | Target service    |
|--------------------|-------------------|
| `/api/users/**`    | `user-service`    |
| `/api/events/**`   | `event-service`   |
| `/api/bookings/**` | `booking-service` |

# 5. RÀNG BUỘC CỐT LÕI

1. **Không** gộp database — giữ Database-per-service.
2. Frontend **chỉ** gọi API Gateway (`8080`), không hardcode port microservice.
3. Inter-service HTTP: `@LoadBalanced RestTemplate` hoặc `WebClient`, target `http://SERVICE-NAME` / `lb://SERVICE-NAME` — **không** hardcode `localhost:808x` giữa các service.
4. Mọi microservice đăng ký Eureka (`eureka.client.service-url.defaultZone=http://localhost:8761/eureka/`).
5. Gateway routing bằng Java DSL trong `GatewayConfig.java` — **không** dùng `spring.cloud.gateway.routes` trong YAML.
6. UI: Tailwind + Shadcn; không đổi stack đã chốt trừ khi có yêu cầu rõ.

# 6. KHỞI ĐỘNG NHANH

1. PostgreSQL: tạo `db_user`, `db_event`, `db_booking` (hoặc `init-scripts/init.sh`).
2. `cd eureka-server && ./mvnw spring-boot:run` — đợi ~30s.
3. Chạy `api-gateway`, `user-service`, `event-service`, `booking-service` (thứ tự tùy ý).
4. `cd frontend && npm install && npm run dev` → http://localhost:5173

Tài liệu frontend chi tiết: `frontend/QUICK_START.md`, `frontend/SPRINT1_COMPLETED.md`.
