# Phân tích Chuyên sâu: Hệ thống Admin (Sentinel SOC)

Tài liệu này đi sâu vào cấu trúc mã nguồn, công nghệ và cách thức hoạt động của các trang Quản trị (Admin) trong hệ thống CyberSecure.

---

## 1. Trang Chủ Dashboard (AdminHomePage.js)
Đây là "Trung tâm Điều hành An ninh" (SOC), nơi hiển thị toàn bộ bức tranh về sức khỏe và an ninh của hệ thống.

### 🖼️ Hiển thị & Giao diện (UI/UX)
*   **Aesthetic**: Sử dụng phong cách **Glassmorphism** và **Cyberpunk** với tông màu tối, viền neon xanh/đỏ để nhấn mạnh tính quan trọng của dữ liệu bảo mật.
*   **KPI Cards**: Hiển thị 4 chỉ số sinh tử: `Threat Level` (Mức độ đe dọa), `System Uptime` (Thời gian hoạt động), `Active Sessions` (Phiên hoạt động), và `Blocked IPs` (IP bị chặn).
*   **Biểu đồ Tần suất (Custom Bar Chart)**: Một biểu đồ thanh tự dựng bằng CSS (`chart-bar`) hiển thị nỗ lực đăng nhập trái phép theo thời gian thực ([L204-211](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L204-211)).

### 📡 Luồng dữ liệu (Data Loading)
*   **Polling thời gian thực**: Sử dụng `setInterval` để gọi lại API mỗi **5 giây** ([L31-34](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L31-34)). Điều này đảm bảo dữ liệu luôn mới mà không cần WebSocket (giảm tải server cho các dữ liệu thống kê).
*   **APIs sử dụng**:
    *   `api.getSecurityDashboard(30)`: Lấy dữ liệu tổng hợp trong 30 ngày.
    *   `api.getSecurityAlerts(true)`: Lấy các cảnh báo an ninh chưa xử lý.
*   **Xử lý Logic**: Dữ liệu từ backend trả về được map thủ công sang các biến UI như `totalAlerts`, `uptimePercent` ([L82-90](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L82-90)).

### 🛠️ Công nghệ chủ chốt
*   **React hooks**: `useEffect` và `useState` để quản lý chu kỳ sống của dữ liệu.
*   **Boxicons**: Thư viện icon chuyên dụng cho Admin Dashboard.
*   **Blob & URL.createObjectURL**: Sử dụng để xuất báo cáo CSV ra file cho người dùng tải về ([L39-57](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L39-57)).

---

## 2. Trang Quản lý Người dùng (UsersPage.js)
Nơi quản lý vòng đời của toàn bộ thành viên trong hệ thống.

### 🖼️ Hiển thị
*   **Table-based UI**: Danh sách người dùng được hiển thị trong bảng với các badge màu sắc để phân biệt Role (`Admin` - Đỏ, `Manager` - Cam, `User` - Xanh).
*   **Search & Filter**: Cho phép tìm kiếm theo tên hoặc email và lọc theo trạng thái tài khoản.

### 📡 Luồng dữ liệu
*   **CRUD Operations**:
    *   `api.getUsers()`: Lấy danh sách toàn bộ người dùng.
    *   `api.updateUserStatus()`: Kích hoạt hoặc khóa tài khoản ngay lập tức.
    *   `api.deleteUser()`: Xóa vĩnh viễn tài khoản.
*   **Role-based UI**: Chỉ Admin mới thấy nút "Edit" hoặc "Delete" để đảm bảo tính an toàn dữ liệu.

---

## 3. Trang Nhật ký & Pháp y (LogsPage.js)
Công cụ để thám tra và phân tích các vụ tấn công.

### 🖼️ Chức năng đặc biệt
*   **Severity Highlighting**: Các log được phân cấp `INFO`, `WARNING`, `CRITICAL`.
*   **Forensic Details**: Click vào một dòng log sẽ hiển thị chi tiết "Source IP", "User Agent" (Trình duyệt kẻ tấn công), và "Action" bị chặn.

### 📡 Luồng dữ liệu
*   **Filtering**: Cho phép lọc log theo ID cụ thể (khi click từ Dashboard sang) hoặc theo khoảng thời gian.
*   **API**: `api.getSecurityLogs()` lấy dữ liệu từ bảng `security_events` trong Database.

---

## 4. Công nghệ Tổng quát (Tech Stack)
*   **Frontend**: ReactJS + Lucide/Boxicons (Icons) + CSS Modules (Styling).
*   **State Management**: `useState` cục bộ kết hợp với `AuthContext` để lấy thông tin Token Admin.
*   **Networking**: `Axios` (bọc trong `api.js`) với interceptor tự động đính kèm JWT vào Header.
*   **Security**: Tất cả các trang Admin đều được bọc bởi `AdminGuard` ở phía Router, ngăn chặn user thường truy cập trái phép.

---

> [!TIP]
> **Điểm đặc biệt**: Hệ thống sử dụng chế độ **"Synchronizing Sentinel"** (Màn hình loading đặc biệt) khi đang tải dữ liệu Admin, tạo cảm giác chuyên nghiệp và an toàn cao.
