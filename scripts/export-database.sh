#!/bin/bash

# Database Export Script for CyberSecure App
# Exports all tables from MySQL Docker container to individual SQL files

echo "  Database Export Script"
echo ""
echo ""

# Configuration
CONTAINER_NAME="cybersecure-mysql"
DB_USER="root"
DB_PASSWORD="password"
DB_NAME="cybersecure_db"
EXPORT_DIR="backend/database/exports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create export directory
mkdir -p "$EXPORT_DIR"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo " Error: MySQL container '$CONTAINER_NAME' is not running!"
    echo "   Start it with: docker-compose up -d mysql"
    exit 1
fi

echo " MySQL container is running"
echo " Database: $DB_NAME"
echo " Export directory: $EXPORT_DIR"
echo ""

# Get list of tables
echo " Fetching table list..."
TABLES=$(docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES;" 2>/dev/null | tail -n +2)

if [ -z "$TABLES" ]; then
    echo " Error: No tables found or unable to connect to database"
    exit 1
fi

TABLE_COUNT=$(echo "$TABLES" | wc -l | tr -d ' ')
echo " Found $TABLE_COUNT tables"
echo ""

# Export each table
echo " Starting export..."
echo ""

COUNTER=0
SUCCESS_COUNT=0
FAILED_COUNT=0

for TABLE in $TABLES; do
    COUNTER=$((COUNTER + 1))
    OUTPUT_FILE="$EXPORT_DIR/${TABLE}.sql"
    
    printf "[%2d/%2d] Exporting %-35s ... " "$COUNTER" "$TABLE_COUNT" "$TABLE"
    
    # Export table structure and data
    docker exec $CONTAINER_NAME mysqldump \
        -u$DB_USER \
        -p$DB_PASSWORD \
        --single-transaction \
        --skip-lock-tables \
        --no-tablespaces \
        $DB_NAME \
        $TABLE \
        2>/dev/null > "$OUTPUT_FILE"
    
    if [ $? -eq 0 ]; then
        FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
        echo " ($FILE_SIZE)"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo " FAILED"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        rm -f "$OUTPUT_FILE"
    fi
done

echo ""
echo ""

# Export full database backup
echo " Creating full database backup..."
FULL_BACKUP_FILE="$EXPORT_DIR/full_backup_${TIMESTAMP}.sql"

docker exec $CONTAINER_NAME mysqldump \
    -u$DB_USER \
    -p$DB_PASSWORD \
    --single-transaction \
    --skip-lock-tables \
    --no-tablespaces \
    --routines \
    --triggers \
    $DB_NAME \
    2>/dev/null > "$FULL_BACKUP_FILE"

if [ $? -eq 0 ]; then
    FULL_SIZE=$(ls -lh "$FULL_BACKUP_FILE" | awk '{print $5}')
    echo " Full backup created: full_backup_${TIMESTAMP}.sql ($FULL_SIZE)"
else
    echo " Full backup failed"
    rm -f "$FULL_BACKUP_FILE"
fi

echo ""
echo ""
echo " EXPORT SUMMARY"
echo ""
echo ""
echo " Successfully exported: $SUCCESS_COUNT tables"
echo " Failed exports: $FAILED_COUNT tables"
echo " Export location: $EXPORT_DIR"
echo ""

# List exported files
echo " Exported files:"
ls -lh "$EXPORT_DIR"/*.sql 2>/dev/null | awk '{printf "   %-40s %8s\n", $9, $5}'

echo ""
echo ""
echo ""
echo " Export completed!"
echo ""
echo " Tips:"
echo "   - Individual table files: $EXPORT_DIR/<table_name>.sql"
echo "   - Full backup: $EXPORT_DIR/full_backup_${TIMESTAMP}.sql"
echo "   - Import a table: mysql -u root -p $DB_NAME < $EXPORT_DIR/<table_name>.sql"
echo "   - Import full backup: mysql -u root -p $DB_NAME < $EXPORT_DIR/full_backup_${TIMESTAMP}.sql"
echo ""
