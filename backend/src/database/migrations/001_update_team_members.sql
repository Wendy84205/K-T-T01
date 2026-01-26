-- Migration: Update team_members table
-- Date: 2025-01-26
-- Description: Add updated_at and left_by columns to team_members table

USE cybersecure_db;

-- Add updated_at column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'cybersecure_db' 
    AND TABLE_NAME = 'team_members' 
    AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE team_members ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT "Column updated_at already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add left_by column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'cybersecure_db' 
    AND TABLE_NAME = 'team_members' 
    AND COLUMN_NAME = 'left_by'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE team_members ADD COLUMN left_by CHAR(36) NULL AFTER left_date',
    'SELECT "Column left_by already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify changes
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cybersecure_db' 
AND TABLE_NAME = 'team_members'
AND COLUMN_NAME IN ('updated_at', 'left_by')
ORDER BY ORDINAL_POSITION;
