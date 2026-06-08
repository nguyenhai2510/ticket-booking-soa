# 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN DƯỚI LOCAL (LOCAL SETUP GUIDE)

Tài liệu này hướng dẫn chi tiết các bước từ khi clone dự án từ Git cho đến khi chạy thành công toàn bộ hệ thống bán vé sự kiện (**Ticket Booking System**) trên máy cá nhân của các thành viên trong nhóm.

---

## 📌 1. Kiến Trúc & Sơ Đồ Cổng Kết Nối (Ports)

Hệ thống được phát triển theo kiến trúc **Microservices (SOA)** với các thành phần sau:

| Thành phần | Cổng (Port) | Cơ sở dữ liệu | Mô tả |
| :--- | :---: | :--- | :--- |
| **`eureka-server`** | `8761` | Không có | Service Registry (Quản lý các dịch vụ) |
| **`api-gateway`** | `8080` | Không có | Cổng kết nối duy nhất (Routing & CORS) |
| **`user-service`** | `8081` | `db_user` | Quản lý người dùng và xác thực |
| **`event-service`** | `8082` | `db_event` | Quản lý sự kiện và danh mục vé |
| **`booking-service`**| `8083` | `db_booking` | Quản lý đặt vé (SAGA Orchestration) |
| **`frontend`** | `5173` | Không có | Giao diện React + Vite |

> [!IMPORTANT]
> **Quy tắc luồng đi**: Frontend **chỉ** gọi duy nhất qua API Gateway (`http://localhost:8080`). Không gọi trực tiếp đến các cổng `8081`, `8082`, `8083` của microservices.

---

## 🛠️ 2. Yêu Cầu Hệ Thống & Công Cụ Cần Cài Đặt (Prerequisites)

Trước khi bắt đầu, các thành viên cần cài đặt các công cụ sau trên máy cá nhân:

1. **Java Development Kit (JDK) 17**:
   * Kiểm tra phiên bản bằng lệnh: `java -version`.
   * Nên dùng OpenJDK 17 hoặc Oracle JDK 17.
2. **Node.js (Phiên bản v18 trở lên)** và **npm**:
   * Kiểm tra bằng lệnh: `node -v` và `npm -v`.
3. **Docker Desktop** (Khuyên dùng để cài đặt Database nhanh chóng).
4. **PostgreSQL Client** (Nếu không chạy bằng Docker thì phải cài đặt PostgreSQL cục bộ trên máy ở cổng `5432`).
5. **IDE**: 
   * **IntelliJ IDEA** (Khuyên dùng cho Backend Spring Boot).
   * **VS Code** (Cần cài thêm extension `Extension Pack for Java` và `Spring Boot Extension Pack`).

---

## 📦 3. Các Bước Thiết Lập Chi Tiết

### Bước 1: Clone dự án từ Git
Mở terminal (Git Bash, Command Prompt hoặc PowerShell) và chạy lệnh:
```bash
git clone <URL_KHO_MA_NGUON_GIT>
cd ticket-booking-soa
```

---

### Bước 2: Khởi tạo Cơ sở dữ liệu (PostgreSQL)

Hệ thống sử dụng cơ chế **Database-per-service** gồm 3 cơ sở dữ liệu riêng biệt: `db_user`, `db_event`, và `db_booking`. Có 2 cách để thiết lập:

#### 👉 Cách A: Sử dụng Docker (Khuyên dùng - Nhanh nhất)
Dự án đã cấu hình sẵn file [docker-compose.db.yml](file:///d:/Project_ca_nhan/ticket-booking-soa/docker-compose.db.yml) để tự động tạo cơ sở dữ liệu.

1. Đảm bảo Docker Desktop đang chạy.
2. Tại thư mục gốc của dự án, chạy lệnh:
   ```bash
   docker-compose -f docker-compose.db.yml up -d
   ```
3. Docker sẽ tự động tải image PostgreSQL, khởi chạy container ở cổng `5432` và kích hoạt script khởi tạo tại [init-scripts/init.sh](file:///d:/Project_ca_nhan/ticket-booking-soa/init-scripts/init.sh) để tự động tạo 3 database: `db_user`, `db_event`, `db_booking`.
4. Tài khoản mặc định:
   * **Username**: `postgres`
   * **Password**: `123456`

#### 👉 Cách B: Cài đặt PostgreSQL thủ công trên máy (Native)
Nếu bạn không muốn sử dụng Docker và đã cài đặt sẵn PostgreSQL cục bộ trên máy:
1. Đảm bảo dịch vụ PostgreSQL đang chạy ở cổng `5432`.
2. Đăng nhập vào PostgreSQL (qua pgAdmin, DBeaver hoặc SQL Shell).
3. Tạo 3 database trống bằng cách chạy các lệnh SQL sau:
   ```sql
   CREATE DATABASE db_user;
   CREATE DATABASE db_event;
   CREATE DATABASE db_booking;
   ```
4. Đảm bảo thông tin kết nối là tài khoản `postgres` và mật khẩu `123456`.
   *(Nếu mật khẩu PostgreSQL của bạn khác `123456`, bạn cần tạo một biến môi trường trên máy: `SPRING_DATASOURCE_PASSWORD=<mật_khẩu_của_bạn>` hoặc đổi trực tiếp trong file `application.yml` của từng service).*

---

### Bước 3: Khởi chạy Backend Services

Mỗi backend service là một dự án Maven độc lập. Bạn cần khởi chạy chúng theo **đúng thứ tự** dưới đây:

#### 🚨 Thứ tự khởi động:
1. **`eureka-server`** (Khởi động trước và **đợi khoảng 30 giây** để server hoạt động ổn định).
2. **`user-service`**, **`event-service`**, **`booking-service`** (Có thể khởi động song song hoặc thứ tự bất kỳ).
3. **`api-gateway`** (Khởi động sau cùng sau khi các service khác đã đăng ký thành công lên Eureka).

#### 👉 Cách chạy bằng dòng lệnh (Terminal):

* **Trên Windows (Sử dụng `mvnw.cmd`):**
  ```powershell
  # Chạy Eureka Server
  cd eureka-server
  .\mvnw.cmd spring-boot:run

  # Mở các tab terminal mới cho từng service khác:
  cd user-service
  .\mvnw.cmd spring-boot:run

  cd event-service
  .\mvnw.cmd spring-boot:run

  cd booking-service
  .\mvnw.cmd spring-boot:run

  cd api-gateway
  .\mvnw.cmd spring-boot:run
  ```

* **Trên macOS / Linux (Sử dụng `./mvnw`):**
  *(Lưu ý: Nếu gặp lỗi phân quyền, chạy lệnh `chmod +x mvnw` trong thư mục của từng service trước).*
  ```bash
  # Chạy Eureka Server
  cd eureka-server
  ./mvnw spring-boot:run

  # Chạy các service khác tương tự:
  ./mvnw spring-boot:run
  ```

#### 👉 Cách chạy bằng IntelliJ IDEA (Khuyên dùng khi Code/Debug):
1. Mở IntelliJ IDEA. Chọn **Open** và trỏ đến thư mục gốc `ticket-booking-soa`.
2. IntelliJ sẽ tự động nhận diện các module Maven. Đợi IDE tải các thư viện (dependencies) mất khoảng vài phút trong lần đầu tiên.
3. Để chạy các service thuận tiện, bạn mở công cụ **Services** trong IntelliJ (`View -> Tool Windows -> Services` hoặc phím tắt `Alt + 8` trên Windows).
4. Thêm các cấu hình chạy Spring Boot vào tab Services. Nhấn nút Run cho từng dịch vụ theo đúng thứ tự.

> [!TIP]
> **Kiểm tra trạng thái hệ thống**: Sau khi khởi chạy các backend services, bạn mở trình duyệt truy cập địa chỉ **[http://localhost:8761](http://localhost:8761)**. 
> Giao diện Eureka Dashboard hiển thị đầy đủ trạng thái `API-GATEWAY`, `USER-SERVICE`, `EVENT-SERVICE`, `BOOKING-SERVICE` ở mục **Instances currently registered with Eureka** là thành công!

---

### Bước 4: Khởi chạy Frontend (React client)

1. Mở một tab terminal mới và chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện phụ thuộc (lần đầu tiên hoặc khi có thư viện mới):
   ```bash
   npm install
   ```
3. Khởi chạy môi trường phát triển (development server):
   ```bash
   npm run dev
   ```
4. Sau khi khởi chạy thành công, terminal sẽ hiển thị địa chỉ truy cập (thường là **`http://localhost:5173`** hoặc **`http://localhost:5174`**). 
5. Mở trình duyệt và truy cập vào địa chỉ trên để sử dụng ứng dụng.

---

## ⚡ 4. Cách chạy nhanh qua Docker Compose (Production / Test Mode)

Nếu bạn chỉ muốn chạy thử nghiệm ứng dụng mà không cần mở code debug, dự án đã cung cấp sẵn file chạy Docker Compose toàn bộ dịch vụ.

1. Đảm bảo cấu hình file [.env](file:///d:/Project_ca_nhan/ticket-booking-soa/.env) đã khai báo đúng các đường dẫn database (nếu dùng database online Cloud Neon như mặc định).
2. Tại thư mục gốc, chạy lệnh:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```
3. Lệnh trên sẽ tự động build image cho toàn bộ các service và chạy chúng dưới nền container. 
4. Để dừng toàn bộ hệ thống:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

---

## ⚠️ 5. Các lỗi thường gặp và cách xử lý (Troubleshooting)

### 1. Lỗi cổng kết nối đã bị sử dụng (Port Address already in use)
* **Triệu chứng**: Khi khởi động Spring Boot, console báo lỗi `Port 8080 (hoặc 8081, 8761...) was already in use`.
* **Cách xử lý**:
  * Kiểm tra xem có tiến trình chạy ngầm nào của ứng dụng cũ chưa tắt.
  * Trên Windows, bạn có thể tắt tiến trình chiếm cổng bằng PowerShell:
    ```powershell
    # Tìm PID chiếm cổng (ví dụ cổng 8080)
    netstat -ano | findstr :8080
    # Tắt tiến trình bằng PID tìm được
    taskkill /PID <PID_CODE> /F
    ```

### 2. Lỗi kết nối Cơ sở dữ liệu (Database Connection Refused)
* **Triệu chứng**: Service backend (ví dụ `user-service`) khởi động thất bại và in ra lỗi `Connection to localhost:5432 refused`.
* **Cách xử lý**:
  * Kiểm tra xem Docker container chứa database đã chạy chưa bằng lệnh: `docker ps`.
  * Đảm bảo bạn đã tạo đủ 3 database `db_user`, `db_event`, `db_booking`.
  * Kiểm tra cấu hình mật khẩu PostgreSQL trong file `application.yml` hoặc các biến môi trường.

### 3. Lỗi không tìm thấy thư viện (Maven Dependency Resolution)
* **Triệu chứng**: Không thể build backend, báo lỗi thiếu thư viện hoặc class không tồn tại.
* **Cách xử lý**: Chạy lệnh clean install để Maven tải lại các dependency:
  ```bash
  ./mvnw clean install -DskipTests
  ```

### 4. Lỗi phân quyền thực thi script `mvnw` trên macOS/Linux
* **Triệu chứng**: Khi chạy `./mvnw`, terminal báo `Permission denied`.
* **Cách xử lý**: Cấp quyền thực thi bằng lệnh:
  ```bash
  chmod +x mvnw
  ```

---

## 🤝 6. Quy Định Phát Triển Nhóm (Team Conventions)

Để tránh xung đột code khi làm việc nhóm, mọi thành viên vui lòng tuân thủ các nguyên tắc sau:

1. **Format Code trước khi Commit**:
   Trước khi tạo commit, hãy chạy lệnh format Java của dự án để đảm bảo code sạch và đồng nhất:
   ```bash
   # Trong thư mục của service đang chỉnh sửa
   ./mvnw spring-javaformat:apply
   ```
2. **Quy tắc Microservice**:
   * Tuyệt đối không viết thêm các truy vấn liên kết database chéo (cross-database query).
   * Giao tiếp giữa các service phải đi qua `@LoadBalanced RestTemplate` hoặc `WebClient` với tên service đăng ký trên Eureka (ví dụ: `http://user-service/...`). Không hardcode IP hoặc localhost port trong mã nguồn.
   * Route mới phải được định nghĩa bằng Java DSL trong cấu hình `GatewayConfig.java` tại `api-gateway`. Không cấu hình routes trong file YAML.

---

Chúc cả nhóm phát triển dự án thành công! 🎉 Nếu gặp bất kỳ khó khăn nào trong quá trình cài đặt, hãy thảo luận trên kênh chat chung của nhóm.
