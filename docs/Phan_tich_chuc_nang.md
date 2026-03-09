# Phân tích Chức năng Hệ thống CyberSecure

Bản phân tích này bốc tách chi tiết các tính năng dành cho 3 nhóm đối tượng: **User** (Người dùng cuối), **Manager** (Quản lý cấp trung), và **Admin** (Quản trị viên hệ thống).

---

## 1. Phân quyền Người dùng (User Role)
Dành cho nhân viên thực hiện các tác vụ giao tiếp và lưu trữ an toàn hằng ngày.

### 💬 Hệ thống Tin nhắn Bảo mật (Secure Messaging)
*   **Mã hóa Đầu-cuối (E2EE)**: Tự động mã hóa tin nhắn bằng cặp khóa RSA/AES (Hybrid).
*   **Tin nhắn Đa phương tiện**: Gửi file, ảnh, sticker, ghi âm (Voice Message).
*   **Tính năng nâng cao**:
    *   **Self-destruct**: Tin nhắn tự hủy sau một khoảng thời gian (10s, 1m, 1h).
    *   **Polls**: Tạo khảo sát nhanh trong nhóm.
    *   **Read Receipts**: Theo dõi trạng thái đã nhận/đã đọc (Single/Double Tick).
*   **Real-time**: Hiển thị trạng thái đang soạn tin (Typing indicator) và Online/Offline.

### 📁 Kho lưu trữ Bảo mật (Secure Vault)
*   Lưu trữ tệp tin trên đám mây với cơ chế mã hóa phía client.
*   Quản lý phiên bản tệp và chia sẻ an toàn cho đồng nghiệp.

### 🛡️ Trung tâm Thông báo (Alerts & Security)
*   Nhận cảnh báo ngay lập tức nếu có hành vi đăng nhập lạ hoặc vi phạm chính sách bảo mật.
*   Quản lý thiết bị đang đăng nhập và đăng xuất từ xa.

---

## 2. Phân quyền Quản lý (Manager Role)
Dành cho Leader hoặc Manager cần theo dõi hiệu suất và điều phối đội ngũ.

### 📊 Dashboard Tổng quan (Team Overview)
*   Theo dõi chỉ số KPI của đội: Tổng số dự án, số công việc đang chạy.
*   **Team Capacity**: Biểu đồ hiển thị mức độ tải công việc của thành viên (x% capacity).

### 👥 Quản lý Đội ngũ (Team Directory)
*   Xem danh sách thành viên trong team với trạng thái vận hành (Operational/Restricted).
*   Mở nhanh các kênh chat bảo mật với nhân viên cấp dưới.

### 🏗️ Quản lý Dự án (Project Management)
*   Tạo và theo dõi tiến độ các `Projects` và `Tasks`.
*   Phân loại trạng thái dự án: `Active`, `Planned`, `On Hold`, `Completed`.

---

## 3. Phân quyền Quản trị (Admin Role)
Dành cho bộ phận IT/Security giám sát toàn bộ hệ thống (Sentinel SOC).

### 📡 Trung tâm Điều hành An ninh (SOC Dashboard)
*   **Real-time Monitoring**: Giám sát nhịp tim hệ thống và các nỗ lực xâm nhập.
*   **Threat Level**: Cảnh báo cấp độ đe dọa (Low/Medium/High) dựa trên số lượng tấn công thực tế.
*   **Network Throughput**: Biểu đồ phân tích lưu lượng traffic và số lần đăng nhập thất bại (Failed Logins).

### 👥 Quản lý Người dùng & Quyền hạn
*   **User CRUD**: Thêm, sửa, xóa và khóa/mở khóa tài khoản người dùng.
*   **Role Management**: Chỉ định vai trò `Admin`, `Manager`, `User`.
*   **Security Clearance**: Thiết lập các quy tắc bảo mật riêng cho từng nhóm người dùng.

### 🔍 Pháp y & Nhật ký Hệ thống (Logs & Forensics)
*   **Security Alerts**: Xem chi tiết các log xâm nhập: IP nguồn, hành động thực hiện, mức độ nghiêm trọng.
*   **Export Reports**: Xuất file CSV nhật ký hệ thống để phục vụ báo cáo.
*   **System Diagnostics**: Chạy chẩn đoán sức khỏe hệ thống chỉ với 1 click.

### ⚙️ Cấu hình Hệ thống (Security Rules)
*   Thiết lập **IP Whitelisting** (Danh sách IP được phép).
*   Cấu hình **Rate Limiting** (Giới hạn tốc độ) để chống tấn công Brute-force.

---

> [!NOTE]
> Hệ thống được thiết kế theo triết lý **"Security by Design"**, mọi tương tác của bất kỳ role nào đều được lưu vết (Audit Log) để đảm bảo tính minh bạch.
