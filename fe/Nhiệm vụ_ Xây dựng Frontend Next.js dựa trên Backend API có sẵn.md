# Nhiệm vụ: Xây dựng Frontend Next.js dựa trên Backend API có sẵn

## Bối cảnh

Project hiện tại có 2 thư mục:

```text
project/
├── be/
└── fe/
```

Trong đó:

- `be/` là Backend được xây dựng bằng FastAPI.
- `fe/` là Frontend được xây dựng bằng Next.js.
- Backend trong `be/` là nguồn API thực tế.
- Frontend trong `fe/` sẽ đóng vai trò là client sử dụng các API đó.

Mục tiêu của nhiệm vụ này là giúp sinh viên hiểu rõ:

```text
User
  ↓
Frontend Next.js
  ↓
HTTP Request
  ↓
Backend API
  ↓
Business Logic
  ↓
Database
  ↓
HTTP Response
  ↓
Frontend
  ↓
User
```

Frontend không được tự suy đoán API. **Hãy đọc source code trong `be/` để xác định chính xác API contract rồi mới xây dựng `fe/`.**

---

# 1. Phân tích Backend trước

Trước khi sửa hoặc tạo bất kỳ code nào trong `fe/`, hãy đọc và phân tích toàn bộ cấu trúc quan trọng trong:

```text
be/
```

Đặc biệt tìm và phân tích:

```text
routers/
routes/
api/
schemas/
models/
services/
dependencies/
auth/
main.py
```

Tên thư mục thực tế có thể khác, hãy tự tìm theo cấu trúc project hiện tại.

Hãy xác định:

- Các API endpoint.
- HTTP method.
- Path.
- Path parameter.
- Query parameter.
- Request body.
- Request schema.
- Response schema.
- HTTP status code.
- Authentication requirement.
- Authorization/role requirement.
- Header cần gửi.
- JWT Bearer token nếu có.
- Error response.
- Pagination nếu có.
- Các quan hệ giữa các resource.

Không được tự tạo API giả nếu API đó không tồn tại trong `be/`.

---

# 2. Backend là Source of Truth

Quy tắc quan trọng:

```text
be/
 ↓
Phân tích API contract
 ↓
Sinh API client
 ↓
Sinh TypeScript types
 ↓
Xây dựng frontend
```

Không làm ngược lại.

Nếu frontend đang có type hoặc API function không khớp với backend thì phải ưu tiên backend.

Ví dụ Backend có:

```python
@router.get("/projects/{project_id}", response_model=ResponseProject)
def get_project(project_id: int):
    ...
```

và:

```python
class ResponseProject(BaseModel):
    name: str
    description: str
    owner: User
```

thì frontend phải tạo type tương ứng:

```ts
interface Project {
  name: string;
  description: string;
  owner: User;
}
```

Không được tự thêm các field như:

```text
createdAt
updatedAt
status
```

nếu backend không trả về.

---

# 3. Phân tích Authentication

Nếu backend sử dụng JWT thì phải tìm chính xác flow authentication trong `be/`.

Ví dụ:

```text
POST /auth/login
```

phải kiểm tra:

- Request body là gì?
- Response trả về gì?
- Token field tên gì?
- Có `access_token` không?
- `token_type` là gì?
- Các API protected yêu cầu header nào?

Ví dụ nếu backend yêu cầu:

```http
Authorization: Bearer <access_token>
```

thì frontend phải xây dựng API client có khả năng gửi header này.

Không được tự giả định token structure nếu source backend đã có định nghĩa.

---

# 4. Phân tích Request và Response

Với mỗi endpoint, hãy lập mapping:

```text
Endpoint
HTTP Method
Request
Response
Authentication
Error
```

Ví dụ:

```text
GET /projects

Request:
GET /projects
Authorization: Bearer <token>

Response:
[
  {
    "name": "...",
    "description": "...",
    "owner": {
      "email": "...",
      "full_name": "..."
    }
  }
]
```

Frontend phải map chính xác cấu trúc này.

Đặc biệt chú ý:

- snake_case từ Python → có giữ nguyên hay transform?
- field optional.
- nullable.
- list.
- nested object.
- enum.
- pagination.
- response wrapper.

Không được tự ý đổi tên field nếu chưa có lý do rõ ràng.

---

# 5. Xây dựng cấu trúc Next.js

Sau khi phân tích `be/`, hãy xây dựng frontend trong:

```text
fe/
```

Sử dụng Next.js App Router + TypeScript.

Nếu `fe/` đã là Next.js project:

- Không tạo lại project.
- Giữ lại cấu hình đang có nếu hợp lý.
- Chỉ bổ sung/cải thiện cấu trúc.

Nếu `fe/` chưa được khởi tạo thì tạo Next.js project phù hợp.

---

# 6. Kiến trúc Frontend

Ưu tiên cấu trúc dễ hiểu cho sinh viên:

```text
fe/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── projects/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │
│   │   └── projects/
│   │       ├── api.ts
│   │       ├── types.ts
│   │       └── components/
│   │
│   ├── lib/
│   │   └── api/
│   │       ├── client.ts
│   │       └── config.ts
│   │
│   └── types/
│       └── api.ts
│
├── .env.local
├── package.json
└── ...
```

Có thể điều chỉnh cấu trúc nếu source backend cho thấy project có nhiều module khác.

Không tạo folder chỉ để làm cho cấu trúc phức tạp.

---

# 7. API Client dùng chung

Tạo:

```text
src/lib/api/client.ts
```

API client chịu trách nhiệm xử lý các vấn đề dùng chung:

- Base URL.
- HTTP method.
- Headers.
- JSON.
- Authorization.
- Error handling.
- Response parsing.

Base URL phải lấy từ environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Không hard-code:

```ts
fetch("http://localhost:8000/projects")
```

thành nhiều nơi.

Thay vào đó:

```text
Component
    ↓
features/projects/api.ts
    ↓
lib/api/client.ts
    ↓
Backend
```

---

# 8. Sinh TypeScript Types từ Backend

Dựa trên Pydantic schemas trong `be/`, tạo TypeScript types tương ứng.

Ví dụ Backend:

```python
class User(BaseModel):
    id: int
    email: EmailStr
    full_name: str
```

Frontend:

```ts
export interface User {
  id: number;
  email: string;
  full_name: string;
}
```

Nếu backend có:

```python
Optional[str]
```

thì frontend phải thể hiện nullable/optional tương ứng.

Nếu backend có:

```python
list[Project]
```

thì frontend phải map thành:

```ts
Project[]
```

Nếu backend có nested schema thì tạo nested type tương ứng.

---

# 9. Sinh API functions

Với mỗi resource/module trong Backend, tạo file API tương ứng.

Ví dụ:

```text
features/projects/api.ts
```

có thể chứa:

```ts
getProjects()
getProject(id)
createProject(data)
updateProject(id, data)
deleteProject(id)
```

Nhưng CHỈ tạo function nếu endpoint tương ứng thực sự tồn tại trong Backend.

Ví dụ Backend chỉ có:

```text
GET /projects
GET /projects/{id}
POST /projects
```

thì không được tự tạo:

```text
updateProject()
deleteProject()
```

---

# 10. Xây dựng UI để chứng minh API đang hoạt động

Không cần thiết kế UI đẹp.

Mục tiêu là chứng minh frontend có thể sử dụng backend.

Ví dụ `/projects`:

```text
Projects

[Load Projects]

Project 1
Description
Owner

Project 2
Description
Owner
```

Phải có:

- Loading state.
- Error state.
- Empty state.
- Success state.

Nếu API yêu cầu authentication thì xử lý authentication theo backend thực tế.

---

# 11. Login nếu Backend có Authentication

Nếu `be/` có login API thì xây dựng:

```text
/login
```

Flow:

```text
Login Form
    ↓
auth/api.ts
    ↓
POST /auth/login
    ↓
Backend
    ↓
JWT
    ↓
Frontend
    ↓
Gọi protected API
```

Không tự quyết định cách lưu token một cách tùy tiện.

Hãy xem authentication architecture hiện tại của backend và chọn cách triển khai frontend đơn giản, an toàn và phù hợp với project sinh viên.

---

# 12. Environment

Tạo:

```text
.env.local
```

Ví dụ:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Không commit secret hoặc credential.

Nếu backend chạy port khác thì sử dụng đúng port đang được cấu hình trong project.

---

# 13. CORS

Kiểm tra Backend có cấu hình CORS hay chưa.

Nếu frontend chạy:

```text
http://localhost:3000
```

và backend:

```text
http://localhost:8000
```

thì cần đảm bảo Backend cho phép origin của frontend.

Nếu CORS chưa được cấu hình hoặc cấu hình không phù hợp, hãy:

1. Báo rõ vấn đề.
2. Nếu có thể sửa backend một cách an toàn thì đề xuất/sửa tối thiểu.
3. Không sử dụng `allow_origins=["*"]` một cách tùy tiện nếu API có authentication.

---

# 14. Không over-engineering

Đây là project phục vụ việc giảng dạy.

Không tự ý thêm:

- Redux.
- Zustand.
- React Query.
- Axios.
- GraphQL.
- quá nhiều abstraction.
- architecture phức tạp.

Nếu native `fetch` đủ dùng thì sử dụng `fetch`.

Code phải giúp sinh viên hiểu:

```text
Frontend
   ↓
API Client
   ↓
HTTP
   ↓
FastAPI
   ↓
Database
```

thay vì tạo quá nhiều lớp khiến sinh viên không biết request thực sự đi đâu.

---

# 15. Documentation cho sinh viên

Tạo:

```text
fe/docs/api-integration.md
```

Giải thích dựa trên Backend thực tế:

## 1. Frontend là gì?

Frontend là client sử dụng Backend API.

## 2. Backend API là gì?

Backend cung cấp các endpoint để client gửi request và nhận response.

## 3. Một request thực tế chạy như thế nào?

Ví dụ lấy project:

```text
Browser
   ↓
Next.js
   ↓
getProjects()
   ↓
API Client
   ↓
GET /projects
   ↓
FastAPI
   ↓
Database
   ↓
FastAPI
   ↓
JSON Response
   ↓
Next.js
   ↓
Browser
```

## 4. Request và Response mapping

Tạo bảng dựa trên API thật:

```text
Frontend Function → HTTP Method → Backend Endpoint → Request → Response
```

## 5. Authentication

Giải thích JWT flow nếu backend sử dụng JWT.

---

# 16. Quy tắc quan trọng

Trong toàn bộ quá trình:

### Không được:

- Tự đoán endpoint.
- Tự đoán request body.
- Tự đoán response.
- Tự tạo field không tồn tại.
- Tự tạo API không tồn tại.
- Thay đổi Backend chỉ để frontend dễ code hơn.

### Phải:

- Đọc Backend trước.
- Mapping API chính xác.
- Sử dụng Pydantic schema làm nguồn tham khảo.
- Sử dụng router để xác định endpoint.
- Sử dụng authentication/dependencies để xác định API protected.
- Sinh TypeScript types tương ứng.
- Sinh API functions tương ứng.
- Xây UI demo dựa trên API thật.

---

# 17. Kiểm tra cuối cùng

Sau khi hoàn thành:

```bash
cd fe
npm install
npm run lint
npm run build
```

Nếu có lỗi TypeScript hoặc build thì tự sửa.

Nếu không thể gọi Backend vì Backend chưa chạy, không được giả lập response để che lỗi.

Hãy ghi rõ:

```text
Frontend đã được build thành công.

Để test API cần chạy Backend:
<command phù hợp với project>
```

---

# 18. Báo cáo cuối cùng

Sau khi hoàn thành, hãy báo cáo ngắn gọn:

## Backend đã phân tích

Liệt kê các module/API đã tìm thấy.

## Frontend đã tạo

Liệt kê các file/folder quan trọng.

## API Mapping

Ví dụ:

```text
GET /projects
    ↓
features/projects/api.ts
    ↓
getProjects()
    ↓
Project[]
```

## Authentication

Mô tả frontend đang xử lý authentication như thế nào.

## Những API chưa được tích hợp

Liệt kê những API có trong Backend nhưng chưa có UI tương ứng.

## Những vấn đề cần sinh viên xử lý

Ví dụ:

- CORS.
- Backend chưa chạy.
- Environment variable.
- Authentication.
- API chưa hoàn thiện.

Mục tiêu cuối cùng không phải chỉ là "tạo được frontend", mà là tạo một frontend **thực sự đóng vai trò API consumer của Backend hiện tại**, giúp sinh viên nhìn thấy rõ mối quan hệ:

```text
                HTTP
Frontend  ─────────────────→  Backend
          Request

Frontend  ←─────────────────  Backend
          Response
```

và hiểu rằng API mà các bạn xây dựng trong project cuối môn chính là **một service được client khác sử dụng**, chứ không phải một tập endpoint tồn tại độc lập.