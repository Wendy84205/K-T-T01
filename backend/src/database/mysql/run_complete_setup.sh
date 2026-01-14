#!/bin/bash

echo "==========================================="
echo "COMPLETE DATABASE SETUP"
echo "==========================================="

# Kiểm tra MySQL connection
if ! mysql -u root -ppassword -e "SELECT 1;" &>/dev/null; then
    echo "Cannot connect to MySQL"
    exit 1
fi

echo "MySQL connection: OK"

# Bước 1: Xóa và tạo database mới
echo ""
echo "STEP 1: Creating database..."
mysql -u root -ppassword -e "DROP DATABASE IF EXISTS cybersecure_db; CREATE DATABASE cybersecure_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
echo "Database created"

# Bước 2: Tạo bảng core (từ create_core_tables.sql)
echo ""
echo "STEP 2: Creating core tables..."
mysql -u root -ppassword cybersecure_db << 'SQL1'
-- Set session variables
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- Bảng 1: users
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Authentication
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Personal info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    
    -- Employment info
    employee_id VARCHAR(50) UNIQUE,
    job_title VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    
    -- Relationships
    manager_id CHAR(36),
    primary_team_id CHAR(36),
    
    -- Security flags
    mfa_required BOOLEAN DEFAULT TRUE,
    last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_locked_until TIMESTAMP NULL,
    lock_reason VARCHAR(100),
    security_clearance_level TINYINT DEFAULT 1,
    
    -- Status flags
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    
    -- Login security
    failed_login_attempts INT DEFAULT 0,
    last_failed_login TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Check constraints (MySQL 8.0+)
    CONSTRAINT chk_security_level CHECK (security_clearance_level BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 2: roles
CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) UNIQUE NOT NULL,
    level INT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT TRUE,
    security_level_required TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_role_level CHECK (level BETWEEN 0 AND 100),
    CONSTRAINT chk_role_security_level CHECK (security_level_required BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 3: permissions
CREATE TABLE permissions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    min_role_level INT DEFAULT 10,
    min_security_level TINYINT DEFAULT 1,
    requires_mfa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_resource_action (resource, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 4: user_roles
CREATE TABLE user_roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    assigned_by CHAR(36),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    requires_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_user_role (user_id, role_id),
    INDEX idx_user_roles_user (user_id),
    INDEX idx_user_roles_role (role_id),
    INDEX idx_user_roles_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 5: role_permissions
CREATE TABLE role_permissions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    conditions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_role_permission (role_id, permission_id),
    INDEX idx_role_permissions_role (role_id),
    INDEX idx_role_permissions_permission (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL1
echo "Core tables created"

# Bước 3: Tạo bảng business (từ create_business_tables.sql)
echo ""
echo "STEP 3: Creating business tables..."
mysql -u root -ppassword cybersecure_db << 'SQL2'
-- Bảng 6: teams
CREATE TABLE teams (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    -- Structure
    department_id VARCHAR(100),
    manager_id CHAR(36) NOT NULL,
    parent_team_id CHAR(36),
    
    -- Security settings
    default_security_level TINYINT DEFAULT 2,
    requires_mfa BOOLEAN DEFAULT TRUE,
    encryption_required BOOLEAN DEFAULT TRUE,
    
    -- Configuration
    max_members INT DEFAULT 50,
    storage_quota_mb INT DEFAULT 1024,
    file_size_limit_mb INT DEFAULT 100,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_team_security_level CHECK (default_security_level BETWEEN 1 AND 5),
    CONSTRAINT chk_max_members CHECK (max_members > 0 AND max_members <= 1000),
    INDEX idx_teams_manager (manager_id),
    INDEX idx_teams_parent (parent_team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 7: team_members
CREATE TABLE team_members (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    team_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    
    role_in_team VARCHAR(50) DEFAULT 'member',
    security_clearance TINYINT DEFAULT 2,
    joined_date DATE DEFAULT (CURRENT_DATE),
    left_date DATE NULL,
    
    added_by CHAR(36),
    requires_security_training BOOLEAN DEFAULT FALSE,
    training_completed_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_team_member (team_id, user_id),
    CONSTRAINT chk_member_security CHECK (security_clearance BETWEEN 1 AND 5),
    INDEX idx_team_members_team (team_id),
    INDEX idx_team_members_user (user_id),
    INDEX idx_team_members_active (team_id, user_id, left_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 8: manager_profiles
CREATE TABLE manager_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    
    manager_level VARCHAR(50),
    max_team_size INT DEFAULT 20,
    
    -- Authorities
    can_hire BOOLEAN DEFAULT FALSE,
    can_fire BOOLEAN DEFAULT FALSE,
    can_approve_security BOOLEAN DEFAULT FALSE,
    budget_authority DECIMAL(15,2),
    
    -- Reporting
    reporting_to CHAR(36),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    management_start_date DATE DEFAULT (CURRENT_DATE),
    management_end_date DATE NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_manager_profiles_user (user_id),
    INDEX idx_manager_profiles_reporting (reporting_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 16: folders
CREATE TABLE folders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    
    parent_folder_id CHAR(36),
    owner_id CHAR(36) NOT NULL,
    team_id CHAR(36),
    
    -- Security
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'private',
    encryption_required BOOLEAN DEFAULT TRUE,
    default_encryption_key_id CHAR(36),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_access_level CHECK (access_level IN ('private', 'team', 'department', 'public')),
    INDEX idx_folders_owner (owner_id),
    INDEX idx_folders_parent (parent_folder_id),
    INDEX idx_folders_team (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 17: files
CREATE TABLE files (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- File info
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    extension VARCHAR(50),
    mime_type VARCHAR(100),
    size_bytes BIGINT NOT NULL,
    
    -- Storage info
    storage_path VARCHAR(500) NOT NULL,
    encrypted_storage_path VARCHAR(500),
    storage_provider VARCHAR(50) DEFAULT 'local',
    
    -- Security
    checksum VARCHAR(64) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    hash_algorithm VARCHAR(20) DEFAULT 'SHA-256',
    encryption_key_id CHAR(36),
    is_encrypted BOOLEAN DEFAULT TRUE,
    
    -- Integrity
    last_hash_verification TIMESTAMP NULL,
    virus_scan_status VARCHAR(20) DEFAULT 'pending',
    virus_scan_result JSON,
    scanned_at TIMESTAMP NULL,
    
    -- Ownership
    owner_id CHAR(36) NOT NULL,
    folder_id CHAR(36),
    team_id CHAR(36),
    
    -- Approval workflow
    is_public BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) DEFAULT 'pending',
    approval_by CHAR(36),
    approval_at TIMESTAMP NULL,
    
    -- Versioning
    version_number INT DEFAULT 1,
    is_latest_version BOOLEAN DEFAULT TRUE,
    
    -- Sharing
    share_token VARCHAR(100) UNIQUE,
    
    -- Metadata
    metadata JSON DEFAULT (JSON_OBJECT()),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT chk_file_size CHECK (size_bytes >= 0),
    CONSTRAINT chk_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT chk_virus_status CHECK (virus_scan_status IN ('pending', 'scanning', 'clean', 'infected', 'error')),
    CONSTRAINT chk_file_hashes CHECK (
        file_hash IS NOT NULL AND 
        LENGTH(file_hash) = 64 AND
        checksum IS NOT NULL AND 
        LENGTH(checksum) >= 32
    ),
    
    INDEX idx_files_owner (owner_id),
    INDEX idx_files_folder (folder_id),
    INDEX idx_files_team (team_id),
    INDEX idx_files_created_at (created_at),
    INDEX idx_files_deleted (deleted_at),
    INDEX idx_files_approval_status (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 18: file_versions
CREATE TABLE file_versions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    file_id CHAR(36) NOT NULL,
    version_number INT NOT NULL,
    
    storage_path VARCHAR(500) NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_hash VARCHAR(64),
    encryption_key_id CHAR(36),
    
    changes_description TEXT,
    changed_by CHAR(36),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_file_version (file_id, version_number),
    INDEX idx_file_versions_file (file_id),
    INDEX idx_file_versions_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 19: file_shares
CREATE TABLE file_shares (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    file_id CHAR(36) NOT NULL,
    
    shared_with_type VARCHAR(10),
    shared_with_id CHAR(36) NOT NULL,
    
    permission_level VARCHAR(20) DEFAULT 'view',
    encryption_key_id CHAR(36),
    
    share_token VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    download_limit INT,
    watermark_enabled BOOLEAN DEFAULT FALSE,
    
    shared_by CHAR(36),
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_shared_with_type CHECK (shared_with_type IN ('user', 'team', 'group')),
    CONSTRAINT chk_permission_level CHECK (permission_level IN ('view', 'download', 'edit', 'manage')),
    INDEX idx_file_shares_file (file_id),
    INDEX idx_file_shares_token (share_token),
    INDEX idx_file_shares_active (is_active, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 20: file_integrity_logs
CREATE TABLE file_integrity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    file_id CHAR(36) NOT NULL,
    
    original_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    
    last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_result VARCHAR(20) DEFAULT 'VALID',
    
    tampering_detected_at TIMESTAMP NULL,
    tampering_type VARCHAR(50),
    tampering_details JSON,
    
    reported_to CHAR(36),
    reported_at TIMESTAMP NULL,
    action_taken VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_file_integrity (file_id),
    CONSTRAINT chk_verification_result CHECK (verification_result IN ('VALID', 'TAMPERED', 'ERROR', 'PENDING')),
    INDEX idx_file_integrity_result (verification_result, last_verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL2
echo "Business tables created"

# Bước 4: Tạo bảng security (từ create_security_tables.sql)
echo ""
echo "🔒 STEP 4: Creating security tables..."
mysql -u root -ppassword cybersecure_db << 'SQL3'
-- Bảng 9: mfa_settings
CREATE TABLE mfa_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    
    -- TOTP settings
    totp_enabled BOOLEAN DEFAULT FALSE,
    totp_secret VARCHAR(100),
    totp_backup_codes JSON,
    totp_verified_at TIMESTAMP NULL,
    
    -- SMS MFA
    sms_mfa_enabled BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    sms_verified_at TIMESTAMP NULL,
    
    -- Email MFA
    email_mfa_enabled BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    
    -- Security
    recovery_email VARCHAR(255),
    last_mfa_used VARCHAR(20),
    mfa_failed_attempts INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_mfa_settings CHECK (
        (totp_enabled = FALSE OR totp_secret IS NOT NULL) AND
        (sms_mfa_enabled = FALSE OR phone_number IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 10: user_sessions
CREATE TABLE user_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    
    -- Session tokens
    session_token VARCHAR(512) UNIQUE NOT NULL,
    refresh_token VARCHAR(512) UNIQUE,
    
    -- Device info (Zero Trust)
    device_id VARCHAR(255),
    device_name VARCHAR(100),
    device_type VARCHAR(50),
    device_fingerprint TEXT,
    os VARCHAR(100),
    browser VARCHAR(100),
    browser_fingerprint TEXT,
    
    -- Location info
    ip_address VARCHAR(45) NOT NULL,
    country_code VARCHAR(2),
    city VARCHAR(100),
    is_vpn BOOLEAN DEFAULT FALSE,
    
    -- Security assessment
    is_trusted BOOLEAN DEFAULT FALSE,
    requires_mfa BOOLEAN DEFAULT TRUE,
    risk_score INT DEFAULT 0,
    risk_factors JSON,
    
    -- Timestamps
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    
    -- Revocation info
    revoked_reason VARCHAR(100),
    revoked_by CHAR(36),
    
    INDEX idx_user_sessions_user (user_id),
    INDEX idx_user_sessions_token (session_token),
    INDEX idx_user_sessions_expires (expires_at),
    INDEX idx_user_sessions_device (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 11: encryption_keys
CREATE TABLE encryption_keys (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Key info
    key_type VARCHAR(50) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    key_version INT DEFAULT 1,
    
    -- Key metadata
    key_owner_id CHAR(36),
    key_scope VARCHAR(50),
    scope_id CHAR(36),
    
    -- Key lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_date DATE DEFAULT (CURRENT_DATE),
    rotation_date DATE NULL,
    next_rotation_date DATE NULL,
    expires_at TIMESTAMP NULL,
    
    -- Audit
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    revoked_by CHAR(36),
    
    UNIQUE KEY uq_key_type_name_version (key_type, key_name, key_version),
    CONSTRAINT chk_key_type CHECK (key_type IN ('file', 'message', 'user', 'team', 'system')),
    INDEX idx_encryption_keys_owner (key_owner_id),
    INDEX idx_encryption_keys_scope (key_scope, scope_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 12: security_policies
CREATE TABLE security_policies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    policy_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Policy configuration
    config JSON NOT NULL DEFAULT (JSON_OBJECT()),
    
    -- Activation
    is_active BOOLEAN DEFAULT TRUE,
    applies_to VARCHAR(50) DEFAULT 'all',
    
    -- Timestamps
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_policy_type CHECK (policy_type IN ('password', 'session', 'mfa', 'encryption', 'access')),
    CONSTRAINT chk_applies_to CHECK (applies_to IN ('all', 'role', 'department', 'team', 'user')),
    INDEX idx_security_policies_type (policy_type),
    INDEX idx_security_policies_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 13: failed_login_attempts
CREATE TABLE failed_login_attempts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_successful BOOLEAN DEFAULT FALSE,
    
    -- Security flags
    is_suspicious BOOLEAN DEFAULT FALSE,
    suspicious_reason VARCHAR(100),
    blocked_until TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_failed_logins_ip (ip_address, attempt_time),
    INDEX idx_failed_logins_user (user_id, attempt_time),
    INDEX idx_failed_logins_username (username, attempt_time),
    INDEX idx_failed_logins_suspicious (is_suspicious, attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 14: security_events
CREATE TABLE security_events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    
    -- Event details
    user_id CHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint TEXT,
    
    description TEXT NOT NULL,
    metadata JSON DEFAULT (JSON_OBJECT()),
    
    -- Detection info
    detected_by VARCHAR(100),
    detection_rules JSON,
    
    -- Investigation
    is_investigated BOOLEAN DEFAULT FALSE,
    investigation_notes TEXT,
    investigation_by CHAR(36),
    investigation_at TIMESTAMP NULL,
    
    -- Resolution
    resolution VARCHAR(50),
    resolved_at TIMESTAMP NULL,
    resolved_by CHAR(36),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_resolution CHECK (resolution IN ('false_positive', 'confirmed', 'resolved', 'ignored')),
    INDEX idx_security_events_user (user_id, created_at),
    INDEX idx_security_events_type (event_type, created_at),
    INDEX idx_security_events_severity (severity, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 15: rate_limits
CREATE TABLE rate_limits (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    identifier VARCHAR(255) NOT NULL,
    bucket_type VARCHAR(50) NOT NULL,
    
    -- Rate limiting counters
    request_count INT DEFAULT 0,
    limit_value INT NOT NULL,
    time_window INT NOT NULL,
    
    -- Block status
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason VARCHAR(100),
    blocked_until TIMESTAMP NULL,
    
    -- Statistics
    first_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_rate_limits_identifier (identifier, bucket_type),
    INDEX idx_rate_limits_blocked (is_blocked, blocked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL3
echo "Security tables created"

# Bước 5: Tạo bảng còn lại (communication, audit, etc.)
echo ""
echo "STEP 5: Creating communication and other tables..."
mysql -u root -ppassword cybersecure_db << 'SQL4'
-- Bảng 21: conversations
CREATE TABLE conversations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200),
    avatar_url VARCHAR(500),
    conversation_type VARCHAR(20) DEFAULT 'direct',
    team_id CHAR(36),
    is_private BOOLEAN DEFAULT TRUE,
    encryption_required BOOLEAN DEFAULT TRUE,
    default_encryption_key_id CHAR(36),
    
    created_by CHAR(36),
    last_message_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_conversation_type CHECK (conversation_type IN ('direct', 'group', 'channel')),
    INDEX idx_conversations_team (team_id),
    INDEX idx_conversations_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 22: conversation_members
CREATE TABLE conversation_members (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    
    role VARCHAR(20) DEFAULT 'member',
    encryption_key_id CHAR(36),
    is_muted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_conversation_member (conversation_id, user_id),
    CONSTRAINT chk_member_role CHECK (role IN ('admin', 'moderator', 'member')),
    INDEX idx_conversation_members_conversation (conversation_id),
    INDEX idx_conversation_members_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 23: messages
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    
    -- Message content
    content TEXT,
    encrypted_content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    
    -- Security
    is_encrypted BOOLEAN DEFAULT TRUE,
    encryption_key_id CHAR(36),
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    initialization_vector VARCHAR(64),
    
    -- References
    file_id CHAR(36),
    parent_message_id CHAR(36),
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    delete_reason VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_message_type CHECK (message_type IN ('text', 'image', 'file', 'system', 'audio', 'video')),
    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_created_at (created_at),
    INDEX idx_messages_conversation_date (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 24: message_read_receipts
CREATE TABLE message_read_receipts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    message_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_with_device_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_message_read (message_id, user_id),
    INDEX idx_message_read_receipts_message (message_id),
    INDEX idx_message_read_receipts_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 25: sensitive_operations_log
CREATE TABLE sensitive_operations_log (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    operation_type VARCHAR(50) NOT NULL,
    
    -- Who performed it
    user_id CHAR(36) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    
    -- What was affected
    target_entity_type VARCHAR(50),
    target_entity_id CHAR(36),
    
    -- Details
    justification TEXT,
    approval_required BOOLEAN DEFAULT TRUE,
    approved_by CHAR(36),
    approved_at TIMESTAMP NULL,
    
    -- Result
    operation_result VARCHAR(20),
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_operation_type CHECK (operation_type IN ('decrypt', 'privilege_change', 'security_override', 'data_export')),
    CONSTRAINT chk_operation_result CHECK (operation_result IN ('success', 'failed', 'denied', 'pending')),
    INDEX idx_sensitive_ops_user (user_id, created_at),
    INDEX idx_sensitive_ops_type (operation_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 26: access_requests
CREATE TABLE access_requests (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    
    resource_type VARCHAR(50) NOT NULL,
    resource_id CHAR(36) NOT NULL,
    requested_permission VARCHAR(50) NOT NULL,
    
    ip_address VARCHAR(45) NOT NULL,
    device_id VARCHAR(255),
    location_data JSON,
    
    risk_score INT DEFAULT 0,
    risk_factors JSON,
    
    -- Approval workflow
    status VARCHAR(20) DEFAULT 'PENDING',
    approver_id CHAR(36),
    approved_at TIMESTAMP NULL,
    approval_notes TEXT,
    
    -- Justification
    business_justification TEXT,
    duration_minutes INT,
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    accessed_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_access_status CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'REVOKED')),
    INDEX idx_access_requests_user (user_id, status),
    INDEX idx_access_requests_resource (resource_type, resource_id),
    INDEX idx_access_requests_status (status, requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 27: projects
CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    team_id CHAR(36),
    manager_id CHAR(36),
    
    -- Security classification
    security_level TINYINT DEFAULT 2,
    is_confidential BOOLEAN DEFAULT FALSE,
    
    status VARCHAR(20) DEFAULT 'planned',
    priority VARCHAR(20) DEFAULT 'medium',
    
    start_date DATE NULL,
    end_date DATE NULL,
    deadline DATE NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_project_security CHECK (security_level BETWEEN 1 AND 5),
    CONSTRAINT chk_project_status CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
    CONSTRAINT chk_project_dates CHECK (
        (start_date IS NULL OR end_date IS NULL OR start_date <= end_date) AND
        (deadline IS NULL OR start_date IS NULL OR deadline >= start_date)
    ),
    INDEX idx_projects_team (team_id),
    INDEX idx_projects_manager (manager_id),
    INDEX idx_projects_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 28: tasks
CREATE TABLE tasks (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id CHAR(36),
    
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    assignee_id CHAR(36),
    reporter_id CHAR(36),
    
    status VARCHAR(20) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    is_confidential BOOLEAN DEFAULT FALSE,
    
    due_date DATE NULL,
    completed_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_task_status CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
    CONSTRAINT chk_task_dates CHECK (
        (due_date IS NULL OR due_date >= DATE(created_at)) AND
        (completed_at IS NULL OR completed_at >= created_at)
    ),
    INDEX idx_tasks_project (project_id),
    INDEX idx_tasks_assignee (assignee_id),
    INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 29: notifications
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    
    -- Security classification
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50),
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    
    action_url VARCHAR(500),
    action_label VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 30: security_alerts
CREATE TABLE security_alerts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    affected_users JSON,
    affected_resources JSON,
    
    status VARCHAR(20) DEFAULT 'ACTIVE',
    acknowledged_by CHAR(36),
    acknowledged_at TIMESTAMP NULL,
    resolved_by CHAR(36),
    resolved_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_alert_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_alert_status CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 31: system_logs
CREATE TABLE system_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    level VARCHAR(10) NOT NULL,
    component VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    
    request_id VARCHAR(100),
    user_id CHAR(36),
    ip_address VARCHAR(45),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_log_level CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    INDEX idx_system_logs_level (level),
    INDEX idx_system_logs_component (component),
    INDEX idx_system_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 32: security_metrics
CREATE TABLE security_metrics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    
    -- Counters
    total_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    
    -- Breakdown
    breakdown JSON DEFAULT (JSON_OBJECT()),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_metric_date_type (metric_date, metric_type),
    INDEX idx_security_metrics_date (metric_date),
    INDEX idx_security_metrics_type (metric_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 33: audit_logs (MAIN AUDIT TABLE)
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Actor info
    user_id CHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_id VARCHAR(255),
    location_data JSON,
    
    -- Action info
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    
    -- Changes
    old_values JSON,
    new_values JSON,
    changes JSON,
    
    -- Security context
    severity VARCHAR(20) DEFAULT 'INFO',
    risk_score INT,
    security_context JSON,
    description TEXT,
    metadata JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_audit_severity CHECK (severity IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL')),
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_event_type (event_type),
    INDEX idx_audit_logs_created_at (created_at),
    INDEX idx_audit_logs_user_date (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL4
echo "Communication and other tables created"

# Bước 6: Thêm foreign key constraints
echo ""
echo "STEP 6: Adding foreign key constraints..."
mysql -u root -ppassword cybersecure_db << 'SQL5'
-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Users foreign keys
ALTER TABLE users 
ADD CONSTRAINT fk_users_manager 
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_primary_team 
FOREIGN KEY (primary_team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- User roles foreign keys
ALTER TABLE user_roles 
ADD CONSTRAINT fk_user_roles_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_roles_role 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_roles_assigned_by 
FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

-- Role permissions foreign keys
ALTER TABLE role_permissions 
ADD CONSTRAINT fk_role_permissions_role 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_role_permissions_permission 
FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;

-- Teams foreign keys
ALTER TABLE teams 
ADD CONSTRAINT fk_teams_manager 
FOREIGN KEY (manager_id) REFERENCES users(id),
ADD CONSTRAINT fk_teams_parent 
FOREIGN KEY (parent_team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Team members foreign keys
ALTER TABLE team_members 
ADD CONSTRAINT fk_team_members_team 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_team_members_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_team_members_added_by 
FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL;

-- Manager profiles foreign keys
ALTER TABLE manager_profiles 
ADD CONSTRAINT fk_manager_profiles_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_manager_profiles_reporting 
FOREIGN KEY (reporting_to) REFERENCES users(id) ON DELETE SET NULL;

-- MFA settings foreign key
ALTER TABLE mfa_settings 
ADD CONSTRAINT fk_mfa_settings_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- User sessions foreign key
ALTER TABLE user_sessions 
ADD CONSTRAINT fk_user_sessions_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_sessions_revoked_by 
FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL;

-- Failed login attempts foreign key
ALTER TABLE failed_login_attempts 
ADD CONSTRAINT fk_failed_logins_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
SQL5
echo "Foreign key constraints added"

# Bước 7: Tạo triggers và procedures
echo ""
echo "STEP 7: Creating triggers and procedures..."
mysql -u root -ppassword cybersecure_db << 'SQL6'
DELIMITER //

-- 1. Trigger để tự động cập nhật updated_at
CREATE TRIGGER before_user_update 
BEFORE UPDATE ON users 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER before_team_update 
BEFORE UPDATE ON teams 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER before_file_update 
BEFORE UPDATE ON files 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- 2. Trigger cho failed login attempts
CREATE TRIGGER after_failed_login_insert
AFTER INSERT ON failed_login_attempts
FOR EACH ROW
BEGIN
    DECLARE user_id_val CHAR(36);
    
    -- Tìm user_id từ username hoặc email
    SELECT id INTO user_id_val FROM users 
    WHERE username = NEW.username OR email = NEW.username 
    LIMIT 1;
    
    IF user_id_val IS NOT NULL THEN
        -- Cập nhật failed attempts counter
        UPDATE users 
        SET failed_login_attempts = failed_login_attempts + 1,
            last_failed_login = CURRENT_TIMESTAMP
        WHERE id = user_id_val;
        
        -- Nếu vượt quá 5 lần, lock tài khoản
        UPDATE users 
        SET is_locked = TRUE,
            account_locked_until = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE),
            lock_reason = 'Too many failed login attempts'
        WHERE id = user_id_val 
          AND failed_login_attempts >= 5;
    END IF;
END//

-- 3. Procedure để reset failed attempts khi login thành công
CREATE PROCEDURE reset_failed_attempts(IN p_user_id CHAR(36))
BEGIN
    UPDATE users 
    SET failed_login_attempts = 0,
        is_locked = FALSE,
        account_locked_until = NULL,
        lock_reason = NULL,
        last_login_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;
END//

-- 4. Procedure để tạo audit log
CREATE PROCEDURE create_audit_log(
    IN p_user_id CHAR(36),
    IN p_event_type VARCHAR(50),
    IN p_entity_type VARCHAR(50),
    IN p_entity_id VARCHAR(100),
    IN p_description TEXT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO audit_logs (
        id, user_id, event_type, entity_type, entity_id,
        description, ip_address, user_agent, created_at
    ) VALUES (
        UUID(), p_user_id, p_event_type, p_entity_type, p_entity_id,
        p_description, p_ip_address, p_user_agent, CURRENT_TIMESTAMP
    );
END//

DELIMITER ;

-- 5. Views
CREATE VIEW vw_user_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.department,
    u.job_title,
    u.is_active,
    r.name AS primary_role,
    r.level AS role_level,
    t.name AS team_name,
    COUNT(DISTINCT ur.role_id) AS total_roles,
    MAX(r.level) AS highest_role_level
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN teams t ON u.primary_team_id = t.id
GROUP BY u.id, r.name, r.level, t.name;

CREATE VIEW vw_security_dashboard AS
SELECT 
    DATE(created_at) AS event_date,
    event_type,
    severity,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT ip_address) AS unique_ips
FROM security_events
WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(created_at), event_type, severity;

CREATE VIEW vw_file_usage AS
SELECT 
    u.username,
    u.department,
    COUNT(f.id) AS file_count,
    SUM(f.size_bytes) AS total_size_bytes,
    ROUND(SUM(f.size_bytes) / 1024 / 1024, 2) AS total_size_mb,
    COUNT(DISTINCT f.folder_id) AS folder_count,
    MAX(f.created_at) AS last_upload
FROM users u
LEFT JOIN files f ON u.id = f.owner_id AND f.deleted_at IS NULL
GROUP BY u.id, u.username, u.department;
SQL6
echo "Triggers and procedures created"

# Bước 8: Chèn dữ liệu mẫu
echo ""
echo "STEP 8: Seeding data..."
mysql -u root -ppassword cybersecure_db << 'SQL7'
-- Insert default roles
INSERT INTO roles (id, name, level, description, is_system_role, security_level_required) VALUES
(UUID(), 'System Admin', 100, 'Full system administrator with all privileges', TRUE, 5),
(UUID(), 'Security Admin', 90, 'Security administrator with security privileges', TRUE, 5),
(UUID(), 'Department Manager', 60, 'Department level manager', TRUE, 4),
(UUID(), 'Team Manager', 50, 'Team level manager', TRUE, 3),
(UUID(), 'Senior Staff', 20, 'Senior staff member', TRUE, 2),
(UUID(), 'Staff', 10, 'Regular staff member', TRUE, 2),
(UUID(), 'Guest', 1, 'Limited access guest', TRUE, 1);

-- Lưu role IDs
SET @admin_role_id = (SELECT id FROM roles WHERE name = 'System Admin' LIMIT 1);
SET @manager_role_id = (SELECT id FROM roles WHERE name = 'Team Manager' LIMIT 1);
SET @user_role_id = (SELECT id FROM roles WHERE name = 'Staff' LIMIT 1);

-- Insert default permissions
INSERT INTO permissions (id, resource, action, description, min_role_level, min_security_level, requires_mfa) VALUES
-- System permissions
(UUID(), 'system', 'configure', 'Configure system settings', 100, 5, TRUE),
(UUID(), 'system', 'monitor', 'Monitor system health and logs', 90, 4, TRUE),

-- User management
(UUID(), 'user', 'create', 'Create new users', 60, 3, TRUE),
(UUID(), 'user', 'read', 'View user profiles', 10, 2, FALSE),
(UUID(), 'user', 'update', 'Update user information', 50, 3, TRUE),
(UUID(), 'user', 'delete', 'Delete users', 90, 4, TRUE),

-- Team management
(UUID(), 'team', 'create', 'Create teams', 50, 3, FALSE),
(UUID(), 'team', 'manage', 'Manage team members', 50, 3, FALSE),

-- File management
(UUID(), 'file', 'upload', 'Upload files', 10, 2, FALSE),
(UUID(), 'file', 'download', 'Download files', 10, 2, FALSE),
(UUID(), 'file', 'share', 'Share files with others', 20, 2, TRUE),

-- Message permissions
(UUID(), 'message', 'send', 'Send messages', 10, 2, FALSE),
(UUID(), 'message', 'read', 'Read messages', 10, 2, FALSE),

-- Project management
(UUID(), 'project', 'create', 'Create projects', 50, 3, FALSE),
(UUID(), 'project', 'manage', 'Manage projects', 50, 3, FALSE);

-- Insert default admin user (password: Admin@123456)
INSERT INTO users (
    id, username, email, password_hash, 
    first_name, last_name, 
    is_active, is_email_verified, mfa_required,
    security_clearance_level
) VALUES (
    UUID(),
    'admin',
    'admin@cybersecure.local',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- bcrypt hash của "Admin@123456"
    'System',
    'Administrator',
    TRUE,
    TRUE,
    TRUE,
    5
);

-- Lưu admin user ID
SET @admin_user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- Assign admin role to admin user
INSERT INTO user_roles (id, user_id, role_id, assigned_by) VALUES
(UUID(), @admin_user_id, @admin_role_id, @admin_user_id);

-- Insert default security policies
INSERT INTO security_policies (id, policy_type, name, description, config, is_active, applies_to, created_by) VALUES
-- Password policy
(UUID(), 'password', 'Default Password Policy', 'Default password requirements for all users',
 JSON_OBJECT(
    'min_length', 12,
    'require_uppercase', TRUE,
    'require_lowercase', TRUE,
    'require_numbers', TRUE,
    'require_special_chars', TRUE,
    'max_age_days', 90,
    'prevent_reuse', 5,
    'lockout_attempts', 5,
    'lockout_minutes', 30
 ), TRUE, 'all', @admin_user_id),

-- Session policy
(UUID(), 'session', 'Default Session Policy', 'Default session management policy',
 JSON_OBJECT(
    'session_timeout_minutes', 30,
    'max_concurrent_sessions', 3,
    'invalidate_on_password_change', TRUE,
    'require_mfa_for_new_device', TRUE
 ), TRUE, 'all', @admin_user_id),

-- MFA policy
(UUID(), 'mfa', 'MFA Enforcement Policy', 'MFA requirements for different roles',
 JSON_OBJECT(
    'admin_roles_require_mfa', TRUE,
    'manager_roles_require_mfa', TRUE,
    'sensitive_operations_require_mfa', TRUE,
    'new_device_requires_mfa', TRUE
 ), TRUE, 'all', @admin_user_id),

-- Encryption policy
(UUID(), 'encryption', 'Data Encryption Policy', 'Encryption requirements for data at rest and in transit',
 JSON_OBJECT(
    'encrypt_files_at_rest', TRUE,
    'encrypt_messages', TRUE,
    'key_rotation_days', 90,
    'minimum_encryption_strength', 'AES-256'
 ), TRUE, 'all', @admin_user_id);

-- Insert default team (IT Department)
INSERT INTO teams (id, name, code, description, manager_id, default_security_level) VALUES
(UUID(), 'IT Department', 'IT-001', 'Information Technology Department', @admin_user_id, 3);

-- Lưu team ID
SET @it_team_id = (SELECT id FROM teams WHERE code = 'IT-001' LIMIT 1);

-- Update admin user's primary team
UPDATE users SET primary_team_id = @it_team_id WHERE id = @admin_user_id;

-- Add admin to IT team
INSERT INTO team_members (id, team_id, user_id, role_in_team, security_clearance, added_by) VALUES
(UUID(), @it_team_id, @admin_user_id, 'admin', 5, @admin_user_id);

-- Insert manager profile for admin
INSERT INTO manager_profiles (id, user_id, manager_level, max_team_size, can_hire, can_fire, can_approve_security, budget_authority) VALUES
(UUID(), @admin_user_id, 'department_head', 50, TRUE, TRUE, TRUE, 1000000.00);

-- Insert sample project
INSERT INTO projects (id, name, description, team_id, manager_id, security_level, status, start_date, end_date) VALUES
(UUID(), 'Cybersecurity Awareness Training', 'Quarterly cybersecurity training for all employees', 
 @it_team_id, @admin_user_id, 3, 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY));

-- Insert sample task
SET @project_id = (SELECT id FROM projects WHERE name = 'Cybersecurity Awareness Training' LIMIT 1);
INSERT INTO tasks (id, project_id, title, description, assignee_id, reporter_id, status, due_date) VALUES
(UUID(), @project_id, 'Prepare training materials', 'Create presentation slides and documentation', 
 @admin_user_id, @admin_user_id, 'in_progress', DATE_ADD(CURDATE(), INTERVAL 7 DAY));

SELECT '✅ Seed data inserted successfully!' as message;
SQL7

# Bước 9: Thêm cột security (sử dụng file đã sửa)
echo ""
echo "🛡️ STEP 9: Adding security columns..."
mysql -u root -ppassword cybersecure_db < add_security_columns_fixed.sql 2>/dev/null

echo ""
echo "==========================================="
echo "🎉 DATABASE SETUP COMPLETED!"
echo "==========================================="

# Kiểm tra cuối cùng
echo ""
echo "FINAL VERIFICATION:"
mysql -u root -ppassword cybersecure_db -e "
SELECT 'Database:' as status, 'cybersecure_db' as name;
SELECT 'Tables:' as status, COUNT(*) as count FROM information_schema.tables WHERE table_schema='cybersecure_db';
SELECT 'Users:' as status, COUNT(*) as count FROM users;
SELECT 'Roles:' as status, COUNT(*) as count FROM roles;
SELECT 'Permissions:' as status, COUNT(*) as count FROM permissions;
SELECT '';
SELECT 'Admin User:' as user, 'admin' as username, 'Admin@123456' as password;
SELECT 'Email:' as info, 'admin@cybersecure.local' as email;
SELECT 'Security Level:' as info, '5 (Highest)' as level;
"
