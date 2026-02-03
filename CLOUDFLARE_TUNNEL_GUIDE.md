# 🌐 Hướng Dẫn Thiết Lập Cloudflare Tunnel

## 📋 Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Cài Đặt Cloudflared](#cài-đặt-cloudflared)
3. [Sử Dụng Quick Tunnel (Không Cần Tài Khoản)](#sử-dụng-quick-tunnel)
4. [Sử Dụng Named Tunnel (Cần Tài Khoản)](#sử-dụng-named-tunnel)
5. [Kiểm Tra Tunnel Đang Chạy](#kiểm-tra-tunnel-đang-chạy)
6. [Quản Lý Tunnel](#quản-lý-tunnel)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới Thiệu

Cloudflare Tunnel cho phép bạn expose ứng dụng local (localhost) ra internet một cách an toàn mà không cần:
- Mở port trên router
- Cấu hình firewall
- Có địa chỉ IP tĩnh

**Ứng dụng của bạn hiện tại:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

---

## 🔧 Cài Đặt Cloudflared

### macOS (Homebrew)
```bash
brew install cloudflared
```

### macOS (Manual Download)
```bash
# Download
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz -o cloudflared.tgz

# Extract
tar -xzf cloudflared.tgz

# Move to PATH
sudo mv cloudflared /usr/local/bin/
sudo chmod +x /usr/local/bin/cloudflared
```

### Kiểm tra cài đặt
```bash
cloudflared --version
```

---

## ⚡ Sử Dụng Quick Tunnel (Không Cần Tài Khoản)

### Cách 1: Tunnel Đơn Giản (Đã Chạy)
```bash
# Tunnel cho Frontend (Port 3000)
cloudflared tunnel --url http://localhost:3000

# Tunnel cho Backend (Port 3001)
cloudflared tunnel --url http://localhost:3001
```

**Kết quả:**
- Cloudflare sẽ tạo một URL ngẫu nhiên dạng: `https://randomly-generated-name.trycloudflare.com`
- URL này thay đổi mỗi lần khởi động lại tunnel

### Cách 2: Chạy Nền (Background)
```bash
# Frontend
nohup cloudflared tunnel --url http://localhost:3000 > cloudflare-frontend.log 2>&1 &

# Backend
nohup cloudflared tunnel --url http://localhost:3001 > cloudflare-backend.log 2>&1 &
```

### Cách 3: Sử Dụng Screen/Tmux
```bash
# Tạo session mới
screen -S cloudflare-frontend

# Chạy tunnel
cloudflared tunnel --url http://localhost:3000

# Detach: Ctrl+A, sau đó nhấn D
# Reattach: screen -r cloudflare-frontend
```

---

## 🔐 Sử Dụng Named Tunnel (Cần Tài Khoản)

### Bước 1: Đăng Nhập Cloudflare
```bash
cloudflared tunnel login
```
- Trình duyệt sẽ mở, đăng nhập vào Cloudflare
- Chọn domain bạn muốn sử dụng

### Bước 2: Tạo Tunnel
```bash
# Tạo tunnel với tên tùy chỉnh
cloudflared tunnel create cybersecure-app

# Lưu ý Tunnel ID được hiển thị
```

### Bước 3: Cấu Hình DNS
```bash
# Route domain/subdomain đến tunnel
cloudflared tunnel route dns cybersecure-app app.yourdomain.com
```

### Bước 4: Tạo File Cấu Hình
```bash
# Tạo thư mục config
mkdir -p ~/.cloudflared

# Tạo file config
nano ~/.cloudflared/config.yml
```

**Nội dung file `config.yml`:**
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /Users/admin/.cloudflared/<TUNNEL_ID>.json

ingress:
  # Frontend
  - hostname: app.yourdomain.com
    service: http://localhost:3000
  
  # Backend API
  - hostname: api.yourdomain.com
    service: http://localhost:3001
  
  # Catch-all rule (bắt buộc)
  - service: http_status:404
```

### Bước 5: Chạy Tunnel
```bash
# Chạy với config file
cloudflared tunnel run cybersecure-app

# Hoặc chạy nền
cloudflared tunnel --config ~/.cloudflared/config.yml run cybersecure-app &
```

### Bước 6: Cài Đặt Service (Tự Động Khởi Động)
```bash
# Install service
sudo cloudflared service install

# Start service
sudo launchctl start com.cloudflare.cloudflared
```

---

## 🔍 Kiểm Tra Tunnel Đang Chạy

### Kiểm tra process
```bash
# Xem tất cả tunnel đang chạy
ps aux | grep cloudflared | grep -v grep

# Xem chi tiết với port
lsof -i -P | grep cloudflared
```

### Xem logs
```bash
# Nếu chạy với nohup
tail -f cloudflare-frontend.log
tail -f cloudflare-backend.log

# Nếu chạy service
sudo launchctl list | grep cloudflare
sudo tail -f /Library/Logs/com.cloudflare.cloudflared.err.log
```

### Lấy URL từ logs
```bash
# Tìm URL trong logs
grep "https://" cloudflare-frontend.log | grep "trycloudflare.com"
```

---

## 🎮 Quản Lý Tunnel

### Liệt kê tất cả tunnels
```bash
cloudflared tunnel list
```

### Xem thông tin tunnel
```bash
cloudflared tunnel info cybersecure-app
```

### Dừng tunnel
```bash
# Tìm PID
ps aux | grep cloudflared

# Kill process
kill <PID>

# Hoặc kill tất cả
pkill cloudflared
```

### Xóa tunnel
```bash
# Cleanup routes
cloudflared tunnel route dns --overwrite-dns cybersecure-app app.yourdomain.com

# Delete tunnel
cloudflared tunnel delete cybersecure-app
```

---

## 🚀 Script Tự Động

### Script Khởi Động Tunnel
Tạo file `start-tunnels.sh`:
```bash
#!/bin/bash

echo "🚀 Starting Cloudflare Tunnels..."

# Kill existing tunnels
pkill cloudflared

# Start Frontend Tunnel
echo "📱 Starting Frontend Tunnel (Port 3000)..."
nohup cloudflared tunnel --url http://localhost:3000 > logs/cloudflare-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for URL
sleep 5

# Extract and display URL
FRONTEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' logs/cloudflare-frontend.log | head -1)
echo "✅ Frontend URL: $FRONTEND_URL"

# Start Backend Tunnel
echo "🔧 Starting Backend Tunnel (Port 3001)..."
nohup cloudflared tunnel --url http://localhost:3001 > logs/cloudflare-backend.log 2>&1 &
BACKEND_PID=$!

# Wait for URL
sleep 5

# Extract and display URL
BACKEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' logs/cloudflare-backend.log | head -1)
echo "✅ Backend URL: $BACKEND_URL"

echo ""
echo "📝 Tunnel Information:"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Backend PID: $BACKEND_PID"
echo ""
echo "🔗 Access your app at:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo ""
echo "📊 View logs:"
echo "   tail -f logs/cloudflare-frontend.log"
echo "   tail -f logs/cloudflare-backend.log"
```

### Cách sử dụng script
```bash
# Tạo thư mục logs
mkdir -p logs

# Cấp quyền thực thi
chmod +x start-tunnels.sh

# Chạy script
./start-tunnels.sh
```

---

## 🛠️ Troubleshooting

### Lỗi: "command not found: cloudflared"
```bash
# Kiểm tra PATH
echo $PATH

# Thêm vào PATH (thêm vào ~/.zshrc hoặc ~/.bash_profile)
export PATH="/usr/local/bin:$PATH"

# Reload shell
source ~/.zshrc
```

### Tunnel bị disconnect
```bash
# Kiểm tra kết nối internet
ping cloudflare.com

# Restart tunnel
pkill cloudflared
cloudflared tunnel --url http://localhost:3000
```

### Port đã được sử dụng
```bash
# Kiểm tra port đang sử dụng
lsof -i :3000
lsof -i :3001

# Kill process đang dùng port
kill -9 <PID>
```

### URL thay đổi liên tục
- **Giải pháp**: Sử dụng Named Tunnel với domain riêng (xem phần [Sử Dụng Named Tunnel](#sử-dụng-named-tunnel))

---

## 📊 Trạng Thái Hiện Tại

**Tunnels đang chạy:**
```bash
# Frontend Tunnel
PID: 27036
Port: 3000
Command: cloudflared tunnel --url http://localhost:3000

# Backend Tunnel  
PID: 27027
Port: 3001
Command: cloudflared tunnel --url http://localhost:3001
```

**Để lấy URL hiện tại:**
```bash
# Xem logs của process đang chạy
ps aux | grep cloudflared | grep -v grep

# Hoặc kiểm tra trong terminal đang chạy tunnel
```

---

## 🎯 Best Practices

1. **Development**: Sử dụng Quick Tunnel (không cần config)
2. **Production**: Sử dụng Named Tunnel với domain riêng
3. **Security**: 
   - Không share URL tunnel công khai
   - Sử dụng authentication trong app
   - Enable Cloudflare Access nếu cần
4. **Monitoring**: Luôn check logs để debug
5. **Backup**: Lưu file config và credentials

---

## 📚 Tài Liệu Tham Khảo

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared GitHub](https://github.com/cloudflare/cloudflared)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)

---

## 💡 Tips

- **Tip 1**: Sử dụng `tmux` hoặc `screen` để giữ tunnel chạy khi đóng terminal
- **Tip 2**: Tạo alias trong `.zshrc` để khởi động nhanh:
  ```bash
  alias tunnel-start="cloudflared tunnel --url http://localhost:3000"
  ```
- **Tip 3**: Sử dụng `cloudflared access` để bảo vệ tunnel bằng Cloudflare Access
- **Tip 4**: Monitor tunnel health với `cloudflared tunnel info`

---

**Cập nhật lần cuối**: 2026-02-03
**Version**: 1.0
**Author**: CyberSecure Team
