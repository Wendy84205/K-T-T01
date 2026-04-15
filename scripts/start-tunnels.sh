#!/bin/bash
# =============================================================
# CyberSecure Enterprise - Start Script (Web + API Only)
# =============================================================
# Chạy: ./scripts/start-tunnels.sh
# Dừng tunnels: pkill cloudflared
# =============================================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "======================================================"
echo " 🛡️  CyberSecure - Web & API Startup"
echo "======================================================"

mkdir -p "$PROJECT_ROOT/logs"

# ─────────────────────────────────────────────────────────────
# BƯỚC 1: ĐẢM BẢO DOCKER ĐANG CHẠY
# ─────────────────────────────────────────────────────────────
echo ""
echo " 🐳 Kiểm tra Docker..."
if ! docker ps >/dev/null 2>&1; then
    echo "    Docker chưa chạy. Đang khởi động..."
    open -a Docker
    for i in {1..20}; do
        if docker ps >/dev/null 2>&1; then
            echo "    ✅ Docker đã sẵn sàng!"
            break
        fi
        printf "    Đang chờ ($i/20)...\r"
        sleep 6
    done
    if ! docker ps >/dev/null 2>&1; then
        echo "    ❌ Docker không phản hồi sau 2 phút. Vui lòng mở Docker Desktop thủ công."
        exit 1
    fi
else
    echo "    ✅ Docker đang chạy."
fi

# ─────────────────────────────────────────────────────────────
# BƯỚC 2: KHỞI ĐỘNG MYSQL TRƯỚC
# ─────────────────────────────────────────────────────────────
echo ""
echo " 🗄️  Khởi động MySQL..."
MYSQL_STATUS=$(docker inspect --format='{{.State.Health.Status}}' cybersecure-mysql 2>/dev/null)

if [ "$MYSQL_STATUS" != "healthy" ]; then
    docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d mysql >/dev/null 2>&1
    echo "    Đang chờ MySQL healthy..."
    for i in {1..20}; do
        MYSQL_STATUS=$(docker inspect --format='{{.State.Health.Status}}' cybersecure-mysql 2>/dev/null)
        if [ "$MYSQL_STATUS" = "healthy" ]; then
            echo "    ✅ MySQL healthy!"
            break
        fi
        printf "    MySQL: $MYSQL_STATUS ($i/20)...\r"
        sleep 5
    done
else
    echo "    ✅ MySQL đã healthy."
fi

# ─────────────────────────────────────────────────────────────
# BƯỚC 3: KHỞI ĐỘNG BACKEND + FRONTEND
# ─────────────────────────────────────────────────────────────
echo ""
echo " ⚙️  Khởi động Backend & Frontend..."
docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d backend frontend 2>/dev/null
sleep 5

# Confirm they're up
BACKEND_RUNNING=$(docker inspect --format='{{.State.Status}}' cybersecure-backend 2>/dev/null)
FRONTEND_RUNNING=$(docker inspect --format='{{.State.Status}}' cybersecure-frontend 2>/dev/null)
echo "    Backend: $BACKEND_RUNNING | Frontend: $FRONTEND_RUNNING"

# ─────────────────────────────────────────────────────────────
# BƯỚC 4: KHỞI ĐỘNG CLOUDFLARE TUNNELS
# ─────────────────────────────────────────────────────────────
echo ""
echo " 🌐 Dọn dẹp tunnels cũ..."
pkill -f cloudflared 2>/dev/null || true
sleep 3
truncate -s 0 "$PROJECT_ROOT/logs/cloudflare-frontend.log"
truncate -s 0 "$PROJECT_ROOT/logs/cloudflare-backend.log"

echo " 🌐 Khởi động Frontend Tunnel (Port 3000)..."
nohup cloudflared tunnel --url http://127.0.0.1:3000 > "$PROJECT_ROOT/logs/cloudflare-frontend.log" 2>&1 &
FRONTEND_PID=$!

echo " ⚙️  Khởi động Backend Tunnel (Port 3001)..."
nohup cloudflared tunnel --url http://127.0.0.1:3001 > "$PROJECT_ROOT/logs/cloudflare-backend.log" 2>&1 &
BACKEND_PID=$!

# ─────────────────────────────────────────────────────────────
# BƯỚC 5: CHỜ URLS CLOUDFLARE
# ─────────────────────────────────────────────────────────────
echo ""
echo " ⏳ Đang chờ URLs từ Cloudflare (tối đa 45s)..."
TIMEOUT=45; ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    FRONTEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' "$PROJECT_ROOT/logs/cloudflare-frontend.log" 2>/dev/null | grep -v "api.trycloudflare.com" | tail -1)
    BACKEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' "$PROJECT_ROOT/logs/cloudflare-backend.log" 2>/dev/null | grep -v "api.trycloudflare.com" | tail -1)
    if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
        break
    fi
    printf "    Đang kết nối Cloudflare... (${ELAPSED}s)\r"
    sleep 3
    ELAPSED=$((ELAPSED + 3))
done

if [ -z "$FRONTEND_URL" ] || [ -z "$BACKEND_URL" ]; then
    echo ""
    echo " ⚠️  Không lấy được URL từ Cloudflare!"
    echo "    Có thể bị Rate Limit (429). Đợi 10-15 phút rồi chạy lại script."
    echo ""
    echo " 🔍 Kiểm tra log:"
    tail -n 3 "$PROJECT_ROOT/logs/cloudflare-frontend.log"
    echo ""
    echo " 📌 Bạn vẫn có thể truy cập local:"
    echo "    Frontend: http://127.0.0.1:3000"
    echo "    Backend:  http://127.0.0.1:3001"
    echo "======================================================"
    exit 1
fi

# ─────────────────────────────────────────────────────────────
# BƯỚC 6: CẬP NHẬT CẤU HÌNH TỰ ĐỘNG
# ─────────────────────────────────────────────────────────────
echo ""
echo " 🛠️  Cập nhật cấu hình với URLs mới..."

# Cập nhật frontend/src/config.js
cat > "$PROJECT_ROOT/frontend/src/config.js" << EOF
// AUTO-GENERATED - DO NOT EDIT MANUALLY
export const BACKEND_URL = '${BACKEND_URL}';
export const API_BASE_URL = \`\${BACKEND_URL}/api/v1\`;
EOF

# Cập nhật CORS trong backend/.env
sed -i '' -E "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://127.0.0.1:3000,$FRONTEND_URL|g" "$PROJECT_ROOT/backend/.env" 2>/dev/null || true
sed -i '' -E "s|^JWT_COOKIE_SECURE=.*|JWT_COOKIE_SECURE=true|g" "$PROJECT_ROOT/backend/.env" 2>/dev/null || true
sed -i '' -E "s|^JWT_COOKIE_SAME_SITE=.*|JWT_COOKIE_SAME_SITE=none|g" "$PROJECT_ROOT/backend/.env" 2>/dev/null || true

# Cập nhật CORS trong docker-compose.yml
sed -i '' -E "s|CORS_ORIGIN: \".*\"|CORS_ORIGIN: \"http://127.0.0.1:3000,$FRONTEND_URL\"|g" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null || true

# Khởi động lại backend để áp dụng CORS mới
echo "    Đang restart backend để áp dụng CORS..."
docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d --force-recreate backend >/dev/null 2>&1

# Lưu URLs ra file
cat > "$PROJECT_ROOT/logs/tunnel-urls.txt" << EOF
CyberSecure - Tunnel URLs
Generated: $(date)

Frontend: $FRONTEND_URL
Backend:  $BACKEND_URL

Frontend PID: $FRONTEND_PID
Backend PID:  $BACKEND_PID
EOF

# ─────────────────────────────────────────────────────────────
# HOÀN TẤT
# ─────────────────────────────────────────────────────────────
echo ""
echo "======================================================"
echo " ✅ HỆ THỐNG ĐÃ SẴN SÀNG"
echo "======================================================"
echo ""
echo "  🌐 Frontend : $FRONTEND_URL"
echo "  ⚙️  Backend  : $BACKEND_URL"
echo ""
echo "  📁 Local:"
echo "     Frontend: http://127.0.0.1:3000"
echo "     Backend:  http://127.0.0.1:3001"
echo ""
echo "  📋 Lệnh hữu ích:"
echo "     Dừng tunnels:  pkill cloudflared"
echo "     Xem logs:      tail -f logs/cloudflare-frontend.log"
echo "     Docker status: docker ps"
echo "======================================================"
