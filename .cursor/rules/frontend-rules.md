---
name: frontend-rules
description: Conventions for the React UI. Loaded ONLY when editing the frontend directory.
globs:
  - "frontend/**"
---
# Frontend React Rules

## API Communication
- The frontend MUST NEVER call backend microservices directly (e.g., never fetch from port 8082 or 8083).
- ALL API calls MUST go through the API Gateway at `http://localhost:8080/api/`.
- Maintain a central `axios` or `fetch` instance configured with the Gateway base URL.

## State & UI
- (Bạn có thể thêm luật về thư viện UI bạn thích ở đây, ví dụ: "Sử dụng TailwindCSS cho styling" hoặc "Quản lý state bằng Redux Toolkit").
- CSS & Styling: Tailwind CSS.
UI Components: Shadcn UI.