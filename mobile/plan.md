# Kế Hoạch Chi Tiết Lập Trình Mobile App (CyberSecure)

Tài liệu này là bản đặc tả kỹ thuật và lộ trình rải đường đi chi tiết (Blueprint) để xây dựng ứng dụng Mobile độc lập từ số 0, sao chép 100% tính năng và cơ chế bảo mật của Website hiện tại nhưng được xây dựng bằng React Native.

---

## 1. Công Nghệ & Stack Lựa Chọn

Để tương thích với Backend NestJS và kiến trúc bảo mật hiện tại, stack Mobile sẽ sử dụng:
- **Framework Chính:** Expo (React Native) - Bản mới nhất hỗ trợ thư mục src.
- **Điều hướng (Routing):** `react-navigation` (Native Stack & Bottom Tabs).
- **Quản lý Trạng thái (State):** React Context API (Auth, E2EE, Sockets).
- **Network & Realtime:** `axios` (HTTP Calls), `socket.io-client` (WebSockets).
- **Mobile Crypto (Thay thế WebCrypto):** `react-native-quick-crypto` (Xử lý C++ PBKDF2, AES-256-GCM không gây lag).
- **Lưu trữ An toàn (Storage):** `expo-secure-store` (Lưu token JWT vào keychain của OS thay vì AsyncStorage, chống trích xuất dữ liệu rác).
- **Giao diện (UI):** Sử dụng **NativeWind** để đồng bộ 100% các class TailwindCSS từ bản Web sang Mobile, giúp đẩy nhanh tiến độ code UI và đồng nhất thiết kế.
- **Phân quyền (RBAC):** Tách biệt luồng hiển thị cho quyền `user` và `manager` tương tự Web.

---

## 2. Bản Đồ Cấu Trúc App (Architecture Tree)

Cấu trúc thư mục (Nằm hoàn toàn trong `/mobile/src`):

```javascript
src/
 ├── api/               # Chứa axios config và các hàm gọi REST API hệt như bản web.
 │    ├── auth.js       # Login, Verify MFA, Refresh Token
 │    ├── chat.js       # Load history messages
 │    └── vault.js      # Up/Down files
 ├── components/        # UI Component dùng chung (Button, Input, Avatar, Loading)
 ├── context/           # Global State
 │    ├── AuthContext.js# Lưu trữ in-memory Token & User State
 │    ├── SocketContext.js # Kết nối và gỡ connection Socket
 │    └── E2EEContext.js   # Giữ Private Key trong RAM (Không lưu ổ cứng)
 ├── navigation/        # Bộ định tuyến
 │    ├── AuthStack.js  # Stack màn hình lúc chưa đăng nhập
 │    └── AppTab.js     # Chứa thanh điều hướng dưới đáy (Chat, Contacts, Vault, Settings)
 ├── screens/           
 │    ├── auth/         # LoginScreen, MFAScreen
 │    ├── main/         # ConversationListScreen, ContactListScreen
 │    ├── chat/         # ChatRoomScreen (Nhắn tin, Bubble E2EE)
 │    ├── call/         # RangingCallScreen, ActiveCallScreen
 │    └── vault/        # VaultScreen (Hiển thị file bảo mật)
 └── utils/
      ├── crypto.js     # Hàm Polyfill tái tạo lại chuẩn giải mã AES của Web
      └── helpers.js    # Format thời gian, byte size.
```

---

## 3. Lộ Trình Code (6 Giai Đoạn Chi Tiết)

Quy trình sẽ được chia làm 6 Phase. Mỗi Phase làm xong có thể Build lên điện thoại chạy thử.

### Phase 1: Nền Móng, Định Tuyến & Giao Diện (NativeWind)
- [ ] Dùng `create-expo-app` khởi tạo dự án. Cài đặt và cấu hình `NativeWind` (TailwindCSS cho React Native).
- [ ] Cấu hình biến môi trường `.env` trỏ về `API_URL` của máy chủ.
- [ ] Cài đặt `react-navigation`. Khởi tạo các luồng: **Auth Flow** (Cho người chưa đăng nhập) và **App Flow** (Người đã đăng nhập).

### Phase 2: Xác thực, Quản Lý Phiên & Phân Quyền (RBAC)
- [ ] Vẽ UI cho màn hình Đăng Nhập (Login). Gọi API `POST /auth/login`.  
- [ ] Cấu hình màn hình bắt mã OTP (MFA Screen). Xử lý luồng `mfaRequired`.
- [ ] Lưu Token an toàn bằng `SecureStore`. 
- [ ] **Phân quyền Role:** Sau khi giải mã Token JWT, kiểm tra `user.role`. Nếu là `manager`, hiển thị các Tab Quản lý (Thống kê, Quản lý Project/User). Nếu là `user`, chỉ hiển thị luồng Chat & Vault cơ bản.

### Phase 3: Danh Sách Trò Chuyện & Sockets
- [ ] Thiết lập `SocketContext` tự động connect khi Auth = true.
- [ ] Gọi API lấy danh sách Room Chat (`/conversations`). Render UI dạng danh sách vuốt giống Messenger.
- [ ] Vẽ Màn hình Chát (Chat Room) với bàn phím động (KeyboardAvoidingView) và ô text input.

### Phase 4: Trái Tim Ứng Dụng - Mã Hoá E2EE
*(Giai đoạn kỹ thuật gian nan nhất)*
- [ ] Màn hình "Nhập PIN Khóa Mật Mã": Nhận PIN 6 số từ người dùng.
- [ ] Load thư viện `quick-crypto`. Chạy hàm KDF `PBKDF2` (310k vòng) để mở khóa Private Key. Lưu key này vào State RAM.
- [ ] Đồng bộ giải mã: Viết adapter để giải mã chuỗi `[E2EE]:...` trả về từ Backend ngay trên danh sách chat.

### Phase 5: Giao thức Gọi Thoại/Video (WebRTC)
- [ ] Cài đặt `react-native-webrtc`. Xin quyền (Permissions) Camera & Micro OS.
- [ ] Viết bộ bắt sự kiện Socket `webrtc_offer`, `webrtc_answer`, `webrtc_ice`.
- [ ] Hiển thị Màn hình Call: Popup nhận cuộc gọi -> Nút nghe/từ chối -> Giao diện In-call.

### Phase 6: System Vault & Settings
- [ ] Hiển thị danh sách tệp lưu trữ.
- [ ] Cấu hình tải trực tiếp file bằng stream, giải mã tại chỗ, và xem preview bằng expo-file-reader.
- [ ] Màn hình Đổi mật khẩu/Đăng xuất.

---

## 4. Các Rủi Ro Công Nghệ Đã Lường Trước

| Rủi Ro | Hậu quả nếu không làm đúng | Hướng Giải Quyết trên Mobile |
| :--- | :--- | :--- |
| **Bảo mật JWT** | Bị bên thứ 3 đọc trộm token nếu dùng `AsyncStorage`. | Dùng hệ thống mã hoá cấp độ OS qua gói `expo-secure-store`. |
| **Tốc độ mã hoá E2EE** | Javascript Native không có Multi-threading, decode 100 tin nhắn mất vài chục giây, máy nóng ran. | Cài đặt `react-native-quick-crypto` để bypass JSI call thẳng xuống C++, đạt tốc độ tương đương trình duyệt. |
| **Bàn phím che mất Chat** | Nhắn tin bị thụt UI, rất ức chế. | Sử dụng linh hoạt `KeyboardAvoidingView` và `Platform.OS` config cho iOS/Android.|

---

## Mời Xác Nhận (User Review Required)

> [!IMPORTANT]
> Bản kế hoạch này đã phác hoạ mọi chi tiết từ API, mã hoá đến Tầm nhìn UI. Nếu bạn đã nắm rỏ cơ chế phát triển:
>
> 1. Bạn duyệt Kế hoạch 6 Phase này chứ?
> 2. Theo bạn, chúng ta nên code **UI/CSS tay 100% bằng StyleSheet** (Tùy biến cực cao nhưng tốn thời gian) hay dùng một thư viện UI như **NativeWind** (Cho phép viết class Tailwind giống web) cho nhanh?