# ✅ Frontend Setup Hoàn Tất

## 📦 Đã Cài Đặt

### Core Dependencies
- ✅ TypeScript + @types/node
- ✅ Tailwind CSS + PostCSS + Autoprefixer
- ✅ Shadcn UI dependencies (clsx, tailwind-merge, lucide-react, @radix-ui/react-slot)
- ✅ Axios (API client)
- ✅ React Router DOM (routing)

### Files Created/Updated
- ✅ `tailwind.config.js` - Tailwind configuration
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `tsconfig.json` - TypeScript main config
- ✅ `tsconfig.node.json` - TypeScript node config
- ✅ `components.json` - Shadcn UI config
- ✅ `vite.config.ts` - Vite config with path alias (@/)
- ✅ `src/index.css` - Tailwind directives + CSS variables
- ✅ `src/api/axiosClient.ts` - Axios instance (baseURL: http://localhost:8080)
- ✅ `src/lib/utils.ts` - Utility function cho Shadcn UI (cn)
- ✅ `src/main.tsx` - Entry point (converted from JSX)
- ✅ `src/App.tsx` - Main component (converted from JSX)

## 🚀 Sử dụng

### Chạy Dev Server
```bash
npm run dev
```
Server sẽ chạy tại: http://localhost:5173

### Build Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

### Cài Component Shadcn UI
```bash
# Ví dụ: cài button component
npx shadcn@latest add button

# Cài nhiều components cùng lúc
npx shadcn@latest add button input card dialog
```

## 📝 Sử dụng Axios Client

```typescript
import axiosClient from '@/api/axiosClient';

// GET request
const response = await axiosClient.get('/api/users/1');

// POST request
const response = await axiosClient.post('/api/users/login', {
  username: 'user',
  password: 'pass'
});

// PUT request
const response = await axiosClient.put('/api/users/1', data);

// DELETE request
const response = await axiosClient.delete('/api/users/1');
```

## 🎨 Sử dụng Tailwind CSS

```tsx
// Sử dụng utility classes
<div className="flex items-center justify-center p-4 bg-blue-500 text-white">
  Hello World
</div>

// Sử dụng cn utility từ utils.ts
import { cn } from '@/lib/utils';

<div className={cn("base-class", condition && "conditional-class")}>
  Content
</div>
```

## 📁 Path Alias
Đã cấu hình `@/` trỏ đến `src/`:
```typescript
import axiosClient from '@/api/axiosClient';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/button';
```

## 🔗 API Gateway Connection
- Base URL: `http://localhost:8080`
- Tất cả requests tự động prefix với base URL
- Token authentication đã được setup trong interceptor
- Auto-redirect về /login khi gặp 401 Unauthorized
