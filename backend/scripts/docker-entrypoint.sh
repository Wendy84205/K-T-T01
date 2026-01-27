#!/usr/bin/env bash
# Backend entrypoint: wait for migration done marker, then exec CMD.

set -e

DONE_FILE="${MIGRATION_DONE_FILE:-/migration_done/done}"
MAX_WAIT="${MIGRATION_MAX_WAIT:-180}"
ELAPSED=0

echo "==> Waiting for migrations to complete..."
while [ ! -f "$DONE_FILE" ]; do
  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    echo "ERROR: Timeout waiting for migration done marker ($DONE_FILE)"
    exit 1
  fi
  echo "    (migration not done yet, ${ELAPSED}s / ${MAX_WAIT}s)"
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done
echo "==> Migrations done, starting application..."

exec "$@"
