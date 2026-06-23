# 🚀 HƯỚNG DẪN DEPLOY DỰ ÁN EVENTPASS LÊN PRODUCTION

Tài liệu này hướng dẫn chi tiết từng bước để triển khai hệ thống **EventPass (Ticket Booking SOA)** từ môi trường Local lên môi trường thực tế (Production).

Do đặc thù của hệ thống kiến trúc Microservices gồm **5 dịch vụ Spring Boot** và **1 ứng dụng React Frontend**, mô hình triển khai tối ưu về mặt chi phí và hiệu năng cho dự án này là:
1. **Database:** Sử dụng Cloud Database (đã cấu hình **Neon PostgreSQL** rất tốt).
2. **Backend Microservices:** Đóng gói Docker và chạy bằng **Docker Compose** trên một máy chủ ảo **VPS (Virtual Private Server)** riêng.
3. **Frontend Client:** Triển khai static website lên các nền tảng tối ưu CDN miễn phí như **Vercel**, **Netlify** hoặc **Cloudflare Pages**.

---

## 🗺️ Sơ đồ Luồng Hoạt Động trên Production

```mermaid
flowchart TD
    Client[Browser / Frontend Client\nHost trên Vercel/Netlify] -- HTTPS request --> Nginx[Nginx / Caddy Reverse Proxy\nPort 80/443 trên VPS]
    Nginx -- Forward to 8080 --> Gateway[api-gateway\nPort 8080]
    Gateway -- Route using Eureka --> UserSvc[user-service\nPort 8081]
    Gateway -- Route using Eureka --> EventSvc[event-service\nPort 8082]
    Gateway -- Route using Eureka --> BookingSvc[booking-service\nPort 8083]
    
    UserSvc -- Read/Write --> NeonUser[(Neon DB: db_user)]
    EventSvc -- Read/Write --> NeonEvent[(Neon DB: db_event)]
    BookingSvc -- Read/Write --> NeonBooking[(Neon DB: db_booking)]
    
    UserSvc & EventSvc & BookingSvc & Gateway <--> Eureka[eureka-server\nPort 8761]
```

---

## 🛠️ CÁC BƯỚC TRIỂN KHAI CHI TIẾT

### Bước 1: Chuẩn bị Hạ tầng & Cài đặt trên VPS

1. **Thuê VPS:**
   - Bạn nên thuê VPS với tối thiểu **2GB RAM** (khuyên dùng **4GB RAM** để các service Spring Boot chạy mượt mà, do mỗi service cần khoảng 300MB-512MB RAM).
   - Hệ điều hành khuyên dùng: **Ubuntu 22.04 LTS**.
   - Các nhà cung cấp tốt: DigitalOcean, Vultr, Linode, AWS EC2, Hetzner.

2. **Cài đặt Docker & Docker Compose trên VPS:**
   Đăng nhập vào VPS qua SSH và chạy các lệnh sau:
   ```bash
   # Cập nhật hệ thống
   sudo apt update && sudo apt upgrade -y

   # Cài đặt Docker
   sudo apt install docker.io -y
   sudo systemctl enable --now docker

   # Cài đặt Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Cấu hình Firewall (Bảo mật cổng):**
   Chỉ cho phép truy cập public qua cổng SSH (22), HTTP (80) và HTTPS (443). **Chặn toàn bộ các cổng backend và database ra bên ngoài**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

---

### Bước 2: Triển khai Backend lên VPS

1. **Sao chép mã nguồn lên VPS:**
   Bạn có thể dùng Git để clone repository trực tiếp trên VPS:
   ```bash
   git clone <đường-dẫn-repo-của-bạn> /app/ticket-booking-soa
   cd /app/ticket-booking-soa
   ```

2. **Thiết lập biến môi trường (`.env`):**
   Tạo tệp `.env` tại thư mục gốc `/app/ticket-booking-soa` trên VPS (tương tự file local của bạn nhưng đổi CORS):
   ```ini
   # Tài khoản Neon Database
   DB_USERNAME=neondb_owner
   DB_PASSWORD=npg_tBRHkjXMg8L2

   # Chuỗi kết nối JDBC tới Neon DB
   USER_DB_URL=jdbc:postgresql://neondb_owner:npg_tBRHkjXMg8L2@ep-plain-feather-aonjkx1m-pooler.c-2.ap-southeast-1.aws.neon.tech/db_user?sslmode=require&channel_binding=require
   EVENT_DB_URL=jdbc:postgresql://neondb_owner:npg_tBRHkjXMg8L2@ep-plain-feather-aonjkx1m-pooler.c-2.ap-southeast-1.aws.neon.tech/db_event?sslmode=require&channel_binding=require
   BOOKING_DB_URL=jdbc:postgresql://neondb_owner:npg_tBRHkjXMg8L2@ep-plain-feather-aonjkx1m-pooler.c-2.ap-southeast-1.aws.neon.tech/db_booking?sslmode=require&channel_binding=require

   # Cấu hình Eureka Server URL trong mạng Docker
   EUREKA_SERVER_URL=http://eureka-server:8761/eureka/

   # [QUAN TRỌNG] Địa chỉ Frontend trên Production để vượt qua CORS
   # Sau khi deploy Frontend lên Vercel, hãy dán URL Vercel vào đây
   APP_CORS_ALLOWED_ORIGINS=https://eventpass-client.vercel.app
   ```

3. **Khởi chạy hệ thống Backend:**
   Thực thi lệnh Docker Compose để build các Dockerfile và chạy ngầm:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

4. **Kiểm tra trạng thái hoạt động:**
   - Xem danh sách container đang chạy:
     ```bash
     docker ps
     ```
   - Kiểm tra log của một service cụ thể nếu xảy ra lỗi (ví dụ API Gateway):
     ```bash
     docker logs -f api-gateway
     ```

---

### Bước 3: Cấu hình Reverse Proxy & SSL (HTTPS) cho API Gateway

Để Frontend trên Vercel (chạy HTTPS) có thể gọi được API Gateway (cổng `8080`), bạn cần cấu hình HTTPS cho API Gateway thông qua Nginx hoặc Caddy chạy trực tiếp trên VPS.

#### Cách 1: Sử dụng Caddy (Cực kỳ nhanh và tự động cấp SSL)
1. Cài đặt Caddy trên VPS:
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install caddy -y
   ```
2. Cấu hình `/etc/caddy/Caddyfile`:
   ```caddy
   api.yourdomain.com {
       reverse_proxy localhost:8080
   }
   ```
   *(Thay `api.yourdomain.com` bằng tên miền phụ trỏ về IP của VPS).*
3. Restart Caddy:
   ```bash
   sudo systemctl restart caddy
   ```
   *Caddy sẽ tự động đăng ký SSL miễn phí Let's Encrypt và tự động gia hạn.*

#### Cách 2: Sử dụng Nginx + Certbot (Truyền thống)
1. Cài đặt Nginx:
   ```bash
   sudo apt install nginx -y
   ```
2. Tạo file cấu hình `/etc/nginx/sites-available/api-gateway`:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Kích hoạt cấu hình và reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/api-gateway /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl restart nginx
   ```
4. Cài đặt SSL bằng Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

### Bước 4: Triển khai Frontend lên Vercel hoặc Netlify

Nên dùng **Vercel** vì nền tảng này hỗ trợ Vite React rất tốt, nhanh và miễn phí.

1. **Chuẩn bị repo Git:** Đẩy toàn bộ dự án lên GitHub cá nhân của bạn (ở trạng thái Private hoặc Public).
2. **Đăng nhập Vercel:** Truy cập [Vercel.com](https://vercel.com) và liên kết với tài khoản GitHub của bạn.
3. **Import dự án:**
   - Chọn dự án `ticket-booking-soa`.
   - Tại mục **Root Directory**, click *Edit* và chọn thư mục `frontend`.
4. **Cấu hình Build & Development Settings:**
   - Framework Preset: **Vite** (Vercel tự động nhận diện).
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Cấu hình Environment Variables (Biến môi trường):**
   Thêm biến sau trong giao diện Vercel:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://api.yourdomain.com` *(Địa chỉ tên miền phụ HTTPS bạn đã trỏ về API Gateway ở Bước 3)*.
6. **Deploy:** Click nút **Deploy**. Vercel sẽ tự động build ứng dụng và cấp cho bạn một URL dạng `https://xxx.vercel.app` (hoặc bạn có thể add custom domain của riêng mình).

> [!IMPORTANT]
> **Đồng bộ hóa CORS:** Sau khi có URL Frontend chính thức từ Vercel (ví dụ: `https://eventpass-client.vercel.app`), hãy quay lại tệp `.env` trên VPS để cập nhật biến `APP_CORS_ALLOWED_ORIGINS` bằng URL này. Sau đó khởi động lại backend: `docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d` để cấu hình CORS mới có hiệu lực.

---

## 🔒 CHECKLIST AN TOÀN & TỐI ƯU CHO PRODUCTION (CRITICAL)

Khi chạy sản phẩm thực tế, bạn cần lưu ý các vấn đề bảo mật và vận hành sau:

1. **Tắt cơ chế Hibernate Auto-Update Database:**
   Trong file `application.yml` của các service backend hoặc trong file `.env` trên VPS, hãy chuyển cấu hình DDL-auto từ `update` sang `validate` hoặc `none`:
   ```ini
   SPRING_JPA_HIBERNATE_DDL_AUTO=validate
   ```
   *Lý do: Tránh trường hợp ứng dụng tự ý chỉnh sửa/xóa cấu trúc bảng khi có cập nhật code backend, gây mất mát dữ liệu.*

2. **Thay đổi thông tin nhạy cảm:**
   - Đảm bảo mật khẩu cơ sở dữ liệu Neon (`DB_PASSWORD`) không bị lộ ra public GitHub.
   - Luôn sử dụng file `.env` nằm trong danh mục `.gitignore` để lưu trữ credential.

3. **Bảo mật Eureka Dashboard:**
   Mặc định cổng `8761` của Eureka Server cho phép mọi người xem danh sách các service. 
   - Đảm bảo tường lửa VPS (`ufw`) **đã chặn cổng 8761** khỏi truy cập từ internet.
   - Nếu bạn muốn vào xem Dashboard Eureka từ máy cá nhân, hãy dùng **SSH Tunneling**:
     ```bash
     ssh -L 8761:localhost:8761 user@vps_ip
     ```
     Sau đó truy cập `http://localhost:8761` trên trình duyệt máy bạn để xem giao diện quản trị an toàn.

4. **Quản lý Log và Giám sát:**
   - Để tránh log Docker ghi đầy ổ cứng VPS, bạn nên giới hạn kích thước log bằng cách thêm đoạn cấu hình này vào dưới mỗi service trong `docker-compose.prod.yml`:
     ```yaml
     logging:
       driver: "json-file"
       options:
         max-size: "10m"
         max-file: "3"
     ```
