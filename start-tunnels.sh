#!/bin/bash

echo "🚀 Starting Cloudflare Tunnels for CyberSecure App..."
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Kill existing cloudflared processes
echo "🧹 Cleaning up existing tunnels..."
pkill cloudflared
sleep 2

# Start Frontend Tunnel (Port 3000)
echo "📱 Starting Frontend Tunnel (Port 3000)..."
nohup cloudflared tunnel --url http://localhost:3000 > logs/cloudflare-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for tunnel to establish
echo "   Waiting for tunnel to establish..."
sleep 8

# Extract Frontend URL
FRONTEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' logs/cloudflare-frontend.log | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo "   ⚠️  Could not extract Frontend URL. Check logs/cloudflare-frontend.log"
else
    echo "   ✅ Frontend URL: $FRONTEND_URL"
fi

echo ""

# Start Backend Tunnel (Port 3001)
echo "🔧 Starting Backend Tunnel (Port 3001)..."
nohup cloudflared tunnel --url http://localhost:3001 > logs/cloudflare-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for tunnel to establish
echo "   Waiting for tunnel to establish..."
sleep 8

# Extract Backend URL
BACKEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' logs/cloudflare-backend.log | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo "   ⚠️  Could not extract Backend URL. Check logs/cloudflare-backend.log"
else
    echo "   ✅ Backend URL: $BACKEND_URL"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TUNNEL INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Access URLs:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo ""
echo "🆔 Process IDs:"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Backend PID:  $BACKEND_PID"
echo ""
echo "📝 Log Files:"
echo "   Frontend: logs/cloudflare-frontend.log"
echo "   Backend:  logs/cloudflare-backend.log"
echo ""
echo "🛠️  Useful Commands:"
echo "   View Frontend logs: tail -f logs/cloudflare-frontend.log"
echo "   View Backend logs:  tail -f logs/cloudflare-backend.log"
echo "   Stop tunnels:       pkill cloudflared"
echo "   Check status:       ps aux | grep cloudflared"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Tunnels are now running in the background!"
echo "💡 Tip: URLs will change each time you restart the tunnels."
echo "    For permanent URLs, use Named Tunnels (see CLOUDFLARE_TUNNEL_GUIDE.md)"
echo ""

# Save URLs to file for easy access
cat > logs/tunnel-urls.txt << EOF
CyberSecure App - Cloudflare Tunnel URLs
Generated: $(date)

Frontend URL: $FRONTEND_URL
Backend URL:  $BACKEND_URL

Frontend PID: $FRONTEND_PID
Backend PID:  $BACKEND_PID
EOF

echo "📄 URLs saved to: logs/tunnel-urls.txt"
echo ""
