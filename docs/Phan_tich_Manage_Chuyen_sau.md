# Phân tích Kỹ thuật Chuyên sâu: Hệ thống Quản lý (Manager View)

Tài liệu này bốc tách chi tiết cấu trúc mã nguồn, cơ chế điều phối đội ngũ và dự án của phân quyền Quản lý (Manager).

---

## 🛠️ Trang Quản lý (ManageHomePage.js)
Dành cho cấp quản lý để theo dõi hiệu suất, duyệt nhân sự và phân bổ công việc.

### ⚙️ Luồng vận hành (Execution Flow)
1.  **Đồng bộ hứa hẹn (Promise-based loading)**: Khi trang khởi chạy, hàm `loadData` ([L732-752](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L732-752)) sử dụng kiến trúc `Promise.all` để kéo đồng thời danh sách Dự án (`api.getProjects`) và Nhân viên (`api.getChatUsers`).
2.  **Quản lý Real-time (Socket)**: Manager cũng thừa hưởng hệ thống Socket tương tự User ([L64-114](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L64-114)) giúp hiển thị trực quan trạng thái nhân viên: `Operational` (Xanh) hoặc `Restricted` (Đỏ).
3.  **Điều khiển CSS Variables**: Manager có bộ chuyển đổi `DarkMode` riêng biệt ([L683-728](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L683-728)) can thiệp trực tiếp vào `document.documentElement`, giúp toàn bộ UI đổi màu đồng bộ mà không cần nạp lại (re-render) quá nhiều.

### 🛠️ Dòng code quan trọng
*   **Team Capacity logic**: Dữ liệu tải trọng đội ngũ được mô phỏng ngẫu nhiên tại [L744](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L744) nhưng sẵn sàng đón nhận dữ liệu thực tế từ backend thông qua API.
*   **Kênh chat chuyên dụng**: Khi Manager nhấn "Open Secure Channel" ([L651](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L651)), hệ thống gọi `getOrCreateDirectConversation` để tự động tạo kênh chat bảo mật với nhân viên nếu chưa có.
*   **Sidebar Navigation**: Component `ManagerNavItem` ([L16-44](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L16-44)) là ví dụ điển hình cho tính chất **Modular UI** trong ứng dụng, có thể tái sử dụng cho nhiều tab chức năng khác nhau.

### 📊 Các chỉ số giám sát
*   **Overview Stats**: Gói gọn trong một State `stats` ([L679-681](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L679-681)) bao gồm: `totalProjects`, `activeTasks`, `teamCapacity`, và `upcomingDeadlines`.

---

> [!TIP]
> **Điểm khác biệt**: Trang Manage tập trung vào việc đọc và tổng quát hóa dữ liệu (Read-heavy) thay vì giao tiếp thời gian thực nồng độ cao như trang User. Tuy nhiên, mọi thông tin về dự án vẫn được hiển thị qua các Badge bảo mật để đảm bảo tính riêng tư.
