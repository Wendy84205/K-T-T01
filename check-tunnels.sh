#!/bin/bash

echo "🔍 Checking Cloudflare Tunnel Status..."
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed!"
    echo "   Install with: brew install cloudflared"
    exit 1
fi

echo "✅ cloudflared is installed"
cloudflared --version
echo ""

# Check running processes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏃 RUNNING TUNNELS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROCESSES=$(ps aux | grep cloudflared | grep -v grep)

if [ -z "$PROCESSES" ]; then
    echo "❌ No tunnels are currently running"
    echo ""
    echo "💡 To start tunnels, run: ./start-tunnels.sh"
else
    echo "$PROCESSES"
    echo ""
    
    # Count tunnels
    TUNNEL_COUNT=$(echo "$PROCESSES" | wc -l | tr -d ' ')
    echo "📊 Total tunnels running: $TUNNEL_COUNT"
fi

echo ""

# Check for log files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 LOG FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "logs/cloudflare-frontend.log" ]; then
    echo "✅ Frontend log exists: logs/cloudflare-frontend.log"
    FRONTEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' logs/cloudflare-frontend.log | tail -1)
    if [ ! -z "$FRONTEND_URL" ]; then
        echo "   🔗 Frontend URL: $FRONTEND_URL"
    fi
else
    echo "❌ Frontend log not found"
fi

if [ -f "logs/cloudflare-backend.log" ]; then
    echo "✅ Backend log exists: logs/cloudflare-backend.log"
    BACKEND_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' logs/cloudflare-backend.log | tail -1)
    if [ ! -z "$BACKEND_URL" ]; then
        echo "   🔗 Backend URL: $BACKEND_URL"
    fi
else
    echo "❌ Backend log not found"
fi

if [ -f "logs/tunnel-urls.txt" ]; then
    echo ""
    echo "📄 Saved URLs file exists: logs/tunnel-urls.txt"
fi

echo ""

# Check ports
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 PORT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if ports are in use
PORT_3000=$(lsof -i :3000 -sTCP:LISTEN | grep -v PID)
PORT_3001=$(lsof -i :3001 -sTCP:LISTEN | grep -v PID)

if [ ! -z "$PORT_3000" ]; then
    echo "✅ Port 3000 (Frontend) is active"
    echo "   $PORT_3000"
else
    echo "❌ Port 3000 (Frontend) is not in use"
fi

echo ""

if [ ! -z "$PORT_3001" ]; then
    echo "✅ Port 3001 (Backend) is active"
    echo "   $PORT_3001"
else
    echo "❌ Port 3001 (Backend) is not in use"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
