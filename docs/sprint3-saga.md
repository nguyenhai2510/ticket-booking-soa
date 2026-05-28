# Sprint 3 — SAGA Orchestration & Optimistic Locking

## Patterns

| Pattern | Vai trò | Vị trí triển khai |
|---------|---------|-------------------|
| **SAGA (Orchestration)** | Điều phối đặt vé qua nhiều service, có bước bù (compensate) | `booking-service` → `BookingSagaOrchestrator` |
| **Optimistic locking** | Chống bán lố vé khi concurrent | `event-service` → `TicketCategory.version` (`@Version`) |

## Luồng SAGA (2 bước thanh toán mock)

### Phase 1 — `POST /api/bookings`

1. Validate user (`user-service`).
2. Load event + validate items (`event-service`).
3. Lưu `bookings` + `booking_items` — status `PENDING`, snapshot giá.
4. `POST event-service /api/inventory/reserve` — trừ `available_quantity`.
5. Thành công → `RESERVED`; lỗi → `FAILED` (transaction rollback reserve nếu lỗi giữa chừng trong 1 request reserve).

### Giữ vé có thời hạn (5 phút)

- Khi chuyển `RESERVED`, set `reserved_until = now + 5 phút` (`booking.reservation.timeout-minutes`).
- Scheduler mỗi 30s quét đơn hết hạn → `release` inventory → `CANCELLED`.
- `GET /api/bookings/{id}` và confirm/cancel đều kiểm tra hết hạn trước khi xử lý.
- Frontend hiển thị đồng hồ đếm ngược `M:SS` (bắt đầu `5:00`).

### Phase 2 — `POST /api/bookings/{id}/confirm-payment`

- Chỉ khi status = `RESERVED` và chưa quá `reserved_until`.
- Mock thành công → `CONFIRMED` (giữ tồn kho đã trừ).
- `simulateFailure: true` → `release` inventory → `CANCELLED`.

### Compensate — `POST /api/bookings/{id}/cancel`

- Chỉ khi `RESERVED` → `release` → `CANCELLED`.

## Trạng thái booking

```
PENDING → RESERVED → CONFIRMED
              ↓ confirm (mock fail) / cancel
         COMPENSATING → CANCELLED
PENDING → (reserve fail) → FAILED
```

## API nội bộ (không qua Gateway cho FE)

| Service | Endpoint |
|---------|----------|
| event-service | `POST /api/inventory/reserve` |
| event-service | `POST /api/inventory/release` |

Frontend chỉ gọi `POST /api/bookings`, `confirm-payment`, `cancel` qua Gateway `8080`.

## Optimistic lock

- Mỗi lần `reserve` / `release` đọc `TicketCategory`, cập nhật, `save` → Hibernate tăng `version`.
- Hai request đồng thời cùng hạng vé → một request nhận `409 Conflict`.

## Kiểm thử gợi ý

1. Đặt vé → `RESERVED`, tồn kho giảm.
2. Confirm payment → `CONFIRMED`.
3. Cancel khi `RESERVED` → tồn kho cộng lại.
4. Confirm với `"simulateFailure": true` → `CANCELLED` + tồn kho cộng lại.
5. Đặt vượt số vé → `400` hoặc booking `FAILED`.
