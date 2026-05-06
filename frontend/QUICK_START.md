# 🚀 QUICK START - Frontend

## ⚡ Chạy Nhanh

```bash
# 1. Cài dependencies (nếu chưa)
npm install

# 2. Chạy dev server
npm run dev

# 3. Mở browser
# → http://localhost:5174
```

## 🎯 Routes

| URL | Page | Mô tả |
|-----|------|-------|
| `/` | Home | Trang chủ (welcome) |
| `/login` | Login | Đăng nhập |
| `/register` | Register | Đăng ký tài khoản |

## 🔌 API Endpoints (qua Gateway :8080)

### Login
```bash
POST http://localhost:8080/api/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

### Register
```bash
POST http://localhost:8080/api/users/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "123456",
  "role": "CUSTOMER"
}
```

## 📦 Installed Packages

### Core
- React 19.2.5
- TypeScript 6.0.3
- Vite 8.0.10

### UI & Styling
- Tailwind CSS 4.2.4
- Shadcn UI components
- Lucide React (icons)

### Forms & Validation
- react-hook-form
- zod
- @hookform/resolvers

### Routing & Notifications
- react-router-dom 7.15.0
- sonner (toast)

### HTTP Client
- axios 1.16.0

## 🎨 Shadcn Components Available

```bash
# Cài thêm components
npx shadcn@latest add [component-name]

# Examples:
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add avatar
```

## 🛠️ Commands

```bash
npm run dev      # Dev server với hot reload
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📁 Folder Structure

```
src/
├── api/              # API clients & services
├── components/ui/    # Shadcn UI components
├── lib/             # Utilities
├── pages/           # Page components
├── index.css        # Global styles
└── main.tsx         # Entry point + Router
```

## 💡 Tips

1. **Path Alias**: Sử dụng `@/` thay vì `../../`
   ```typescript
   import { Button } from '@/components/ui/button'
   import axiosClient from '@/api/axiosClient'
   ```

2. **Toast Notifications**: Đã setup sẵn
   ```typescript
   import { toast } from 'sonner'
   toast.success('Success!')
   toast.error('Error!')
   ```

3. **Form Validation**: Dùng Zod schema
   ```typescript
   const schema = z.object({
     email: z.string().email(),
     password: z.string().min(6),
   })
   ```

## 🔧 Troubleshooting

**Port already in use?**
- Vite sẽ tự chọn port khác (5175, 5176...)

**Backend not responding?**
- Kiểm tra API Gateway chạy ở port 8080
- Kiểm tra Eureka Server (8761)
- Kiểm tra User Service (8081)

**CORS errors?**
- Cấu hình CORS trong API Gateway

---

**Ready to code!** 🎉
