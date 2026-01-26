#!/usr/bin/env bash
# Run migrations + backend via Docker, then test auth API.
# Usage: ./scripts/docker-test.sh
# Uses: docker-compose (or docker compose if available)

set -e
cd "$(dirname "$0")/.."

DC="docker compose"
command -v docker-compose >/dev/null 2>&1 && DC="docker-compose"

echo "==> Stopping any existing containers..."
$DC down 2>/dev/null || true

echo "==> Starting MySQL..."
$DC up -d mysql
echo "    Waiting for MySQL to be healthy..."
until $DC exec -T mysql mysqladmin ping -h localhost -u root -ppassword 2>/dev/null; do
  sleep 2
done
echo "    MySQL is ready."

echo "==> Running migrations (this may take 1–2 minutes)..."
$DC run --rm migrate
echo "    Migrations done."

echo "==> Starting backend and frontend..."
$DC up -d backend frontend

echo "==> Waiting for backend to be up..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:3001/api/v1/auth/health >/dev/null 2>&1; then
    echo "    Backend is up."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "ERROR: Backend did not become healthy in time."
    $DC logs --tail=50 backend
    exit 1
  fi
  sleep 2
done

echo ""
echo "==> Testing Auth API..."
echo "1. Health:"
curl -s http://localhost:3001/api/v1/auth/health
echo ""
echo ""
echo "2. Login (admin@cybersecure.local / Admin@123456):"
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cybersecure.local","password":"Admin@123456"}'
echo ""
echo ""
echo "==> Docker test complete. Stack is running."
echo "    Backend: http://localhost:3001/api/v1"
echo "    Frontend: http://localhost:3000"
echo "    MySQL: localhost:3307 (root/password, cybersecure_db)"
