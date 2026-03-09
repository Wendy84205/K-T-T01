# Phân tích Kỹ thuật Chuyên sâu: Hệ thống Admin (Sentinel SOC)

Tài liệu này bốc tách chi tiết cách thức mã nguồn vận hành, dòng code cụ thể và luồng dữ liệu của các trang quản trị.

---

## 1. AdminHomePage.js (SOC Dashboard)
Đây là màn hình giám sát thời gian thực.

### ⚙️ Cách thức vận hành (Execution Flow)
1.  **Khởi tạo**: Khi trang tải, `useEffect` ([L29-37](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L29-37)) kích hoạt hàm `fetchData`.
2.  **Lấy dữ liệu**: Hàm `fetchData` ([L14-27](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L14-27)) thực hiện gọi song song (`Promise.all`) hai API:
    *   `api.getSecurityDashboard(30)`: Lấy thống kê 30 ngày.
    *   `api.getSecurityAlerts(true)`: Lấy các cảnh báo đang hoạt động.
3.  **Cập nhật liên tục**: Một `setInterval` ([L32-34](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L32-34)) thiết lập chu kỳ **5 giây** để gọi lại `fetchData`, tạo hiệu ứng "Real-time Polling".
4.  **Xử lý hiển thị**: 
    *   **Thống kê (KPI)**: Dữ liệu được tính toán tại [L82-90](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L82-90) để gán vào mảng `stats`.
    *   **Biểu đồ (Chart)**: Dữ liệu nỗ lực đăng nhập thất bại được map vào mảng `displayChartData` tại [L103-125](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L103-125) dựa trên `timeRange` (24h, 7d, 30d).

### 🛠️ Dòng code quan trọng
*   **Polling cơ bản**: `const interval = setInterval(() => { fetchData(); }, 5000);` ([L32](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L32)).
*   **Xuất báo cáo**: Sử dụng `Blob` và `URL.createObjectURL` để tạo link tải file CSV giả lập từ text trả về từ server tại [L43-48](file:///Users/admin/K-T-T01/frontend/src/pages/admin/AdminHomePage.js#L43-48).

---

## 2. UsersPage.js (Access Management)
Quản lý danh sách người dùng và quyền hạn.

### ⚙️ Cách thức vận hành
1.  **Đồng bộ dữ liệu**: Tương tự Dashboard, trang này cũng sử dụng `setInterval` 5 giây ([L87-90](file:///Users/admin/K-T-T01/frontend/src/pages/admin/UsersPage.js#L87-90)) để cập nhật danh sách người dùng, giúp Admin thấy ngay nếu có ai vừa đăng ký.
2.  **Phân trang (Pagination)**: Hàm `fetchUsers` ([L40-77](file:///Users/admin/K-T-T01/frontend/src/pages/admin/UsersPage.js#L40-77)) truyền `page` và `limit` vào API `api.getUsers`.
3.  **Hành động tức thì (Quick Actions)**:
    *   **Khóa khẩn cấp**: `handleEmergencyLock` ([L136-157](file:///Users/admin/K-T-T01/frontend/src/pages/admin/UsersPage.js#L136-157)) gọi API cập nhật trạng thái người dùng thành `banned`.
    *   **Đổi Role**: Khi thay đổi `select` ở [L441-454](file:///Users/admin/K-T-T01/frontend/src/pages/admin/UsersPage.js#L441-454), hàm `handleUpdateRole` sẽ gửi mảng `roles: [newRole]` về server.

### 🛠️ Dòng code quan trọng
*   **Lấy dữ liệu có lọc**: `await api.getUsers(page, limit, filters);` ([L50](file:///Users/admin/K-T-T01/frontend/src/pages/admin/UsersPage.js#L50)).
*   **Quản lý Session**: Hàm `handleManageSessions` ([L198-209](file:///Users/admin/K-T-T01/frontend/src/pages/admin/UsersPage.js#L198-209)) cho phép Admin xem các phiên làm việc của một User cụ thể và "đá" (revoke) họ ra khỏi hệ thống.

---

## 3. LogsPage.js (System Audit Trail)
Giao diện dòng lệnh (Terminal) hiển thị nhật ký hệ thống.

### ⚙️ Cách thức vận hành
1.  **Lọc dữ liệu**: Sử dụng `useCallback` cho `fetchLogs` ([L15-34](file:///Users/admin/K-T-T01/frontend/src/pages/admin/LogsPage.js#L15-34)) để tối ưu hiệu năng khi Re-render.
2.  **Giao diện Terminal**: Dữ liệu log được ánh xạ vào bảng bên trong một thẻ `div` có class `terminal-window` ([L124](file:///Users/admin/K-T-T01/frontend/src/pages/admin/LogsPage.js#L124)).
3.  **Phân tích Pháp y (Forensics)**: Khi click vào một dòng log ([L157](file:///Users/admin/K-T-T01/frontend/src/pages/admin/LogsPage.js#L157)), State `selectedLog` được cập nhật, hiển thị chi tiết Metadata và JSON Payload bên dưới ([L213-255](file:///Users/admin/K-T-T01/frontend/src/pages/admin/LogsPage.js#L213-255)).

### �️ Dòng code quan trọng
*   **Lấy log audit**: `api.getAuditLogs(page, 10, filters)` ([L22](file:///Users/admin/K-T-T01/frontend/src/pages/admin/LogsPage.js#L22)).
*   **Giải mã Payload (Giả lập)**: Hiển thị JSON thô của sự kiện tại [L241-254](file:///Users/admin/K-T-T01/frontend/src/pages/admin/LogsPage.js#L241-254).

---

## 4. Công nghệ Tổng quát & Networking (api.js)
Tất cả các trang trên đều phụ thuộc vào `ApiClient` trong [utils/api.js](file:///Users/admin/K-T-T01/frontend/src/utils/api.js).

*   **Interceptor bảo mật**: Mọi request tự động lấy `accessToken` từ `localStorage` để đính kèm vào Header `Authorization: Bearer ...` ([L10-16](file:///Users/admin/K-T-T01/frontend/src/utils/api.js#L10-16)).
*   **Xử lý lỗi tập trung**: Nếu nhận mã `401` hoặc `403` ([L32-37](file:///Users/admin/K-T-T01/frontend/src/utils/api.js#L32-37)), hệ thống tự động xóa Token và buộc người dùng đăng nhập lại (Session Expired).
*   **Định dạng dữ liệu**: Mặc định sử dụng `JSON.parse` ([L26](file:///Users/admin/K-T-T01/frontend/src/utils/api.js#L26)) và hỗ trợ bóc tách lớp `data` nếu backend trả về cấu trúc bọc `{ success: true, data: { ... } }` ([L45-47](file:///Users/admin/K-T-T01/frontend/src/utils/api.js#L45-47)).

---

> [!IMPORTANT]
> **Performance Note**: Việc sử dụng Polling (setInterval) trên nhiều trang Admin có thể gây tải cho Database. Trong thực tế, các hệ thống lớn sẽ chuyển sang dùng **WebSockets** hoặc **Server-Sent Events (SSE)** để nhận thông báo thay đổi thay vì "hỏi" server liên tục.
