# API Integration

## 1. Frontend là gì?

Frontend Next.js trong thư mục `fe/` là client sử dụng Backend API trong thư mục `be/`.

Luồng chính:

```text
User
   ↓
Next.js UI
   ↓
features/*/api.ts
   ↓
src/lib/api/client.ts
   ↓
HTTP request
   ↓
FastAPI backend
   ↓
HTTP response
   ↓
Next.js UI
   ↓
User
```

Frontend không tự tạo endpoint. Các type và API function hiện tại được map từ:

- `be/app/router/auth.py`
- `be/app/router/user.py`
- `be/app/router/project.py`
- `be/app/schemas/user.py`
- `be/app/schemas/project.py`
- `be/app/core/security.py`
- `be/app/core/response.py`
- `be/app/dependencies/dependencies.py`

## 2. Backend API là gì?

Backend FastAPI cung cấp các endpoint HTTP. Phần lớn response được bọc bằng `standard_response`:

```ts
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  error: unknown;
  timestamp: string;
  path: string;
}
```

Ví dụ response thành công:

```json
{
  "statusCode": 200,
  "message": "Thành công!",
  "data": {},
  "error": null,
  "timestamp": "2026-08-28T00:00:00+00:00",
  "path": "/api/v1/me"
}
```

Riêng `GET /api/v1/health` trả raw JSON:

```json
{
  "status": "success"
}
```

Error do `HTTPException` cũng được bọc:

```json
{
  "statusCode": 403,
  "message": "Không thành công!",
  "data": null,
  "error": "Không có quyền truy cập!",
  "timestamp": "...",
  "path": "..."
}
```

Validation error `422` có `error` là danh sách lỗi từ FastAPI/Pydantic.

## 3. Một request thực tế chạy như thế nào?

Ví dụ lấy danh sách project:

```text
Browser
   ↓
Next.js page /projects
   ↓
getProjects()
   ↓
src/lib/api/client.ts
   ↓
GET /api/v1/projects?page=1&limit=10
Authorization: Bearer <access_token>
   ↓
FastAPI router project.py
   ↓
project_service.get_all_project()
   ↓
Database
   ↓
standard_response(...)
   ↓
JSON response
   ↓
Next.js state
   ↓
Browser
```

## 4. Request và Response Mapping

### Authentication

| Frontend function | Method | Backend endpoint | Auth | Request | Response data |
| --- | --- | --- | --- | --- | --- |
| `login()` | `POST` | `/auth/login` | No | `{ email, password }` | `{ access_token, type }` |
| `registerUser()` | `POST` | `/auth/register` | No | `{ email, full_name, password }` | `{ id, email, full_name, role, is_active }` |

Login response dùng field `type`, không phải `token_type`.

### Users

| Frontend function | Method | Backend endpoint | Auth | Request | Response data |
| --- | --- | --- | --- | --- | --- |
| `healthCheck()` | `GET` | `/api/v1/health` | No | None | `{ status: "success" }` |
| `getMe()` | `GET` | `/api/v1/me` | `ADMIN` hoặc `USER` | Bearer token | `{ id, email, full_name, role, is_active }` |
| `getUsers()` | `GET` | `/api/v1/users` | `ADMIN` | Query: `page`, `limit`, `name`, `email` | `{ result, metadata }` |

`metadata` giữ đúng spelling từ backend:

```ts
interface PaginationMetadata {
  page: number;
  limit: number;
  total_page: number;
  total_recoder: number;
}
```

### Projects

| Frontend function | Method | Backend endpoint | Auth | Request | Response data |
| --- | --- | --- | --- | --- | --- |
| `getProjects()` | `GET` | `/api/v1/projects` | `ADMIN` hoặc `USER` | Query: `page`, `limit`, `name` | `{ result, metadata }` |
| `getProject()` | `GET` | `/api/v1/projects/{project_id}` | `ADMIN` hoặc `USER` | Path: `project_id` | `{ id, name, description, owner }` |
| `createProject()` | `POST` | `/api/v1/projects` | `ADMIN` hoặc `USER` | `{ name, description }` | `{ id, name, description }` |
| `updateProject()` | `PUT` | `/api/v1/projects/{project_id}` | `ADMIN` hoặc `USER`; owner only in service | `{ name, description, owner_id }` | `{ id, name, description }` |
| `deleteProject()` | `DELETE` | `/api/v1/projects/{project_id}` | `ADMIN` hoặc `USER`; owner only in service | Path: `project_id` | `204 No Content` |
| `addProjectMember()` | `POST` | `/api/v1/projects/{project_id}/members` | `ADMIN` hoặc `USER`; owner only in service | `{ user_id }` | `null` |
| `getProjectMembers()` | `GET` | `/api/v1/projects/projects/{project_id}/members` | `ADMIN` hoặc `USER`; owner/member in service | Path: `project_id` | `Array<{ email, full_name, role }>` |
| `deleteProjectMember()` | `DELETE` | `/api/v1/projects/{project_id}/members/{user_id}` | `ADMIN` hoặc `USER`; owner only in service | Path: `project_id`, `user_id` | `204 No Content` |

Endpoint lấy members là `/api/v1/projects/projects/{project_id}/members` vì router có prefix `/api/v1/projects` và route con là `/projects/{project_id}/members`.

## 5. TypeScript Types

Các type chính được tạo trong:

- `src/types/api.ts`
- `src/features/auth/types.ts`
- `src/features/users/types.ts`
- `src/features/projects/types.ts`

Tên field giữ đúng JSON backend trả về, ví dụ:

- `full_name`
- `is_active`
- `owner_id`
- `total_page`
- `total_recoder`

Không transform sang `camelCase` để sinh viên thấy request/response thực tế.

## 6. Authentication

Backend dùng `HTTPBearer` trong `be/app/core/security.py`.

Login flow:

```text
Login form
   ↓
POST /auth/login
   ↓
standard_response.data.access_token
   ↓
localStorage["access_token"]
   ↓
Authorization: Bearer <access_token>
   ↓
Protected API
```

Frontend lưu `access_token` trong `localStorage` vì backend hiện trả token qua JSON body và chưa có refresh token hoặc cookie session. API client đọc token từ UI layer rồi gửi header:

```http
Authorization: Bearer <access_token>
```

Token payload do backend tạo có:

- `sub`
- `user_id`
- `role`
- `iat`
- `exp`

Frontend không parse payload này để quyết định quyền. Quyền vẫn do backend kiểm tra bằng `RoleChecker`.

## 7. CORS

Backend đã được cấu hình CORS tối thiểu trong `be/app/main.py`:

```py
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

Không dùng `allow_origins=["*"]` vì các API protected gửi Bearer token.

## 8. Những API chưa có UI riêng

- `GET /api/v1/health` đã có API function `healthCheck()` nhưng chưa có màn hình riêng.
- Backend có `be/app/models/task.py` và `be/app/schemas/task.py`, nhưng chưa có task router được include trong `main.py`, nên frontend không tạo task API function.

## 9. Ghi chú backend hiện tại

- `GET /api/v1/users` yêu cầu role `ADMIN`; user role `USER` sẽ nhận `403`.
- `GET /api/v1/projects` khai báo query `page` và `limit`. Trong service hiện tại, dòng `projects.offset(...).limit(...).all()` chưa gán lại vào biến, nên cần kiểm thử thực tế nếu muốn xác nhận pagination đang hoạt động đúng.
- `GET /api/v1/projects` tính `total_record` bằng toàn bộ bảng projects, không chỉ projects của current user.
- `UpdateProject` yêu cầu `owner_id`, nhưng service hiện gán lại `owner_id = user_id` ở cuối hàm update.

## 10. Chạy project

Backend:

```bash
cd be
source .venv/bin/activate
uvicorn app.main:app --reload
```

Frontend:

```bash
cd fe
npm install
npm run dev
```

Frontend đọc base URL từ:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
