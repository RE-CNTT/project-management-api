================================================================================
          HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY FRONTEND NEXT.JS (DÀNH CHO SINH VIÊN)
================================================================================

Tài liệu này hướng dẫn chi tiết từng bước từ cài đặt môi trường đến khởi chạy 
giao diện Frontend Next.js kết nối với Backend FastAPI.

--------------------------------------------------------------------------------
1. YÊU CẦU MÔI TRƯỜNG HỆ THỐNG
--------------------------------------------------------------------------------
- Hệ điều hành: Windows, macOS hoặc Linux (Ubuntu, Fedora, v.v.).
- Node.js: Phiên bản 18.x trở lên (Khuyến nghị dùng bản LTS mới nhất: Node.js 20.x hoặc 22.x).
- Trình quản lý gói: npm (được cài đặt sẵn kèm theo Node.js).
- Trình duyệt web: Google Chrome, Microsoft Edge, Firefox, Brave, v.v.

* Lưu ý: Nếu máy tính của bạn chưa có Node.js:
  + Truy cập trang chủ: https://nodejs.org/
  + Tải về bản "LTS" (Recommended for Most Users) và tiến hành cài đặt theo hướng dẫn.

--------------------------------------------------------------------------------
2. KIỂM TRA MÔI TRƯỜNG ĐÃ CÀI ĐẶT
--------------------------------------------------------------------------------
Mở Terminal / Command Prompt / PowerShell trên máy và chạy các lệnh sau để kiểm tra:

  node -v
  # Kết quả hiển thị dạng: v18.x.x, v20.x.x hoặc v22.x.x

  npm -v
  # Kết quả hiển thị dạng: 9.x.x hoặc 10.x.x

Nếu cả hai lệnh đều hiển thị phiên bản thì môi trường đã sẵn sàng!

--------------------------------------------------------------------------------
3. CÁC BƯỚC CÀI ĐẶT VÀ CHẠY DỰ ÁN FRONTEND
--------------------------------------------------------------------------------

BƯỚC 1: Mở Terminal và di chuyển vào thư mục Frontend (fe)
-------------------------------------------------------
Từ thư mục gốc của project (PROJECT_CUOIMON), gõ lệnh:

  cd fe

BƯỚC 2: Cài đặt các gói thư viện (Dependencies)
-----------------------------------------------
Chạy lệnh sau để tải và cài đặt toàn bộ thư viện cần thiết:

  npm install

* Mẹo: Bạn cũng có thể gõ ngắn gọn là:
  npm i

Quá trình này sẽ tạo thư mục `node_modules` chứa tất cả các thư viện của dự án.

BƯỚC 3: Cấu hình biến môi trường kết nối Backend (.env.local)
------------------------------------------------------------
Kiểm tra xem trong thư mục `fe` đã có file `.env.local` chưa.
Nếu chưa có, hãy tạo file có tên `.env.local` bên trong thư mục `fe` với nội dung sau:

  NEXT_PUBLIC_API_URL=http://localhost:8000

(Biến này dùng để trỏ các yêu cầu API từ Frontend sang Backend FastAPI đang chạy ở cổng 8000).

BƯỚC 4: Khởi chạy máy chủ phát triển (Development Server)
---------------------------------------------------------
Đảm bảo Backend FastAPI đã được bật trước đó ở cổng 8000.
Tại thư mục `fe`, chạy lệnh:

  npm run dev

Khi màn hình Terminal hiển thị:
  ▲ Next.js 16.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

BƯỚC 5: Truy cập ứng dụng trên trình duyệt
-----------------------------------------
Mở trình duyệt web và truy cập địa chỉ:

  http://localhost:3000

Hệ thống sẽ tự động chuyển hướng bạn đến trang Đăng nhập / Đăng ký (`http://localhost:3000/login`).

--------------------------------------------------------------------------------
4. HƯỚNG DẪN TRẢI NGHIỆM VÀ SỬ DỤNG CHỨC NĂNG
--------------------------------------------------------------------------------
1. Đăng ký / Đăng nhập:
   - Nếu chưa có tài khoản: Nhấp chọn "Đăng ký tài khoản mới", điền Họ tên, Email, Mật khẩu để tạo tài khoản.
   - Nhập Email và Mật khẩu để đăng nhập.
   - Khi đăng nhập thành công, hệ thống sẽ lưu Bearer Token và tự động chuyển sang trang Quản trị Dự án.

2. Quản lý Dự án (Projects):
   - Xem danh sách dự án dưới dạng Lưới (Grid) hoặc Bảng (Table).
   - Tìm kiếm dự án theo tên với bộ lọc và phân trang tự động.
   - Nhấn "Tạo dự án mới" để thêm dự án vào hệ thống.
   - Nhấn nút "Chi tiết & Thành viên" để vào xem thông tin dự án, chỉnh sửa thông tin dự án hoặc thêm/gỡ thành viên tham gia.

3. Quản lý Người dùng (Users):
   - Nhấp vào mục "Người dùng (Users)" trên thanh menu Sidebar bên trái.
   - Xem danh sách người dùng, trạng thái kích hoạt và phân quyền tài khoản (ADMIN / USER).

4. Đăng xuất:
   - Nhấn nút "Đăng xuất" ở góc dưới Sidebar bên trái khi muốn kết thúc phiên làm việc.

--------------------------------------------------------------------------------
5. CÁC LỆNH KHÁC HỮU ÍCH
--------------------------------------------------------------------------------
- Kiểm tra lỗi cú pháp và định dạng mã nguồn:
  npm run lint

- Đóng gói dự án cho môi trường Production (Kiểm tra build):
  npm run build

- Khởi chạy bản build Production:
  npm run start

--------------------------------------------------------------------------------
6. MỘT SỐ LỖI THƯỜNG GẶP VÀ CÁCH KHẮC PHỤC
--------------------------------------------------------------------------------
1. Lỗi "Cổng 3000 đã bị chiếm dụng (Port 3000 is in use)":
   - Next.js sẽ tự động hỏi chuyển sang cổng 3001, bạn chỉ cần gõ `y` hoặc tắt ứng dụng đang chiếm cổng 3000 rồi chạy lại `npm run dev`.

2. Lỗi "Không kết nối được Backend / Backend Offline":
   - Đảm bảo Backend FastAPI đã được bật và đang chạy tại `http://localhost:8000`.
   - Kiểm tra file `fe/.env.local` đã có dòng `NEXT_PUBLIC_API_URL=http://localhost:8000` chưa.

3. Lỗi thiếu gói thư viện hoặc lỗi cache:
   - Xóa thư mục `node_modules` và file `package-lock.json`, sau đó chạy lại lệnh:
     npm install
   - Xóa cache `.next` nếu cần:
     rm -rf .next (trên Linux/macOS) hoặc rmdir /s /q .next (trên Windows CMD)
================================================================================