#!/bin/bash
# =============================================================
# CyberSecure Enterprise - Mobile App Startup Script
# =============================================================
# Chạy    : ./scripts/start-mobile.sh
# Kết thúc: Bấm Ctrl+C (tự động dọn dẹp hệ thống)
# =============================================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "======================================================"
echo " 📱 CyberSecure - Mobile App Startup"
echo "======================================================"

mkdir -p "$PROJECT_ROOT/logs"

# ─────────────────────────────────────────────────────────────
# BƯỚC 1: LẤY BACKEND URL TỪ HỆ THỐNG LÕI
# ─────────────────────────────────────────────────────────────
URL_FILE="$PROJECT_ROOT/logs/tunnel-urls.txt"
if [ ! -f "$URL_FILE" ]; then
    echo " ❌ Lỗi: Bạn phải chạy Web & API trước bằng lệnh: ./scripts/start-tunnels.sh"
    exit 1
fi
BACKEND_URL=$(grep "Backend:  http" "$URL_FILE" | awk '{print $2}')
if [ -z "$BACKEND_URL" ]; then
    echo " ❌ Lỗi: Không đọc được Backend URL từ tunnel-urls.txt."
    exit 1
fi
echo "    ✅ Backend URL tìm thấy: $BACKEND_URL"

# ─────────────────────────────────────────────────────────────
# BƯỚC 2: CẬP NHẬT CẤU HÌNH MOBILE CODE
# ─────────────────────────────────────────────────────────────
sed -i '' -E "s|export const API_BASE_URL = '.*';|export const API_BASE_URL = '${BACKEND_URL}/api/v1';|g" "$PROJECT_ROOT/mobile/src/api/index.js" 2>/dev/null || true
sed -i '' -E "s|export const BACKEND_URL = '.*';|export const BACKEND_URL = '${BACKEND_URL}';|g" "$PROJECT_ROOT/mobile/src/context/SocketContext.js" 2>/dev/null || true

# ─────────────────────────────────────────────────────────────
# BƯỚC 3: DỌN DẸP TIẾN TRÌNH CŨ
# ─────────────────────────────────────────────────────────────
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
pkill -f "cloudflared tunnel.*8081" 2>/dev/null || true
truncate -s 0 "$PROJECT_ROOT/logs/cloudflare-mobile.log" 2>/dev/null || true

# ─────────────────────────────────────────────────────────────
# BƯỚC 4: KHỞI ĐỘNG CLOUDFLARE MOBILE TUNNEL
# ─────────────────────────────────────────────────────────────
echo ""
echo " 🌐 Đang tạo Cloudflare Tunnel cho Mobile (Vượt tường lửa)..."
nohup cloudflared tunnel --url http://127.0.0.1:8081 > "$PROJECT_ROOT/logs/cloudflare-mobile.log" 2>&1 &
MOBILE_PID=$!

TIMEOUT=45; ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    MOBILE_URL=$(grep -a -o 'https://[^[:space:]]*trycloudflare.com' "$PROJECT_ROOT/logs/cloudflare-mobile.log" 2>/dev/null | grep -v "api.trycloudflare.com" | tail -1 | tr -d '[:space:]')
    if [ -n "$MOBILE_URL" ]; then
        break
    fi
    printf "    Đang kết nối Cloudflare... (${ELAPSED}s)\r"
    sleep 3
    ELAPSED=$((ELAPSED + 3))
done

if [ -z "$MOBILE_URL" ]; then
    echo ""
    echo " ❌ Thất bại: Không thể lấy URL Cloudflare. Hãy đợi 15 phút nếu bị rate limit."
    kill -9 $MOBILE_PID 2>/dev/null || true
    exit 1
fi

echo "    ✅ Tuyến đường hầm thành công: $MOBILE_URL"

# ============================================================
# Cài đặt bẫy: Khi người dùng bấm Ctrl+C sẽ hủy tunnel
# ============================================================
trap "echo -e '\nĐang tắt tự động Mobile Tunnel ($MOBILE_PID)...'; kill -9 $MOBILE_PID 2>/dev/null; exit 0" SIGINT SIGTERM

echo ""
echo "======================================================"
echo " 🚀 Bật Expo với Custom Cloudflare Routing..."
echo "     (Bấm Ctrl+C để thoát và tắt tunnel tự động)"
echo "======================================================"

cd "$PROJECT_ROOT/mobile"
# Ép Expo tạo QR Code trỏ thẳng vào Cloudflare (Tránh trang cảnh báo của Ngrok)
export EXPO_PACKAGER_PROXY_URL="$MOBILE_URL"
# Vẫn chạy offline flag ở cấp độ build (để bỏ qua Network check lỏng lẻo) 
npx expo start -c --offline
