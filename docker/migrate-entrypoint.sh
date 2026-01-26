#!/usr/bin/env bash
# Migrate entrypoint: wait for MySQL, run full schema setup, run 001 migration, signal done.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"
MYSQL_SCRIPTS_DIR="${MYSQL_SCRIPTS_DIR:-/scripts}"
DONE_FILE="${MIGRATION_DONE_FILE:-/migration_done/done}"

export MYSQL_HOST="${MYSQL_HOST:-mysql}"
export MYSQL_USER="${MYSQL_USER:-root}"
export MYSQL_PASSWORD="${MYSQL_PASSWORD:-password}"
export MYSQL_DATABASE="${MYSQL_DATABASE:-cybersecure_db}"
export MYSQL_PORT="${MYSQL_PORT:-3306}"

echo "==> Waiting for MySQL at $MYSQL_HOST:$MYSQL_PORT..."
until mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" &>/dev/null; do
  echo "    MySQL not ready, retrying in 2s..."
  sleep 2
done
echo "==> MySQL is ready."

echo "==> Running full schema setup..."
MYSQL_CMD="mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD"
MYSQL_DB="$MYSQL_DATABASE"
if [ -f "$MYSQL_SCRIPTS_DIR/run_complete_setup_docker.sh" ]; then
  bash "$MYSQL_SCRIPTS_DIR/run_complete_setup_docker.sh"
else
  echo "ERROR: run_complete_setup_docker.sh not found in $MYSQL_SCRIPTS_DIR"
  exit 1
fi

echo "==> Running migration 001_update_team_members..."
if [ -f "$MIGRATIONS_DIR/001_update_team_members.sql" ]; then
  $MYSQL_CMD "$MYSQL_DB" < "$MIGRATIONS_DIR/001_update_team_members.sql" || true
else
  echo "    (skip: 001_update_team_members.sql not found)"
fi

echo "==> Signaling migration done..."
mkdir -p "$(dirname "$DONE_FILE")"
touch "$DONE_FILE"

echo "==> Migrations completed."
