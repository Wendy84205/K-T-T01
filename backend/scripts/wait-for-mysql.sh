#!/usr/bin/env bash
# Wait for MySQL to accept connections.
# Usage: MYSQL_HOST=mysql MYSQL_USER=root MYSQL_PASSWORD=password ./wait-for-mysql.sh

set -e
MYSQL_HOST=${MYSQL_HOST:-localhost}
MYSQL_USER=${MYSQL_USER:-root}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-password}
MYSQL_PORT=${MYSQL_PORT:-3306}

echo "Waiting for MySQL at $MYSQL_HOST:$MYSQL_PORT..."
until mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" &>/dev/null; do
  echo "  MySQL not ready yet, retrying in 2s..."
  sleep 2
done
echo "MySQL is ready."
