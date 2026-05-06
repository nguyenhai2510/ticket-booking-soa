# 🎉 SPRINT 1 - LOGIN & REGISTER HOÀN TẤT

## ✅ Đã Hoàn Thành

### 1. Cài Đặt Dependencies
```bash
✅ react-hook-form (form state management)
✅ zod (schema validation)
✅ @hookform/resolvers (react-hook-form + zod integration)
✅ sonner (toast notifications)
✅ @tailwindcss/postcss (Tailwind v4 PostCSS plugin)
```

### 2. Shadcn UI Components
```bash
✅ button
✅ input
✅ card
✅ label
✅ form
```

### 3. Pages Created
- ✅ `src/pages/Login.tsx` - Trang đăng nhập
- ✅ `src/pages/Register.tsx` - Trang đăng ký
- ✅ `src/pages/Home.tsx` - Trang chủ (welcome page)

### 4. API Service
- ✅ `src/api/authService.ts` - Service quản lý authentication

### 5. Router Configuration
- ✅ `src/main.tsx` - Setup React Router với 3 routes:
  - `/` → Home
  - `/login` → Login
  - `/register` → Register

## 📋 Chi Tiết Kỹ Thuật

### Login Page (`/login`)
**Features:**
- Form validation với Zod schema:
  - Username: min 3 ký tự
  - Password: min 6 ký tự
- Loading state khi submit
- Toast notification (success/error)
- Lưu token vào localStorage
- Auto-redirect về home sau login thành công
- Link chuyển sang Register

**API Endpoint:**
```
POST /api/users/login
Body: { username, password }
```

### Register Page (`/register`)
**Features:**
- Form validation với Zod schema:
  - Username: min 3 ký tự
  - Email: valid email format
  - Password: min 6 ký tự
  - Confirm Password: phải khớp với password
- Loading state khi submit
- Toast notification (success/error)
- Auto-redirect về login sau register thành công
- Link chuyển sang Login

**API Endpoint:**
```
POST /api/users/register
Body: { username, email, password, role: "CUSTOMER" }
```

### Home Page (`/`)
- Welcome screen với tổng kết Sprint 1
- Button logout (clear token + redirect login)

## 🎨 UI/UX Features

### Design
- ✅ Gradient backgrounds (mỗi page màu khác nhau)
- ✅ Card-based layout với shadow
- ✅ Responsive design (mobile-friendly)
- ✅ Form validation errors inline
- ✅ Loading states với disabled buttons
- ✅ Toast notifications (top-right, colorful)

### Color Scheme
- Login: Blue → Indigo gradient
- Register: Purple → Pink gradient
- Home: Green → Blue gradient

## 🔧 Configuration Files

### Updated Files
1. **postcss.config.js**
   ```js
   plugins: {
     '@tailwindcss/postcss': {},
     autoprefixer: {},
   }
   ```

2. **src/index.css**
   - Tailwind v4 syntax: `@import "tailwindcss"`
   - CSS variables cho theme (light/dark mode ready)

3. **src/main.tsx**
   - Router setup với `createBrowserRouter`
   - Toaster component integrated

## 🚀 Cách Sử Dụng

### Chạy Dev Server
```bash
npm run dev
# Mở: http://localhost:5174
```

### Test Flow
1. Truy cập `/register` → Đăng ký tài khoản mới
2. Auto-redirect về `/login` → Đăng nhập
3. Auto-redirect về `/` → Trang chủ
4. Click "Đăng xuất" → Về lại `/login`

### Build Production
```bash
npm run build
# Output: dist/ folder
```

## 📊 Project Structure
```
frontend/src/
├── api/
│   ├── axiosClient.ts       # Axios instance (baseURL: localhost:8080)
│   └── authService.ts       # Authentication API calls
├── components/ui/           # Shadcn UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   ├── input.tsx
│   └── label.tsx
├── lib/
│   └── utils.ts             # cn() utility function
├── pages/
│   ├── Home.tsx             # Route: /
│   ├── Login.tsx            # Route: /login
│   └── Register.tsx         # Route: /register
├── index.css                # Tailwind + CSS variables
└── main.tsx                 # Router + Toaster setup
```

## 🔗 API Integration

### Base URL
```typescript
baseURL: 'http://localhost:8080'
```

### Axios Interceptors
- **Request**: Auto-attach Bearer token từ localStorage
- **Response**: Auto-redirect `/login` khi gặp 401 Unauthorized

### Example Usage
```typescript
import { authService } from '@/api/authService';

// Login
const result = await authService.login({
  username: 'user',
  password: 'pass123'
});

// Register
await authService.register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'pass123',
  role: 'CUSTOMER'
});

// Check authentication
if (authService.isAuthenticated()) {
  // User logged in
}

// Logout
authService.logout();
```

## ✨ Next Steps (Sprint 2)

Suggestions cho Sprint 2:
- [ ] Protected Routes (require authentication)
- [ ] User Profile page
- [ ] Event listing page
- [ ] Event detail & booking page
- [ ] Booking history page
- [ ] Admin dashboard (nếu role ADMIN)

## 🐛 Troubleshooting

### Lỗi CORS
- Đảm bảo API Gateway có config CORS cho `http://localhost:5174`

### Lỗi 404 Not Found
- Kiểm tra backend services đang chạy (Eureka, Gateway, User Service)

### Lỗi build
- Nếu gặp lỗi Tailwind: đã fix bằng `@tailwindcss/postcss`
- Nếu gặp lỗi TypeScript: kiểm tra `tsconfig.json`

---

**Build Status:** ✅ Successful  
**Dev Server:** ✅ Running  
**API Integration:** ✅ Ready  
**Sprint 1:** 🎉 COMPLETED
