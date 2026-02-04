-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: cybersecure_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `access_requests`
--

DROP TABLE IF EXISTS `access_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_permission` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_data` json DEFAULT NULL,
  `risk_score` int DEFAULT '0',
  `risk_factors` json DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `approver_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approval_notes` text COLLATE utf8mb4_unicode_ci,
  `business_justification` text COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int DEFAULT NULL,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `accessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_access_status` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'APPROVED',_utf8mb4'DENIED',_utf8mb4'EXPIRED',_utf8mb4'REVOKED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_requests`
--

LOCK TABLES `access_requests` WRITE;
/*!40000 ALTER TABLE `access_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `access_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_data` json DEFAULT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `changes` json DEFAULT NULL,
  `severity` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'INFO',
  `risk_score` int DEFAULT NULL,
  `security_context` json DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_audit_severity` CHECK ((`severity` in (_utf8mb4'DEBUG',_utf8mb4'INFO',_utf8mb4'WARN',_utf8mb4'ERROR',_utf8mb4'CRITICAL')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('026e40d5-1431-47db-9d1c-e275fb0a2a5b','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-31 20:15:25'),('034b20af-2bcb-4485-bddc-36efeab2413b','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 19:11:35'),('03f68198-184f-4440-9d85-2657dff609a1','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 16:53:55'),('0662725f-2192-4dd4-b00e-cb842f13422d','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 19:19:37'),('07711c4b-1225-4737-8a06-6922536a1061','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-01-30 19:01:40'),('0f5e0d84-a435-4984-91ff-eea85d70e926','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}','2026-01-30 21:05:38'),('120ea064-977b-42f9-bb6c-614466bee3c5','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'USER_UPDATED','User','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,'{\"email\": \"nguyen.van.a@company.com\", \"phone\": \"+84123456789\", \"jobTitle\": \"Software Engineer\", \"lastName\": \"Văn A\", \"firstName\": \"Nguyễn\", \"department\": \"IT\", \"employeeId\": \"EMP00123\", \"totpSecret\": \"MVGU36Q4DCSQDMIIYTQCHT7TCEWXML66\", \"mfaRequired\": true, \"securityClearanceLevel\": 1}',NULL,'INFO',NULL,NULL,'User identity modified: nguyenvana',NULL,'2026-01-30 16:47:36'),('13954996-143e-4bc3-96ec-ce92e307f17e','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 19:21:46'),('142d0a8f-fc85-11f0-b5ef-d2677b92d0a4',NULL,NULL,NULL,NULL,NULL,'USER_LOGIN','USER',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Admin logged in successfully',NULL,'2026-01-28 19:58:14'),('142d0eb3-fc85-11f0-b5ef-d2677b92d0a4',NULL,NULL,NULL,NULL,NULL,'DOCUMENT_CREATE','DOCUMENT',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'New security protocol created',NULL,'2026-01-28 19:38:14'),('142d1112-fc85-11f0-b5ef-d2677b92d0a4',NULL,NULL,NULL,NULL,NULL,'USER_UPDATE','USER',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Profile updated for user nguyen-van-a',NULL,'2026-01-28 18:08:14'),('142d1201-fc85-11f0-b5ef-d2677b92d0a4',NULL,NULL,NULL,NULL,NULL,'ROLE_ASSIGN','ROLE',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Security Admin role assigned to user-xxx',NULL,'2026-01-27 20:08:14'),('176e9359-441e-49c3-80bb-c865e1ec249f','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 10:50:35'),('1794a659-eba5-40d1-b0aa-ccb2c371be7c','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:52:19'),('19980183-3030-4ed6-880e-bd0c4894b468',NULL,NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login attempt failed: User not found (admin@sebersecure.local)','{}','2026-02-03 01:48:39'),('1c92cc4e-0c0c-440e-85dc-d84e719095da','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-02-03 01:38:36'),('1d1b6487-b763-45b1-a2a1-09d011553ac0','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 19:20:09'),('1f07e1e3-739f-499c-9f9d-30d769aed03f','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}','2026-02-03 01:42:15'),('249198cc-51ac-4beb-923d-60af93a0d438','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 15:56:10'),('275410e8-fde4-4f5e-9fa4-c75258c8debd',NULL,NULL,NULL,NULL,NULL,'USER_STATUS_CHANGED','User','58d7d64d-bec7-4073-9496-ebfe55f7133d','{\"status\": \"active\"}','{\"status\": \"banned\"}',NULL,'INFO',NULL,NULL,'User status transitioned from active to banned: vanb',NULL,'2026-02-03 01:49:55'),('2938d609-b26e-4088-ba41-a2d09eb9f99d','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 21:42:00'),('29d31e5d-d611-445a-88c8-64909aa77d97','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 19:02:13'),('2c3c59a8-706a-4ea5-97e4-f13db57a306a','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:31:52'),('2dfb9c30-1791-4a4f-afcc-2089eb1eb167','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:50:18'),('2ee7a3b4-3f71-4bab-a052-37991b7264a4','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 19:00:51'),('2f8c255d-2694-429b-9424-bfeed249e89c','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 16:46:14'),('32b7002b-ae0b-4d80-b10e-68abb34dd8c1','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}','2026-02-03 01:40:10'),('33d1d2ea-7a4a-4219-9a3d-83f8a44d5f25','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification failed for user: nguyen.van.a@company.com','{}','2026-01-30 21:40:42'),('33e32e88-955c-4942-9342-d1759cb86d49','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 15:54:18'),('39097ba2-4288-4473-93aa-038e5056f5c6','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}','2026-01-31 18:02:06'),('39a040bc-cf8b-4a9b-a792-fb52b4a73820','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}','2026-01-30 21:52:29'),('3d07269c-16da-4539-8a80-332bc0202105','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-31 18:01:51'),('3e10cdff-96f5-4bf6-9a52-e8e0c0168589','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 19:02:00'),('3fd1f570-2684-4492-b9a5-68c7a8da6384','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 21:07:52'),('43056419-98ca-4d89-9c38-907f964b09be','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}','2026-01-30 21:52:52'),('4bc3d08b-5a61-4880-8bbd-30b84c466dad',NULL,NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@commpany.com)','{}','2026-01-30 21:06:30'),('4f56116b-f7fc-48ea-9cee-0d9053571039',NULL,NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@company.con)','{}','2026-01-30 17:57:38'),('5119c8d2-6192-4dca-b848-32e0d046a472',NULL,NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login attempt failed: User not found (admin@sybersecure.local)','{}','2026-02-03 01:48:58'),('56619aa9-df45-4e99-91bf-f0f6aed18437','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}','2026-01-30 21:53:11'),('5cffba0f-d7b2-4ff7-9781-84486700186f','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:50:17'),('6123a779-7c36-4440-a2f4-5f5e33049af0','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:41:52'),('61485e53-8f58-44a2-b9cf-282c5d141ea7','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 18:59:10'),('67196a3d-64df-4129-b25d-00d902ecea8c',NULL,NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@commpany.com)','{}','2026-01-30 21:06:28'),('6a17b69e-0c82-4528-96e9-1751b64f00a4','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-02-03 01:51:38'),('6fa5fa20-d923-42d2-b4b0-1dd99fb242f1',NULL,NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@company.con)','{}','2026-01-30 17:58:02'),('7229106d-f135-48c8-8b55-c45436439251','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}','2026-01-30 21:52:37'),('75665a02-f6dc-43c6-8643-157a3d605db0','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 17:58:28'),('75b42ef6-ae79-4365-9d6e-e64f62b44d85','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 17:56:46'),('7723af64-ef0b-465b-85b9-ba551c2f8cf5','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-02-03 01:38:51'),('7ad568d5-3bd5-4150-997c-3db27c5edf9d','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 20:11:58'),('7bc7ca32-9a0c-46b2-b057-c80dbbdd9504','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:40:28'),('84faa355-acf6-4574-89f1-68e59b195d9b','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:50:30'),('87eca516-cacf-427a-8e39-b7a60dc39bab','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-31 17:26:21'),('8815c614-db01-4198-8af1-1669fa17f106','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 18:31:39'),('88324868-f3c6-4e6f-9b53-d1e5ab0ed168','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:07:42'),('895ecdc2-0d52-423c-9b40-d8fa72dbd09f','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-01-30 19:01:50'),('8a7072c0-560c-4876-8071-803cb737a730','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 09:59:33'),('9239dd22-23e7-4581-b265-a1b0f2d89283','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}','2026-01-30 21:32:22'),('940f0cc2-6099-45a6-a1b0-5927768ca4af','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:48:31'),('964801c0-345d-4f80-a14b-2b15faab3ad2','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-02-03 01:51:09'),('989bc2c2-c7b6-4d8e-ae1d-c1a9f9da0208','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 20:59:43'),('9b8ef36a-d0aa-4739-8f7b-fd3fc6d8fe3a','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:51:13'),('a5b2726d-8eab-4b21-b149-7d17db15366b','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:50:40'),('b051181c-34be-4142-9e80-73c18478f192','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 21:54:13'),('bcb5288a-8551-4c07-8d31-8b3ae585f6c3','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 21:40:53'),('bee45f0e-7812-42e8-af1f-68f924bfa873','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 18:03:40'),('c0b66caa-c142-47a6-9622-d236dedd5bb6','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-31 18:02:13'),('c16a05c5-ea45-4669-8ca0-f6c8e45f339e','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}','2026-02-03 01:51:34'),('c1b622de-14ad-485a-a10b-c5181581c675','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 19:00:40'),('c217dba1-2da5-490e-ac6d-b48bf2dbe4f0','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_VERIFY_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}','2026-01-30 21:32:04'),('c36cb57f-ef26-420c-88dc-121739b364ef','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 17:58:07'),('c3e7cd9a-1beb-4b70-a82b-fc16ce36045f','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 19:10:44'),('c461967d-cd8a-49e5-a607-0cacbfb775f6','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 19:20:20'),('c6a2b433-f2aa-4282-bdd8-7518ff14a1c4','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-02-03 01:43:20'),('c91bdd56-6825-4244-9dcd-2dbf1457ecb8','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 20:12:09'),('c964b9b6-3a69-4e5a-8220-9680d7f88041',NULL,NULL,NULL,NULL,NULL,'USER_STATUS_CHANGED','User','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','{\"status\": \"active\"}','{\"status\": \"banned\"}',NULL,'INFO',NULL,NULL,'User status transitioned from active to banned: nguyenvana',NULL,'2026-01-30 19:01:08'),('c99a2b73-7298-493b-bec8-6bb3c7c85b9e','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}','2026-01-31 18:01:55'),('cb5c1cf1-de12-41cb-8c7f-2e767daf55bc','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:54:00'),('cb61b3ad-39b9-429b-ac3e-e6694d2056d8','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}','2026-01-30 21:05:29'),('cb8ff3c8-f112-4339-8cc2-25e0be2503b7','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification failed for user: nguyen.van.a@company.com','{}','2026-01-30 21:40:46'),('cd112918-0944-4a94-b0e1-22402190916d','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 16:54:09'),('d4ddf297-29bd-4851-aece-9492fc92669c','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 19:21:33'),('e080f2b7-fbdb-4360-9bc5-f53916592d6d','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 19:11:47'),('e1fb7c9e-c40e-4bb6-964e-12cd02a7fb31',NULL,NULL,NULL,NULL,NULL,'USER_CREATED','User','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,'{\"role\": [\"User\"], \"email\": \"nguyen.van.b@company.com\", \"username\": \"vanb\"}',NULL,'INFO',NULL,NULL,'New user identity created: vanb',NULL,'2026-01-30 21:04:09'),('e26e6c19-4aba-4805-a4c6-33595a741c35','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-30 21:48:40'),('e2c081da-af0a-4f86-a87f-ebc81c4363f2','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}','2026-02-03 01:39:55'),('e4c02c19-3f7b-4ecf-b308-d066c760d174',NULL,NULL,NULL,NULL,NULL,'USER_STATUS_CHANGED','User','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','{\"status\": \"banned\"}','{\"status\": \"active\"}',NULL,'INFO',NULL,NULL,'User status transitioned from banned to active: nguyenvana',NULL,'2026-01-30 19:01:58'),('eae3b27b-ce8d-48e9-8066-c43a323f1e3e','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:50:18'),('ec7db1e9-362a-4300-91f5-d4bc627d14db','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_STEP_REQUIRED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}','2026-01-30 18:31:28'),('ee35848d-a4de-4c99-a2b7-97b5f88ed79d','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:50:16'),('ef41768e-3f67-4a10-b02c-b332d70d8fe3',NULL,NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@company.con)','{}','2026-01-30 17:57:58'),('f3476500-24c4-4179-941c-175364df5ab2','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-01-30 21:31:02'),('f58a830c-e3dc-476c-aff1-7dd88384dd33','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'USER_UPDATED','User','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,'{\"email\": \"nguyen.van.a@company.com\", \"phone\": \"+84123456789\", \"jobTitle\": \"Software Engineer\", \"lastName\": \"Văn A\", \"firstName\": \"Nguyễn\", \"department\": \"IT\", \"employeeId\": \"EMP00123\", \"totpSecret\": \"MVGU36Q4DCSQDMIIYTQCHT7TCEWXML66\", \"mfaRequired\": true, \"securityClearanceLevel\": 1}',NULL,'INFO',NULL,NULL,'User identity modified: nguyenvana',NULL,'2026-01-30 16:47:31'),('f591a7ed-b078-4b35-8064-83679eaaf338','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,NULL,'MFA_VERIFY_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}','2026-01-31 17:26:38'),('f94fe852-0f28-4ccf-b91f-b507b11c686b','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,NULL,'LOGIN_BLOCKED','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Login blocked: User status is banned','{}','2026-02-03 01:50:31'),('fdcb3bc6-c7b8-41ed-b450-cd4cb3cf59a3','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_SUCCESS','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}','2026-02-03 01:49:30'),('ff000385-4f6a-4f9b-b6e9-2951cf2faeb4','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,NULL,'LOGIN_FAILURE','SecuritySystem',NULL,NULL,NULL,NULL,'INFO',NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}','2026-01-30 09:34:14');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_members`
--

DROP TABLE IF EXISTS `conversation_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_members` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `conversation_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `encryption_key_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_muted` tinyint(1) DEFAULT '0',
  `is_pinned` tinyint(1) DEFAULT '0',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_member_role` CHECK ((`role` in (_utf8mb4'admin',_utf8mb4'moderator',_utf8mb4'member')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_members`
--

LOCK TABLES `conversation_members` WRITE;
/*!40000 ALTER TABLE `conversation_members` DISABLE KEYS */;
INSERT INTO `conversation_members` VALUES ('15be90e0-6b79-44e6-8bac-65aefc70531e','9426a453-933d-49a6-82cf-c5d2accce685','58d7d64d-bec7-4073-9496-ebfe55f7133d','member',NULL,0,0,'2026-02-03 01:40:22',NULL,'2026-02-03 01:40:22','2026-02-03 01:49:53'),('1bbcc6d8-754a-4786-af64-41f15c4af558','dbcb01d3-cacd-4a71-8690-09145cbff84f','7c0b04c5-fd38-11f0-855c-62043121f87a','member',NULL,0,0,'2026-01-30 21:44:02',NULL,'2026-01-30 21:44:02','2026-01-31 19:04:02'),('4dc2010a-70ae-4e2f-9948-7628fcc8d8e1','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','member',NULL,0,0,'2026-01-30 21:05:51','2026-01-31 19:45:20','2026-01-30 21:05:51','2026-01-31 19:45:17'),('5f6e8dfd-70b9-44f8-aeb7-e8fd3fd1e01a','dbcb01d3-cacd-4a71-8690-09145cbff84f','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','member',NULL,0,0,'2026-01-30 21:44:02',NULL,'2026-01-30 21:44:02','2026-02-03 01:42:51'),('97e1029d-1dec-47f4-91b1-05ec44cf54eb','9426a453-933d-49a6-82cf-c5d2accce685','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','member',NULL,0,0,'2026-02-03 01:40:22',NULL,'2026-02-03 01:40:22','2026-02-03 01:48:13'),('d0be07e3-8404-4de2-a565-ce951b57a500','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','member',NULL,0,0,'2026-01-30 21:05:51',NULL,'2026-01-30 21:05:51','2026-02-03 01:42:56');
/*!40000 ALTER TABLE `conversation_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversation_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'direct',
  `team_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT '1',
  `encryption_required` tinyint(1) DEFAULT '1',
  `default_encryption_key_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_conversation_type` CHECK ((`conversation_type` in (_utf8mb4'direct',_utf8mb4'group',_utf8mb4'channel')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('698a3610-a7ea-4272-bf94-83c48307bfdb',NULL,NULL,'direct',NULL,1,1,NULL,'58d7d64d-bec7-4073-9496-ebfe55f7133d','2026-01-31 19:44:18','2026-01-30 21:05:51','2026-01-31 19:44:18',0),('9426a453-933d-49a6-82cf-c5d2accce685',NULL,NULL,'direct',NULL,1,1,NULL,'55cbbda7-c2a5-4347-ab79-cd4eec1206ba','2026-02-03 01:44:09','2026-02-03 01:40:22','2026-02-03 01:44:09',0),('dbcb01d3-cacd-4a71-8690-09145cbff84f',NULL,NULL,'direct',NULL,1,1,NULL,'55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,'2026-01-30 21:44:02','2026-01-30 21:44:02',0);
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encryption_keys`
--

DROP TABLE IF EXISTS `encryption_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encryption_keys` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `key_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `encrypted_key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `key_algorithm` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'AES-256-GCM',
  `key_version` int DEFAULT '1',
  `key_owner_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `key_scope` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_date` date DEFAULT (curdate()),
  `rotation_date` date DEFAULT NULL,
  `next_rotation_date` date DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_key_type` CHECK ((`key_type` in (_utf8mb4'file',_utf8mb4'message',_utf8mb4'user',_utf8mb4'team',_utf8mb4'system')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encryption_keys`
--

LOCK TABLES `encryption_keys` WRITE;
/*!40000 ALTER TABLE `encryption_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `encryption_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_login_attempts`
--

DROP TABLE IF EXISTS `failed_login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_login_attempts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `attempt_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_successful` tinyint(1) DEFAULT '0',
  `is_suspicious` tinyint(1) DEFAULT '0',
  `suspicious_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blocked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_login_attempts`
--

LOCK TABLES `failed_login_attempts` WRITE;
/*!40000 ALTER TABLE `failed_login_attempts` DISABLE KEYS */;
INSERT INTO `failed_login_attempts` VALUES ('142c567c-fc85-11f0-b5ef-d2677b92d0a4',NULL,'admin','192.168.1.5',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-28 19:08:14'),('142c59b6-fc85-11f0-b5ef-d2677b92d0a4',NULL,'admin','192.168.1.5',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-28 18:58:14'),('142c5b9c-fc85-11f0-b5ef-d2677b92d0a4',NULL,'admin','192.168.1.5',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-28 18:48:14'),('142c6368-fc85-11f0-b5ef-d2677b92d0a4',NULL,'root','45.2.3.4',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-27 20:08:14'),('142c666d-fc85-11f0-b5ef-d2677b92d0a4',NULL,'root','45.2.3.4',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-27 20:08:14'),('142c67f1-fc85-11f0-b5ef-d2677b92d0a4',NULL,'user1','10.0.0.5',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-26 20:08:14'),('142c6b50-fc85-11f0-b5ef-d2677b92d0a4',NULL,'user1','10.0.0.5',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-26 20:08:14'),('142c6ddc-fc85-11f0-b5ef-d2677b92d0a4',NULL,'admin','99.88.77.66',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-24 20:08:14'),('142c6fcc-fc85-11f0-b5ef-d2677b92d0a4',NULL,'unauthorized','123.123.123.123',NULL,'2026-01-28 20:08:14',0,0,NULL,NULL,'2026-01-23 20:08:14');
/*!40000 ALTER TABLE `failed_login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_integrity_logs`
--

DROP TABLE IF EXISTS `file_integrity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_integrity_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `file_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_verified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verification_result` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'VALID',
  `tampering_detected_at` timestamp NULL DEFAULT NULL,
  `tampering_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tampering_details` json DEFAULT NULL,
  `reported_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reported_at` timestamp NULL DEFAULT NULL,
  `action_taken` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_verification_result` CHECK ((`verification_result` in (_utf8mb4'VALID',_utf8mb4'TAMPERED',_utf8mb4'ERROR',_utf8mb4'PENDING')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_integrity_logs`
--

LOCK TABLES `file_integrity_logs` WRITE;
/*!40000 ALTER TABLE `file_integrity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `file_integrity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_shares`
--

DROP TABLE IF EXISTS `file_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_shares` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `file_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shared_with_type` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shared_with_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'view',
  `encryption_key_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `share_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `expires_at` timestamp NULL DEFAULT NULL,
  `download_limit` int DEFAULT NULL,
  `watermark_enabled` tinyint(1) DEFAULT '0',
  `shared_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shared_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_permission_level` CHECK ((`permission_level` in (_utf8mb4'view',_utf8mb4'download',_utf8mb4'edit',_utf8mb4'manage'))),
  CONSTRAINT `chk_shared_with_type` CHECK ((`shared_with_type` in (_utf8mb4'user',_utf8mb4'team',_utf8mb4'group')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_shares`
--

LOCK TABLES `file_shares` WRITE;
/*!40000 ALTER TABLE `file_shares` DISABLE KEYS */;
/*!40000 ALTER TABLE `file_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_versions`
--

DROP TABLE IF EXISTS `file_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_versions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `file_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_number` int NOT NULL,
  `storage_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` bigint NOT NULL,
  `file_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `encryption_key_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changes_description` text COLLATE utf8mb4_unicode_ci,
  `changed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_versions`
--

LOCK TABLES `file_versions` WRITE;
/*!40000 ALTER TABLE `file_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `file_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `extension` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_bytes` bigint NOT NULL,
  `storage_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `encrypted_storage_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage_provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'local',
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash_algorithm` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'SHA-256',
  `encryption_key_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_encrypted` tinyint(1) DEFAULT '1',
  `last_hash_verification` timestamp NULL DEFAULT NULL,
  `virus_scan_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `virus_scan_result` json DEFAULT NULL,
  `scanned_at` timestamp NULL DEFAULT NULL,
  `owner_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `folder_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '0',
  `approval_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approval_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_at` timestamp NULL DEFAULT NULL,
  `version_number` int DEFAULT '1',
  `is_latest_version` tinyint(1) DEFAULT '1',
  `share_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT (json_object()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_approval_status` CHECK ((`approval_status` in (_utf8mb4'pending',_utf8mb4'approved',_utf8mb4'rejected'))),
  CONSTRAINT `chk_file_size` CHECK ((`size_bytes` >= 0)),
  CONSTRAINT `chk_virus_status` CHECK ((`virus_scan_status` in (_utf8mb4'pending',_utf8mb4'scanning',_utf8mb4'clean',_utf8mb4'infected',_utf8mb4'error')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES ('422e8ca0-50da-4dfc-a5bd-0dfa4e5b5c89','deepseek_mermaid_20260110_8e8bff.png','deepseek_mermaid_20260110_8e8bff.png',NULL,'image/png',795857,'uploads/1769813018394-deepseek_mermaid_20260110_8e8bff.png.enc',NULL,'local','369101c568d2f8cadba13788db2039faf7d819f1131857f962939cf95f7de97c','369101c568d2f8cadba13788db2039faf7d819f1131857f962939cf95f7de97c','SHA-256','3eB2VOFVyMVjBvYrZlnt4DIeTY73KfkuG1rraCA02kI=',1,NULL,'pending',NULL,NULL,'55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,0,0,'pending',NULL,NULL,1,1,NULL,'{\"iv\": \"rxNFiI/49unmi1MheTWEhQ==\", \"tag\": \"tTC+9w/1ssPP+qgAUnv/og==\", \"contentEncoding\": \"aes-256-gcm\"}','2026-01-30 22:43:38','2026-01-30 22:43:38',NULL),('6bb364cf-d557-4338-a00c-c6ca9e20984b','deepseek_mermaid_20260110_054f37.png','deepseek_mermaid_20260110_054f37.png',NULL,'image/png',509158,'uploads/1769814495134-deepseek_mermaid_20260110_054f37.png.enc',NULL,'local','8f205e1ed2df079dfc99cf172cfcffc5a7696edd6f6c7a7c3b7d4e15e6b98e19','8f205e1ed2df079dfc99cf172cfcffc5a7696edd6f6c7a7c3b7d4e15e6b98e19','SHA-256','n7WfJXKwf2hclyIBjVDKCqcJv6aM1ofvc+l1fvYDVUE=',1,NULL,'pending',NULL,NULL,'55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,0,0,'pending',NULL,NULL,1,1,NULL,'{\"iv\": \"BsXnQwRMSIsPtwLUkTaRhw==\", \"tag\": \"iNsrMq0cQEuvtc9IR6LSHw==\", \"contentEncoding\": \"aes-256-gcm\"}','2026-01-30 23:08:15','2026-01-30 23:08:15',NULL),('759d415b-906a-4fc5-bfc2-67ac6d696c65','photo_1769882577144.jpg','photo_1769882577144.jpg',NULL,'image/jpeg',4,'uploads/1769882577224-photo_1769882577144.jpg.enc',NULL,'local','74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b','74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b','SHA-256','y9Av5EnzS96cVmHWS3G4qg4yVMdz64ndHO+2h/xIt0o=',1,NULL,'pending',NULL,NULL,'58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,0,0,'pending',NULL,NULL,1,1,NULL,'{\"iv\": \"oX0/LTqlg+8L4aoJ7IL7yg==\", \"tag\": \"5kubldTljn3aBmTdLmwC/A==\", \"contentEncoding\": \"aes-256-gcm\"}','2026-01-31 18:02:57','2026-01-31 18:02:57',NULL),('e546b381-a3e0-4335-a402-fde379d2d1cf','tailieu.docx','tailieu.docx',NULL,'application/vnd.openxmlformats-officedocument.wordprocessingml.document',15956,'uploads/1770082854707-tailieu.docx.enc',NULL,'local','59d2482b1b8768600bec392000dad63c2399653802c1a512d559ffdd0b236dc1','59d2482b1b8768600bec392000dad63c2399653802c1a512d559ffdd0b236dc1','SHA-256','KWKGFPd/evq3Vup2mi1ydSS+Y8f9bKnM2ev4K6jOWKo=',1,NULL,'pending',NULL,NULL,'58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,0,0,'pending',NULL,NULL,1,1,NULL,'{\"iv\": \"STJtSH7fG1qTmcTsSpb4dA==\", \"tag\": \"6HlH4iggp7ySU/eRyrfWaQ==\", \"contentEncoding\": \"aes-256-gcm\"}','2026-02-03 01:40:54','2026-02-03 01:40:54',NULL);
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `folders`
--

DROP TABLE IF EXISTS `folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folders` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_folder_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `access_level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'private',
  `encryption_required` tinyint(1) DEFAULT '1',
  `default_encryption_key_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_access_level` CHECK ((`access_level` in (_utf8mb4'private',_utf8mb4'team',_utf8mb4'department',_utf8mb4'public')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folders`
--

LOCK TABLES `folders` WRITE;
/*!40000 ALTER TABLE `folders` DISABLE KEYS */;
/*!40000 ALTER TABLE `folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manager_profiles`
--

DROP TABLE IF EXISTS `manager_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_profiles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manager_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_team_size` int DEFAULT '20',
  `can_hire` tinyint(1) DEFAULT '0',
  `can_fire` tinyint(1) DEFAULT '0',
  `can_approve_security` tinyint(1) DEFAULT '0',
  `budget_authority` decimal(15,2) DEFAULT NULL,
  `reporting_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `management_start_date` date DEFAULT (curdate()),
  `management_end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_profiles`
--

LOCK TABLES `manager_profiles` WRITE;
/*!40000 ALTER TABLE `manager_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `manager_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_reactions`
--

DROP TABLE IF EXISTS `message_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_reactions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emoji` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `message_id` (`message_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `message_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_reactions`
--

LOCK TABLES `message_reactions` WRITE;
/*!40000 ALTER TABLE `message_reactions` DISABLE KEYS */;
INSERT INTO `message_reactions` VALUES ('1f2febf7-71a5-43a6-844a-f5fd91342f91','ee20c214-1cbd-403e-9324-5311a247bdf4','58d7d64d-bec7-4073-9496-ebfe55f7133d','😂','2026-01-31 18:53:50'),('72f1cbf7-4293-44ee-9a96-6469453179df','69810308-4527-490d-a7f7-df2f391c40c8','58d7d64d-bec7-4073-9496-ebfe55f7133d','😂','2026-01-31 18:26:42');
/*!40000 ALTER TABLE `message_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_read_receipts`
--

DROP TABLE IF EXISTS `message_read_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_read_receipts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `message_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_with_device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_read_receipts`
--

LOCK TABLES `message_read_receipts` WRITE;
/*!40000 ALTER TABLE `message_read_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `message_read_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `conversation_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `encrypted_content` text COLLATE utf8mb4_unicode_ci,
  `message_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `is_encrypted` tinyint(1) DEFAULT '1',
  `encryption_key_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `encryption_algorithm` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'AES-256-GCM',
  `initialization_vector` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_message_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `delete_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `auth_tag` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_message_type` CHECK ((`message_type` in (_utf8mb4'text',_utf8mb4'image',_utf8mb4'file',_utf8mb4'system',_utf8mb4'audio',_utf8mb4'video',_utf8mb4'call_init',_utf8mb4'call_accept',_utf8mb4'call_end',_utf8mb4'location')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('02c15549-098a-4237-b3aa-a95fa90108e1','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 19:00:32','2026-01-31 19:00:32',NULL),('03e66d70-b6ba-4741-8bc5-4b9241353add','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:52:07','2026-01-31 18:52:07',NULL),('044a5a5b-1825-4d56-af2b-1f6a48b1d788','9426a453-933d-49a6-82cf-c5d2accce685','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','CijMSBzzGjqngA==','call_end',1,NULL,'AES-256-GCM','sqpGlaHmNVrnQapLi+8oEg==',NULL,NULL,0,0,NULL,'2026-02-03 01:44:09','2026-02-03 01:44:09','YaIOtrjQ+ODqgAJbf9swhA=='),('0752cc97-65d6-4eac-b573-e1d996134057','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:49:15','2026-01-31 18:49:15',NULL),('0ea5fd31-fed2-11f0-bfeb-7aa901ed8140','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Test call again',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:24:19','2026-01-31 18:24:19',NULL),('102817dd-ac27-449c-8544-583168f929c8','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:58:51','2026-01-31 18:58:51',NULL),('106a0313-4ad8-401c-aff1-63fc29fde0a2','9426a453-933d-49a6-82cf-c5d2accce685','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','hMo=','text',1,NULL,'AES-256-GCM','ULRtBDP1AYaTlurTeKpASw==',NULL,NULL,0,0,NULL,'2026-02-03 01:40:36','2026-02-03 01:40:36','h2EP+K31QcOTZI1oeGlOzw=='),('11c3f8b1-9f6c-4587-8fc1-b44563158491','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:49:25','2026-01-31 18:49:25',NULL),('1aea68fb-33b9-4286-811d-8b71e6a73c88','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:49:25','2026-01-31 18:49:25',NULL),('1c102b84-1a94-4e83-9010-895335a6b29f','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:29:40','2026-01-31 18:29:40',NULL),('28f00f7d-daee-4dde-987d-c35617859cca','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:48:48','2026-01-31 18:48:48',NULL),('2fa09c11-625b-4142-9f8e-f2ec8a88609f','9426a453-933d-49a6-82cf-c5d2accce685','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','[Secure Message]','+0c=','text',1,NULL,'AES-256-GCM','rq7+hWbILwITysFAil/bsg==',NULL,NULL,0,0,NULL,'2026-02-03 01:40:30','2026-02-03 01:40:30','aotFOYFqJtWwt/fja0SgQw=='),('411bf2d7-a4a2-45e1-aa0c-ddb5ef657810','9426a453-933d-49a6-82cf-c5d2accce685','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','[Secure Message]','XWh9lN6GuZEb3mZxlg==','call_accept',1,NULL,'AES-256-GCM','6JqNiuHHlv2LX1xwQH2DVw==',NULL,NULL,0,0,NULL,'2026-02-03 01:41:15','2026-02-03 01:41:15','gBxEBn9Z3XsE/Vq23ZqBYQ=='),('42fa45d6-36f3-43ec-878b-b328b7eaeb85','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:28:18','2026-01-31 18:28:18',NULL),('4677cc93-954d-4918-a810-3365858110b1','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','D5Aj','text',1,NULL,'AES-256-GCM','ax/BwvvCI74Xr0PJpGV3Sg==',NULL,'a6dca7d8-0938-4106-b1d9-4ec17e462f66',0,0,NULL,'2026-01-31 19:44:18','2026-01-31 19:44:18','Uc7Ilc9tFnZOmLl8QJQLMQ=='),('54552a9f-2226-4345-a897-0e3ea6d13d57','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling video...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:51:46','2026-01-31 18:51:46',NULL),('69810308-4527-490d-a7f7-df2f391c40c8','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','bạn đang làm gì v',NULL,'text',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-30 21:58:07','2026-01-30 21:58:07',NULL),('6cc7ecaa-6862-47af-ad7b-b88b6cbe0100','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:56:30','2026-01-31 18:56:30',NULL),('76f37e3d-2af9-4890-bb55-09e24bfd9b1f','9426a453-933d-49a6-82cf-c5d2accce685','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','PrY605ASpvoQuI0r576Jeg==','call_init',1,NULL,'AES-256-GCM','Tc6B4eAMN4C9QPQJqEI/eQ==',NULL,NULL,0,0,NULL,'2026-02-03 01:41:11','2026-02-03 01:41:11','M48zswXFzULRjWmlmMerVw=='),('7f5e3735-6eb5-4ac1-954d-094d3f353108','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','📎 Shared a file: photo_1769882577144.jpg',NULL,'file',0,NULL,'AES-256-GCM',NULL,'759d415b-906a-4fc5-bfc2-67ac6d696c65',NULL,0,0,NULL,'2026-01-31 18:02:57','2026-01-31 18:02:57',NULL),('82ddef91-ff44-43aa-a5f8-32e6abb25837','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:27:00','2026-01-31 18:27:00',NULL),('8a1fb778-cebb-4593-8b18-c09a72426863','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:49:15','2026-01-31 18:49:15',NULL),('91836c49-e9b6-4453-a3bf-6393b722fcb0','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:56:26','2026-01-31 18:56:26',NULL),('94d859d2-c702-4c76-8ed5-854249eef475','9426a453-933d-49a6-82cf-c5d2accce685','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','7m9kZ7roEcT0sA==','call_end',1,NULL,'AES-256-GCM','AIBb9bKbxcEy26W37h8qxA==',NULL,NULL,0,0,NULL,'2026-02-03 01:41:30','2026-02-03 01:41:30','CjeI4IHenkHdiHijEK+w+g=='),('99d8ddcd-6f34-44b9-84d8-e1a3cd95ddb8','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling video...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 19:00:14','2026-01-31 19:00:14',NULL),('a52161a4-15e5-40a7-8203-08dae0a3ede8','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:30:35','2026-01-31 18:30:35',NULL),('a6dca7d8-0938-4106-b1d9-4ec17e462f66','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Call accepted',NULL,'call_accept',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 19:00:19','2026-01-31 19:00:19',NULL),('a90ff576-00ce-44d0-866e-c12846f472d6','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:52:07','2026-01-31 18:52:07',NULL),('accf55ab-c30e-42aa-a28a-60a10967311e','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Call accepted',NULL,'call_accept',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:56:16','2026-01-31 18:56:16',NULL),('ad343aaa-2fc8-4fbf-ac46-c23ef94c22f9','9426a453-933d-49a6-82cf-c5d2accce685','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','UyG9hVut8Vcg77/Z5w==','call_accept',1,NULL,'AES-256-GCM','elaXTDDzlgJNAvgDOoExvw==',NULL,NULL,0,0,NULL,'2026-02-03 01:43:52','2026-02-03 01:43:52','AhisBnNRlNyqFJjCdoAcTQ=='),('ae155ac0-1713-4251-b444-3e7eaecda4a2','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:52:02','2026-01-31 18:52:02',NULL),('b370f156-0a58-4adb-8f68-155a421e1cb3','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','hi',NULL,'text',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-30 21:38:37','2026-01-30 21:38:37',NULL),('ba143bb9-38c1-422e-af27-840f7b2f4185','9426a453-933d-49a6-82cf-c5d2accce685','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','zVuWNOW6KKOFZldPr6PAwH4issNVXthcTZ9KYxEA5JM=','file',1,NULL,'AES-256-GCM','z0PhaMgffvnoWVD/mjfAUg==','e546b381-a3e0-4335-a402-fde379d2d1cf',NULL,0,0,NULL,'2026-02-03 01:40:54','2026-02-03 01:40:54','GnwHNdDNpuftkttnpcQFJQ=='),('bd9aee80-17dc-4fd3-9660-acc2166d87d8','9426a453-933d-49a6-82cf-c5d2accce685','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','[Secure Message]','UB8s/TGOaVofLdZUuVZjfA==','call_init',1,NULL,'AES-256-GCM','iUiAt9qBgnTJ10Nt/DQjcA==',NULL,NULL,0,0,NULL,'2026-02-03 01:43:04','2026-02-03 01:43:04','hbZFAC1jSgZ+QvY9U69rXw=='),('c1dc6f74-48b0-4b97-860c-fe4eb1c6d392','9426a453-933d-49a6-82cf-c5d2accce685','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','[Secure Message]','FjQl+SgY1lzzBkcgw5NxEA==','call_init',1,NULL,'AES-256-GCM','2g0BqVy7ZAQxLOaUQGGnDQ==',NULL,NULL,0,0,NULL,'2026-02-03 01:43:13','2026-02-03 01:43:13','U162KmW9fLloqdFZKfoLZQ=='),('c1fc0a47-c086-4e53-a417-293151b8e91a','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Call ended',NULL,'call_end',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:52:03','2026-01-31 18:52:03',NULL),('c5a340fd-1e5a-4a6d-8bb0-8ca4865ebba9','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:40:34','2026-01-31 18:40:34',NULL),('cb4311fb-441c-45cf-a50b-fc0890a99f6b','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:27:00','2026-01-31 18:27:00',NULL),('d9537489-26c4-425d-933f-94ebec60d21e','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','hi',NULL,'text',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-30 21:57:46','2026-01-30 21:57:46',NULL),('dcc77b7a-f4f8-41ae-a20f-c1b737dfbae3','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:29:40','2026-01-31 18:29:40',NULL),('e230eff8-2fe8-4ddb-ae3c-c40381a5b1ac','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:58:36','2026-01-31 18:58:36',NULL),('e70b4b76-a37c-4d74-9561-27652121e810','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling video...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:51:46','2026-01-31 18:51:46',NULL),('ea307723-2bb3-4f9e-8995-8ca9e2b261fd','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','📎 Shared a file: deepseek_mermaid_20260110_8e8bff.png',NULL,'file',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-30 22:43:38','2026-01-30 22:43:38',NULL),('ee20c214-1cbd-403e-9324-5311a247bdf4','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Tôi chuẩn bị đi ngủ',NULL,'text',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-30 21:59:00','2026-01-30 21:59:00',NULL),('eedd119e-1261-4817-8603-612cb52520f8','698a3610-a7ea-4272-bf94-83c48307bfdb','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','📎 Shared a file: deepseek_mermaid_20260110_054f37.png',NULL,'file',0,NULL,'AES-256-GCM',NULL,'6bb364cf-d557-4338-a00c-c6ca9e20984b',NULL,0,0,NULL,'2026-01-30 23:08:15','2026-01-30 23:08:15',NULL),('f3b1e595-5395-4113-b4ce-a5b1c6db467c','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:56:10','2026-01-31 18:56:10',NULL),('f556975e-d811-4a1c-809a-b7d56a8f9ed7','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Calling voice...',NULL,'call_init',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:28:15','2026-01-31 18:28:15',NULL),('faceeb78-dd56-44d2-a8a9-34ef267a005e','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','Call accepted',NULL,'call_accept',0,NULL,'AES-256-GCM',NULL,NULL,NULL,0,0,NULL,'2026-01-31 18:58:41','2026-01-31 18:58:41',NULL),('ff8b63bf-144c-4f3d-a8d7-3d43977eea9e','698a3610-a7ea-4272-bf94-83c48307bfdb','58d7d64d-bec7-4073-9496-ebfe55f7133d','[Secure Message]','weiu3dCmtVHd3aBlLg==','text',1,NULL,'AES-256-GCM','6u7MqzrKtjvlstvPr0tSrA==',NULL,NULL,0,0,NULL,'2026-01-31 19:44:09','2026-01-31 19:44:09','ZnId28GSD/LgLg5RRk6tLg==');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mfa_settings`
--

DROP TABLE IF EXISTS `mfa_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mfa_settings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `totp_enabled` tinyint(1) DEFAULT '0',
  `totp_secret` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `totp_backup_codes` json DEFAULT NULL,
  `totp_verified_at` timestamp NULL DEFAULT NULL,
  `sms_mfa_enabled` tinyint(1) DEFAULT '0',
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sms_verified_at` timestamp NULL DEFAULT NULL,
  `email_mfa_enabled` tinyint(1) DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `recovery_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_mfa_used` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mfa_failed_attempts` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mfa_settings`
--

LOCK TABLES `mfa_settings` WRITE;
/*!40000 ALTER TABLE `mfa_settings` DISABLE KEYS */;
INSERT INTO `mfa_settings` VALUES ('8bbe1e06-f5f8-11f0-8cdd-c610ecc0ee0f','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',1,'JBSWY3DPEHPK3PXP',NULL,'2026-01-28 19:40:43',0,NULL,NULL,0,NULL,NULL,NULL,0,'2026-01-20 12:07:09','2026-01-28 19:40:43'),('f4fb2c1f-0728-4596-bcfa-f71a9b56bdf4','58d7d64d-bec7-4073-9496-ebfe55f7133d',1,'YPVSYZ5RBQXQ2BYURLWVWHS4A2B72NF7',NULL,'2026-01-30 21:04:09',0,NULL,NULL,0,NULL,NULL,NULL,0,'2026-01-30 21:04:09','2026-01-30 21:04:09'),('fc7a0c53-13d8-4aba-b4d3-a7b17658b20c','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',1,'MVGU36Q4DCSQDMIIYTQCHT7TCEWXML66',NULL,'2026-01-30 16:47:31',0,NULL,NULL,0,NULL,NULL,NULL,0,'2026-01-20 12:07:21','2026-01-30 16:47:36');
/*!40000 ALTER TABLE `mfa_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL,
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requires_acknowledgment` tinyint(1) DEFAULT '0',
  `is_read` tinyint(1) DEFAULT '0',
  `is_archived` tinyint(1) DEFAULT '0',
  `expires_at` timestamp NULL DEFAULT NULL,
  `action_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_label` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `resource` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `min_role_level` int DEFAULT '10',
  `min_security_level` tinyint DEFAULT '1',
  `requires_mfa` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pinned_messages`
--

DROP TABLE IF EXISTS `pinned_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pinned_messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pinned_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pinned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `message_id` (`message_id`),
  KEY `pinned_by` (`pinned_by`),
  CONSTRAINT `pinned_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pinned_messages_ibfk_2` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pinned_messages_ibfk_3` FOREIGN KEY (`pinned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pinned_messages`
--

LOCK TABLES `pinned_messages` WRITE;
/*!40000 ALTER TABLE `pinned_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `pinned_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `team_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `security_level` tinyint DEFAULT '2',
  `is_confidential` tinyint(1) DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'planned',
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_project_security` CHECK ((`security_level` between 1 and 5)),
  CONSTRAINT `chk_project_status` CHECK ((`status` in (_utf8mb4'planned',_utf8mb4'active',_utf8mb4'paused',_utf8mb4'completed',_utf8mb4'cancelled')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rate_limits`
--

DROP TABLE IF EXISTS `rate_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rate_limits` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `identifier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bucket_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_count` int DEFAULT '0',
  `limit_value` int NOT NULL,
  `time_window` int NOT NULL,
  `is_blocked` tinyint(1) DEFAULT '0',
  `block_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blocked_until` timestamp NULL DEFAULT NULL,
  `first_request_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_request_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_limits`
--

LOCK TABLES `rate_limits` WRITE;
/*!40000 ALTER TABLE `rate_limits` DISABLE KEYS */;
/*!40000 ALTER TABLE `rate_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conditions` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system_role` tinyint(1) DEFAULT '1',
  `security_level_required` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('0f0d0d83-fd3e-11f0-810f-8ec749747c71','Admin',100,'System Administrator with full access',1,1,'2026-01-29 18:12:23'),('0f0d1232-fd3e-11f0-810f-8ec749747c71','Manager',50,'Manager with department access',1,1,'2026-01-29 18:12:23'),('0f0d1396-fd3e-11f0-810f-8ec749747c71','User',10,'Regular staff with basic access',1,1,'2026-01-29 18:12:23');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_alerts`
--

DROP TABLE IF EXISTS `security_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_alerts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `alert_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `affected_users` json DEFAULT NULL,
  `affected_resources` json DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `acknowledged_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `resolved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_alert_severity` CHECK ((`severity` in (_utf8mb4'LOW',_utf8mb4'MEDIUM',_utf8mb4'HIGH',_utf8mb4'CRITICAL'))),
  CONSTRAINT `chk_alert_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'ACKNOWLEDGED',_utf8mb4'RESOLVED',_utf8mb4'FALSE_POSITIVE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_alerts`
--

LOCK TABLES `security_alerts` WRITE;
/*!40000 ALTER TABLE `security_alerts` DISABLE KEYS */;
INSERT INTO `security_alerts` VALUES ('142b8495-fc85-11f0-b5ef-d2677b92d0a4','UNAUTHORIZED_ACCESS','CRITICAL','Unauthorized Admin Access','Multiple failed attempts to access admin console from unusual IP.',NULL,NULL,'ACTIVE',NULL,NULL,NULL,NULL,'2026-01-28 19:08:14','2026-01-28 20:08:14',NULL),('142b8af7-fc85-11f0-b5ef-d2677b92d0a4','BRUTE_FORCE','HIGH','Brute Force Attempt','Detected high frequency of login failures for user admin.',NULL,NULL,'ACTIVE',NULL,NULL,NULL,NULL,'2026-01-28 15:08:14','2026-01-28 20:08:14',NULL),('142b8d09-fc85-11f0-b5ef-d2677b92d0a4','SUSPICIOUS_IP','MEDIUM','Suspicious IP Detected','IP address 45.22.11.90 flagged for previous malicious activity.',NULL,NULL,'ACTIVE',NULL,NULL,NULL,NULL,'2026-01-27 20:08:14','2026-01-28 20:08:14',NULL),('142b8d86-fc85-11f0-b5ef-d2677b92d0a4','MFA_BYPASS_ATTEMPT','HIGH','MFA Bypass Attempt','Detected attempt to bypass MFA verification for high-privilege account.',NULL,NULL,'ACTIVE',NULL,NULL,NULL,NULL,'2026-01-26 20:08:14','2026-01-28 20:08:14',NULL),('142b8df1-fc85-11f0-b5ef-d2677b92d0a4','DATA_EXFILTRATION','LOW','Large Data Export','User nguyen-van-a exported a large amount of document metadata.',NULL,NULL,'ACTIVE',NULL,NULL,NULL,NULL,'2026-01-25 20:08:14','2026-01-28 20:08:14',NULL);
/*!40000 ALTER TABLE `security_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_events`
--

DROP TABLE IF EXISTS `security_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `device_fingerprint` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT (json_object()),
  `detected_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detection_rules` json DEFAULT NULL,
  `is_investigated` tinyint(1) DEFAULT '0',
  `investigation_notes` text COLLATE utf8mb4_unicode_ci,
  `investigation_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `investigation_at` timestamp NULL DEFAULT NULL,
  `resolution` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_resolution` CHECK ((`resolution` in (_utf8mb4'false_positive',_utf8mb4'confirmed',_utf8mb4'resolved',_utf8mb4'ignored'))),
  CONSTRAINT `chk_severity` CHECK ((`severity` in (_utf8mb4'LOW',_utf8mb4'MEDIUM',_utf8mb4'HIGH',_utf8mb4'CRITICAL')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_events`
--

LOCK TABLES `security_events` WRITE;
/*!40000 ALTER TABLE `security_events` DISABLE KEYS */;
INSERT INTO `security_events` VALUES ('00a040de-38a0-4fb4-a3e8-9e0d17db5492','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:51:09'),('019a1ef8-d1ad-4548-bbc9-ed77269a6d80','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:23:14'),('02707ac3-61d8-4f17-8a48-188651d66723','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:10:44'),('02f7ccf9-7b60-468e-b456-6bfa4cd14c2f','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:42:20'),('0475395d-51a4-4816-a736-9b9f3a564e42','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:52:33'),('055257f3-faa9-4a9f-8b8a-cdef20a03d4a','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 16:11:20'),('08258518-8904-419f-a313-c1c7cda1e69f','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:08:46'),('092d962e-3690-4811-b9de-9ab26c64f2c6','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 16:42:02'),('0bbde856-4163-434a-826e-99efeaaee9ad','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-31 20:15:25'),('0be03d54-09ea-4acb-a730-e46943465e68','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 16:46:14'),('0e698338-f6bf-4be6-9da6-311b5e1bf7c2','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:50:29'),('10eac723-e5d4-49b6-a6ab-abd9751a4f9c','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:59:29'),('111a93df-cee3-42fe-bc2b-d30618a7e9ac','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 02:51:12'),('11ae8040-dda9-46f0-a5f9-9f86d29a0652','MFA_VERIFY_SUCCESS','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-31 18:02:06'),('11cd0844-925b-4f91-9432-c0fb9ecd19e4','MFA_VERIFY_FAILURE','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:32:04'),('13c91654-d7c1-41e2-b84d-cde1c2600be3','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 2}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:19:20'),('14e3ca58-7402-40e6-9a55-b340bc8fe5c8','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:22:05'),('182e5145-2ceb-4cd2-8667-423ffb349f5c','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:51:34'),('1abbce53-c40a-4057-bf8b-43ecd946fb82','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:36:12'),('1c7d26c1-fa94-44b2-8f3c-a3a1f0c63ff4','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:54:00'),('20c8368a-6395-48f7-a8b9-4b2dfd16d3df','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-31 17:26:38'),('20e0ad06-3b38-428c-b43f-b8566b12ac06','MFA_VERIFY_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification failed for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:36:42'),('250c4aa2-08d3-490c-aa14-c88464f575c3','MFA_STEP_REQUIRED','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:39:55'),('2820f646-904a-4709-b8ad-fb9a62de7df3','MFA_STEP_REQUIRED','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-31 18:01:55'),('2c527579-137f-472c-a9f5-01d37ea68090','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 00:26:50'),('2ebea42f-0d9c-481a-8111-09d4ce6dc347','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (admin@sybersecure.local)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:48:58'),('35d6b9d2-17ab-4518-90f2-bb7d46dd80ef','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:21:55'),('373919cf-204f-46db-8263-7b43178abdc1','MFA_STEP_REQUIRED','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:31:52'),('393b7a7c-a474-42a4-83d8-3b56a6de5faf','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:11:35'),('3a672655-0e16-42e0-a863-dee9fa497fbb','MFA_VERIFY_FAILURE','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:53:11'),('3a9437d5-0f96-4b48-a165-691f74541d79','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 16:11:33'),('3b31de6c-0a93-4313-8eb1-9f1d22e13372','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@company.con)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 17:57:58'),('3b6f250d-9658-4376-9b2f-55d5a5b0c6c1','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:15:09'),('3ba1ba01-cd69-437e-9ef5-145b774031cc','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:00:40'),('3d54213a-1676-42aa-b95a-71864263fc9e','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:20:20'),('3da96cf3-3106-4339-90fb-aa236b407a55','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 18:18:57'),('45b025b8-a543-4a16-b7a5-909f571394fb','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:40:28'),('4839dd33-e927-4574-94f1-2a84ab8cacbb','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-31 18:01:51'),('48817e28-8cc2-48c4-9ca7-db9172eecd05','MFA_VERIFY_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification failed for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:26:09'),('4e482e14-353d-46ce-a0f5-9ba16b3098ac','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:51:38'),('51a19507-30a6-4f4d-ae03-376049ee287f','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:50:16'),('529bd7ec-5cb0-4b34-95f2-d5611ea7fe17','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 15:54:18'),('5359f744-f611-465d-b71f-e3e783f92378','MFA_VERIFY_SUCCESS','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:05:38'),('5695cf07-4b50-4a99-9390-650d7ed0a711','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 17:56:46'),('5748b8e1-d7b5-4d8b-8bdd-a56d14aaa65b','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 10:50:35'),('599548d1-9428-435d-b735-8410e429e9d4','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:01:13'),('5bd820b8-5fa1-43b0-9a5f-1fed09d2545c','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:50:17'),('5d3112a9-ecd6-489b-9f0a-befea36680a5','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:50:18'),('5eacbc89-0422-488f-bd8c-163b06bb2042','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 18:15:34'),('605856af-e7ce-46dd-8e90-9d6cdd2b113c','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:33:48'),('691a2b6b-aad7-4419-bbd7-2d1f575115f4','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:42:15'),('6b7dc6ea-ede3-41de-8e68-2c30352e9651','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:11:47'),('6b9bfe52-ea13-49a1-b2c2-a6771308fefe','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:16:13'),('6d340982-0233-4cd2-b024-90607b377ea3','MFA_VERIFY_SUCCESS','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:40:10'),('6d5ca4a0-1450-40c5-8e83-2ebad04f329f','MFA_VERIFY_FAILURE','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:52:37'),('70b3b293-e53f-4527-8140-e09b1ea2a3d3','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 08:50:02'),('70bfbe49-bf51-42dc-b613-1b4c23bc7411','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:21:46'),('72f82805-b09d-449e-a0b8-da8659952e6f','LOGIN_BLOCKED','MEDIUM','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:01:40'),('74a9ce6d-3f26-48b2-a373-50809723c8b1','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 2}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 18:19:25'),('74e48468-b999-4752-b346-27a89a14d0bd','MFA_VERIFY_FAILURE','MEDIUM','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification failed for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:40:42'),('75452c6e-24f7-4d6c-a2ca-e61a6d224c11','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:07:42'),('76ecdadf-1947-4113-8807-319770bca315','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:17:27'),('787f393c-d5bc-4dda-bd6e-246aa3da6727','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 02:51:28'),('7b80ad52-6112-44b1-94f1-0fea2f11c6c0','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:20:09'),('7bb79386-909e-443e-9f91-9a064f4f73e3','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:49:30'),('7c2f9bb3-0d6b-4a65-82b7-1c18c6ce1fef','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-31 17:26:20'),('7c383623-26b1-4441-ab3f-7167436511aa','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:51:42'),('7dd8e9a7-cd7a-4f4e-8e68-500a70eeaef7','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 20:12:09'),('7f7a581e-ea10-44a5-b91a-1cdc44edfb61','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:50:18'),('80da2493-f97f-43d9-bc7c-e445db0fb884','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (admin@sebersecure.local)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:48:39'),('80f58966-7f7c-4f21-8bef-1e04a75c3941','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:12:31'),('813c61c3-6f83-491b-a5e4-d8fcdf71cc29','LOGIN_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'User logged in successfully: nguyen.van.a@company.com','{\"roles\": []}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 18:08:41'),('82e57b22-969a-40bb-ba0e-0c06e09903e1','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:53:26'),('83122ee0-9f8c-42ed-acfc-ae0db20f9e95','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 18:05:59'),('8469fc96-5bf4-40e4-8c44-87edb6b5ccc2','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:22:02'),('85309014-2058-4daf-919c-2aa8ae3cc151','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:48:31'),('8594bbae-7558-4e52-ab8d-e0ef84222ddc','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:50:31'),('870e4ebc-93d9-47cd-8979-f56365cd74e8','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 16:46:58'),('88635204-b6c8-457e-84f3-97d328bed675','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (admmin)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:15:58'),('893ae8cc-11da-4557-9d95-dcfa48137ae2','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 18:31:39'),('8adb84de-45e4-4dd3-8ea6-b600373750b1','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 18:31:28'),('8ce78544-93e0-4ab0-b94c-c822dc7cd8a8','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 20:59:43'),('8ed5fa08-a506-4ee4-b701-c984dab011da','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:50:30'),('8fdc5acd-2f66-42f9-8efd-2165d5bf86b2','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 18:09:50'),('942b5405-f00a-4755-b910-3902e1cf5b84','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 20:11:58'),('97320d45-8694-4d71-a6b0-8956bcdc9f63','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:18:27'),('976b46f1-fc1e-4458-8f8d-876de9e1a2d3','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 18:07:28'),('988ea830-1b2a-4b2c-be5d-d0faf8e61ec8','MFA_STEP_REQUIRED','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:52:19'),('99aaf795-84dd-4b03-be47-f038c02d26e9','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:07:52'),('9c340b33-cabb-44a1-b740-d7796d5f0b22','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 16:54:09'),('a04adf74-d094-43b4-8d4c-c995a5d4fa97','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 18:15:28'),('a06c56c4-e10b-48d1-b4cc-d78040cac1f2','MFA_STEP_REQUIRED','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.b@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:05:29'),('a334c278-6f8f-434c-a362-6ce78216e2f8','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 17:58:28'),('a6a06795-58e7-4c0f-8daa-3567c4b774e4','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 17:58:07'),('a6e3dcf0-c18e-424d-b70c-906f781ed10f','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:38:51'),('a7780b9e-4b2d-4bf9-b053-ecf6b540fbdf','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:37:36'),('a78887a3-ee21-4bef-91d4-9e39ad8670e8','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 08:46:50'),('a7cdd32c-a093-47cb-bd16-ecf87c4bcb1a','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:23:36'),('ab85beb7-f990-40d9-a381-3af48507b7fb','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:43:20'),('ad17d51a-a247-475d-8c7f-2e896b281eca','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 16:46:50'),('ad5ba0cb-45ac-43e6-8682-37ce24347589','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 18:19:34'),('adcc968c-0e2d-444d-8bce-2e16f7f8a346','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:26:32'),('aff30a9f-bf3b-4d3f-a8a8-bd2988e23bbb','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:58:20'),('b2604702-d195-4adf-940c-e139392a17d7','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 18:59:10'),('b39dbbf6-87ca-4a46-a63f-d3f6e9cdb426','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:26:24'),('b4acdad9-589f-401b-a2ae-85de6561ca45','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:31:02'),('b591e5d0-e335-4c39-98f4-921174a2a909','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 08:48:19'),('b5d90f3d-2226-4d2c-b721-5bf45987b59a','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:48:40'),('b8000b85-5dcc-4de4-9f58-81d5c8b6e077','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 15:56:10'),('baebd0bf-fb43-442a-8639-94e2f4075df7','MFA_VERIFY_FAILURE','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:52:52'),('bbf517bc-d416-442b-a602-cd0ee5f904a0','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:06:57'),('bdcd3cf4-2a17-4b1c-b701-70530d270381','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@commpany.com)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:06:28'),('be413bce-81ce-4b76-a165-233e8f02c8c8','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:42:00'),('c227812d-09c5-4901-8756-55f346110ef7','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:50:40'),('c23eaa1f-5173-4a44-be63-843047cb9a58','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@company.con)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 17:58:02'),('c33ba383-8c8f-4f70-901a-9afd1f23ca67','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:48:07'),('c635917b-6de3-4e8c-8e88-e714ab86c947','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:00:51'),('c6f64aad-0e13-4f69-a9d0-ab34d2e5a27a','MFA_VERIFY_SUCCESS','LOW','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:32:22'),('c8f4ba2c-b9fc-4716-ade8-f134949cf60f','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 16:53:55'),('cc3eb794-a42e-45fb-86f4-826f25351afc','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:43:08'),('cf3dc143-48e4-470d-8963-462b135da8a2','MFA_VERIFY_FAILURE','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'MFA verification failed for user: nguyen.van.b@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:52:29'),('d0782e7f-c45f-4bb5-9ffa-6b070235ae78','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:44:50'),('d088db5a-dd12-4243-8441-5ad300177476','LOGIN_BLOCKED','MEDIUM','58d7d64d-bec7-4073-9496-ebfe55f7133d',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:51:13'),('d265e92f-136e-4e0d-a595-ac1878520476','MFA_VERIFY_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification failed for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:29:06'),('d2c280f4-305f-4887-967e-6231ab4d17f8','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:21:33'),('d4f6194c-6a56-4426-818b-b00584f5d493','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 18:03:40'),('d55decfb-1ace-4810-8832-e33f3b8ef43b','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:54:13'),('d5985836-0c46-49c7-acdd-147815c82006','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:25:31'),('d6fc09e4-833a-467a-9631-7ce5e11371ce','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:40:53'),('d8664fa8-22ee-4068-a37f-bdb1c5d20c91','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@commpany.com)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:06:30'),('db62469e-b47b-4e3a-8b03-393020b8dd5c','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-31 18:02:13'),('dbef4c3e-ecaa-454c-888a-9384dc8c2985','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:28:48'),('dd1699ad-a5c5-406d-82de-5ce08b097ac8','LOGIN_BLOCKED','MEDIUM','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'Login blocked: User status is banned','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:01:50'),('de41e952-c2b1-4619-888a-42327640bd13','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 09:59:33'),('e0dfeceb-be47-45be-843a-4002049e0fc0','MFA_VERIFY_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification failed for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:34:06'),('e223217d-a2cb-427d-bb13-28db2e7c67c3','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (nguyen.van.a@company.con)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 17:57:38'),('e263ad1c-bc5f-4b0d-a571-2b142c9fa2b8','MFA_VERIFY_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification successful for user: admin@cybersecure.local','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 16:42:51'),('e30513f3-c90c-4763-868b-f3014737e018','LOGIN_FAILURE','MEDIUM','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'Invalid password attempt for admin@cybersecure.local','{\"attempts\": 1}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 09:34:14'),('e44fe6ed-c2a2-4fd0-b588-44426da63701','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:06:50'),('e89c8b69-0826-4c38-af44-0ae522685ab5','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:19:37'),('e99e31b4-710c-494a-a137-f4c52775ce71','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-28 19:41:56'),('ea74d54d-8246-4b50-9f7e-09addba47774','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 00:26:39'),('eac20de5-95ae-4bd8-9bd1-c173b2c5ac9f','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (admmin)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:15:54'),('ec8f7364-9ea1-43b1-bb7e-b04563a7352d','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:22:49'),('effda720-0482-4942-8b40-fe1c86f33fd9','MFA_VERIFY_SUCCESS','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification successful for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:02:13'),('f87925aa-6d3a-4d6a-9841-8071e5a9b8b2','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 19:02:00'),('f8ee9a95-009a-4373-928d-3ea08d0c1914','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:41:52'),('f98fef30-2c32-435e-bc3a-f62b68272dfb','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:39:33'),('fa5506b4-2122-4e4e-80ac-8c4381346ba1','LOGIN_SUCCESS','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'User logged in successfully: admin@cybersecure.local','{\"roles\": [\"System Admin\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:54:18'),('fab8baae-6020-4b10-bb2a-26652798fd9c','MFA_VERIFY_FAILURE','MEDIUM','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification failed for user: nguyen.van.a@company.com','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-30 21:40:46'),('fd0e213a-2433-442c-a80f-82f1a9c57b09','MFA_STEP_REQUIRED','LOW','55cbbda7-c2a5-4347-ab79-cd4eec1206ba',NULL,NULL,NULL,'MFA verification step required for user: nguyen.van.a@company.com','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 01:38:36'),('ff09e085-a31a-431e-969f-dea0293b846f','MFA_STEP_REQUIRED','LOW','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f',NULL,NULL,NULL,'MFA verification step required for user: admin@cybersecure.local','{\"methods\": [\"totp\"]}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:16:03'),('ffdcef7d-9576-4f7b-8d3c-f54ce1dd9511','LOGIN_FAILURE','MEDIUM',NULL,NULL,NULL,NULL,'Login attempt failed: User not found (admmin)','{}',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-29 17:15:58');
/*!40000 ALTER TABLE `security_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_metrics`
--

DROP TABLE IF EXISTS `security_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_metrics` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `metric_date` date NOT NULL,
  `metric_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_count` int DEFAULT '0',
  `success_count` int DEFAULT '0',
  `failure_count` int DEFAULT '0',
  `breakdown` json DEFAULT (json_object()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_metrics`
--

LOCK TABLES `security_metrics` WRITE;
/*!40000 ALTER TABLE `security_metrics` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_policies`
--

DROP TABLE IF EXISTS `security_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_policies` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `policy_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `config` json NOT NULL DEFAULT (json_object()),
  `is_active` tinyint(1) DEFAULT '1',
  `applies_to` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'all',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_applies_to` CHECK ((`applies_to` in (_utf8mb4'all',_utf8mb4'role',_utf8mb4'department',_utf8mb4'team',_utf8mb4'user'))),
  CONSTRAINT `chk_policy_type` CHECK ((`policy_type` in (_utf8mb4'password',_utf8mb4'session',_utf8mb4'mfa',_utf8mb4'encryption',_utf8mb4'access')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_policies`
--

LOCK TABLES `security_policies` WRITE;
/*!40000 ALTER TABLE `security_policies` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensitive_operations_log`
--

DROP TABLE IF EXISTS `sensitive_operations_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensitive_operations_log` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `operation_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `target_entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_entity_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `justification` text COLLATE utf8mb4_unicode_ci,
  `approval_required` tinyint(1) DEFAULT '1',
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `operation_result` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_operation_result` CHECK ((`operation_result` in (_utf8mb4'success',_utf8mb4'failed',_utf8mb4'denied',_utf8mb4'pending'))),
  CONSTRAINT `chk_operation_type` CHECK ((`operation_type` in (_utf8mb4'decrypt',_utf8mb4'privilege_change',_utf8mb4'security_override',_utf8mb4'data_export')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensitive_operations_log`
--

LOCK TABLES `sensitive_operations_log` WRITE;
/*!40000 ALTER TABLE `sensitive_operations_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `sensitive_operations_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `level` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `component` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `stack_trace` text COLLATE utf8mb4_unicode_ci,
  `request_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_log_level` CHECK ((`level` in (_utf8mb4'DEBUG',_utf8mb4'INFO',_utf8mb4'WARN',_utf8mb4'ERROR',_utf8mb4'FATAL')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `project_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `assignee_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reporter_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'todo',
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `is_confidential` tinyint(1) DEFAULT '0',
  `due_date` date DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_task_status` CHECK ((`status` in (_utf8mb4'todo',_utf8mb4'in_progress',_utf8mb4'review',_utf8mb4'done',_utf8mb4'blocked')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `role_in_team` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `security_clearance` tinyint NOT NULL DEFAULT '2',
  `left_date` date DEFAULT NULL,
  `added_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requires_security_training` tinyint NOT NULL DEFAULT '0',
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `left_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `joined_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `training_completed_at` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_member_security` CHECK ((`security_clearance` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `department_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_security_level` tinyint NOT NULL DEFAULT '2',
  `requires_mfa` tinyint NOT NULL DEFAULT '1',
  `encryption_required` tinyint NOT NULL DEFAULT '1',
  `max_members` int NOT NULL DEFAULT '50',
  `storage_quota_mb` int NOT NULL DEFAULT '1024',
  `file_size_limit_mb` int NOT NULL DEFAULT '100',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `is_public` tinyint NOT NULL DEFAULT '0',
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `manager_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_team_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_7bf0cfd599b5e34fa917a78d28` (`code`),
  CONSTRAINT `chk_max_members` CHECK (((`max_members` > 0) and (`max_members` <= 1000))),
  CONSTRAINT `chk_team_security_level` CHECK ((`default_security_level` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_ur_role` (`role_id`),
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','0f0d0d83-fd3e-11f0-810f-8ec749747c71'),('7c0b04c5-fd38-11f0-855c-62043121f87a','0f0d1232-fd3e-11f0-810f-8ec749747c71'),('55cbbda7-c2a5-4347-ab79-cd4eec1206ba','0f0d1396-fd3e-11f0-810f-8ec749747c71'),('58d7d64d-bec7-4073-9496-ebfe55f7133d','0f0d1396-fd3e-11f0-810f-8ec749747c71'),('7c0b070f-fd38-11f0-855c-62043121f87a','0f0d1396-fd3e-11f0-810f-8ec749747c71');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_fingerprint` text COLLATE utf8mb4_unicode_ci,
  `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser_fingerprint` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_code` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_vpn` tinyint(1) DEFAULT '0',
  `is_trusted` tinyint(1) DEFAULT '0',
  `requires_mfa` tinyint(1) DEFAULT '1',
  `risk_score` int DEFAULT '0',
  `risk_factors` json DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_accessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revoked_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES ('019d8174-de9f-4ed9-b50b-78c2663898c5','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3NzAwODI3MzEsImV4cCI6MTc3MDE2OTEzMX0.y1mtKkeQFfNY3wilU_We7gZdvZO-MSTnkK7I7zA2D_4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-02-03 01:38:51','2026-02-03 01:47:16','2026-02-04 01:38:52',NULL,NULL,NULL),('0332b96f-a7d4-4d56-beb6-981cf30098e5','58d7d64d-bec7-4073-9496-ebfe55f7133d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGQ3ZDY0ZC1iZWM3LTQwNzMtOTQ5Ni1lYmZlNTVmNzEzM2QiLCJlbWFpbCI6Im5ndXllbi52YW4uYkBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoidmFuYiIsImVtcGxveWVlSWQiOiJTQUwtNDY0OSIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3NzAwODI4MTAsImV4cCI6MTc3MDE2OTIxMH0.FCWhcmOR4Y4xtR4O0CgOPbPhuvjLuouUsHtZCZZKtd4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-02-03 01:40:10','2026-02-03 01:48:39','2026-02-04 01:40:10',NULL,NULL,NULL),('0d8d08c5-b231-425f-981c-2bffcf678e90','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDM5MjksImV4cCI6MTc2OTg5MDMyOX0.9ScN2ZZMTcgBBTfFI4PEr9x_e0q_VQFcZYSpOFsFiq0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 20:12:09','2026-01-30 20:43:19','2026-01-31 20:12:09',NULL,NULL,NULL),('1d8f7c98-7503-4609-84bd-8923c00cc709','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MTAwNTMsImV4cCI6MTc2OTg5NjQ1M30.czUds3v494PSPoGAaWccQUqI4dk8VVE6ErRRktBCOSE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 21:54:13','2026-01-30 23:11:01','2026-01-31 21:54:13',NULL,NULL,NULL),('278c04e3-057c-450c-9a4e-00284d912bf8','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4ODAzOTgsImV4cCI6MTc2OTk2Njc5OH0.67V2k2K_TseUDtF8D9LJxryyKLzmxN2AZHxU7WuNnws',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-31 17:26:38','2026-01-31 17:31:52','2026-02-01 17:26:38',NULL,NULL,NULL),('3d3f39d0-b4c9-4bb3-9192-7582cecb15ac','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc3MDA4MzQ2OSwiZXhwIjoxNzcwMTY5ODY5fQ.y8O1ldR_793FoYjy09zo6k7KbTvRrZTtmYCJOCXmR-Q',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-02-03 01:51:09','2026-02-03 01:51:09','2026-02-04 01:51:09',NULL,NULL,NULL),('408dfa0a-fc88-11f0-b5ef-d2677b92d0a4','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','token1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'192.168.1.10',NULL,NULL,0,0,1,0,NULL,'2026-01-28 20:30:57','2026-01-28 20:30:57','2026-01-29 20:30:57',NULL,NULL,NULL),('408dfd94-fc88-11f0-b5ef-d2677b92d0a4','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','token2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'10.0.0.5',NULL,NULL,0,0,1,0,NULL,'2026-01-28 20:30:57','2026-01-28 20:30:57','2026-01-29 20:30:57',NULL,NULL,NULL),('408dff78-fc88-11f0-b5ef-d2677b92d0a4','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','token3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'172.16.0.1',NULL,NULL,0,0,1,0,NULL,'2026-01-28 20:30:57','2026-01-28 20:30:57','2026-01-29 20:30:57',NULL,NULL,NULL),('409e2f9a-5552-4937-9444-655122c7f3c8','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDAzMDcsImV4cCI6MTc2OTg4NjcwN30.IQHH4m359nlCvpZi38RTnk3BEnn3op-5qbrjh659DvE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 19:11:47','2026-01-30 19:11:47','2026-01-31 19:11:47','2026-01-30 19:11:54','User logout',NULL),('42899bd1-a38c-427f-b4a0-642664d7ba2e','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4ODI1MzMsImV4cCI6MTc2OTk2ODkzM30.btNfU-WRTGtrcqRE6CalqKmGVaiwuke_W1c6930fpgQ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-31 18:02:13','2026-01-31 20:14:56','2026-02-01 18:02:14',NULL,NULL,NULL),('5c2c8033-a64c-4093-a3dd-170623276a8e','58d7d64d-bec7-4073-9496-ebfe55f7133d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGQ3ZDY0ZC1iZWM3LTQwNzMtOTQ5Ni1lYmZlNTVmNzEzM2QiLCJlbWFpbCI6Im5ndXllbi52YW4uYkBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoidmFuYiIsImVtcGxveWVlSWQiOiJTQUwtNDY0OSIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDcxMzgsImV4cCI6MTc2OTg5MzUzOH0.B6lPr69S_60vpS_tGhUlupguxkuEa0Jq6kCQFNplnzI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 21:05:38','2026-01-30 21:39:36','2026-01-31 21:05:39',NULL,NULL,NULL),('5ec0cb59-fb60-4e05-815d-e351db0df006','58d7d64d-bec7-4073-9496-ebfe55f7133d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGQ3ZDY0ZC1iZWM3LTQwNzMtOTQ5Ni1lYmZlNTVmNzEzM2QiLCJlbWFpbCI6Im5ndXllbi52YW4uYkBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoidmFuYiIsImVtcGxveWVlSWQiOiJTQUwtNDY0OSIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDg3NDIsImV4cCI6MTc2OTg5NTE0Mn0.Qh1JaLRRjSOfZzcLzro-c-aoh59d03VTicVDt-PflEU',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 21:32:22','2026-01-30 23:14:06','2026-01-31 21:32:23',NULL,NULL,NULL),('6f7e534f-a4e7-4110-aa8f-b2bd05be1b9c','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDA5MDYsImV4cCI6MTc2OTg4NzMwNn0.brXuwzzEgPNDgvPXm8SLWp_884j9eDwOBRHNu1yPlUw',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 19:21:46','2026-01-30 19:21:46','2026-01-31 19:21:46',NULL,NULL,NULL),('76ca3dc2-cbe4-4bf8-8532-1e9ec9bbe9db','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc2OTgwMDc3NywiZXhwIjoxNzY5ODg3MTc3fQ.YWkPLM4aslJL0OciXr4okwj208vWh4gnn2dZpo0ydoo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-01-30 19:19:37','2026-01-30 19:46:06','2026-01-31 19:19:37','2026-01-30 20:11:28','User logout',NULL),('85950c53-6ba4-4cb3-9abc-1ac6b42b02aa','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc3MDA4MzM3MCwiZXhwIjoxNzcwMTY5NzcwfQ.YnqRZbarozXtwwlPW_mkcNuTIMuEzOnm6_0ZTjIdkRU',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-02-03 01:49:30','2026-02-03 01:49:30','2026-02-04 01:49:31',NULL,NULL,NULL),('9b143546-b0c8-45a6-944c-1b11667d30f4','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc2OTgwODY2MiwiZXhwIjoxNzY5ODk1MDYyfQ.01hyDaMkmfSyl0UbKS95MQogFihESGWk5a_-OFkUvzo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-01-30 21:31:02','2026-01-30 21:31:02','2026-01-31 21:31:02','2026-01-30 21:31:25','User logout',NULL),('a39b059d-682b-44f0-a758-c0ef51ddf903','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDkyNTMsImV4cCI6MTc2OTg5NTY1M30.ArRr5sO7Y3-D6c2EBtfNRjOPcj8Jbl6Fe3GA1mMfC-A',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 21:40:53','2026-01-30 21:40:53','2026-01-31 21:40:53',NULL,NULL,NULL),('a536ae38-7595-447a-a428-8d3c7cbee565','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDk3MjAsImV4cCI6MTc2OTg5NjEyMH0.f8822s6chQKnOBzkYVJxTaI4i12YOXuaT_A4pE8XiCw',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 21:48:40','2026-01-30 21:48:40','2026-01-31 21:48:41',NULL,NULL,NULL),('ad71f253-1115-458b-9906-7346dd3b1d13','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk3OTc4OTksImV4cCI6MTc2OTg4NDI5OX0.Dj6gEYl3vNksT5q9gWqS3tVMnuQ4n1s9BByYGEF410E',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 18:31:39','2026-01-30 18:31:39','2026-01-31 18:31:40',NULL,NULL,NULL),('af8af37e-a158-4df1-80cf-e1c5112a135b','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDA4MjAsImV4cCI6MTc2OTg4NzIyMH0.Yp6kyYs1vq_gyncBbi8NLKRCHfzyZ9hJVw3f3PI5WwE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 19:20:20','2026-01-30 19:20:20','2026-01-31 19:20:21','2026-01-30 19:20:50','User logout',NULL),('b56ffff7-3be8-4f0d-8c77-98bb5239e09f','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc2OTgwNjc4MywiZXhwIjoxNzY5ODkzMTgzfQ.vFwxiPkE5sMuqgJbVL9nkXmnEr_qgLRDS876mvPotx4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-01-30 20:59:43','2026-01-30 21:06:03','2026-01-31 20:59:44','2026-01-30 21:06:06','User logout',NULL),('bd2e3ff6-b321-43a7-be21-a5170d8d6bb5','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc3MDA4MzAwMCwiZXhwIjoxNzcwMTY5NDAwfQ.KjX2dWQxbPwfNaFso_NCKPwNWiisdlr0MQq5gRfN6Po',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-02-03 01:43:20','2026-02-03 01:52:46','2026-02-04 01:43:21','2026-02-03 01:53:05','User logout',NULL),('bee6a6b5-272f-4fd0-887d-09723a3f368c','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk3OTk3MzMsImV4cCI6MTc2OTg4NjEzM30.at1x-TDhsKkQ0FS2A2-lZHqN2Q5ezpSDM9xfFrtF5cQ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 19:02:13','2026-01-30 19:02:13','2026-01-31 19:02:13',NULL,NULL,NULL),('bfb90c62-fa3d-4d00-b444-3e4718bf3ec0','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk3OTk2NTEsImV4cCI6MTc2OTg4NjA1MX0.p-PDO9ICwGKo9OzBKot6lesqFaQE3QpiuRfCGkFoYxo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 19:00:51','2026-01-30 19:00:51','2026-01-31 19:00:51',NULL,NULL,NULL),('bfe08910-adbb-4a6f-8b6d-1d3ac1784102','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDkzMjAsImV4cCI6MTc2OTg5NTcyMH0.25_2AI3jk2SDM_McdnZ9wK2I3UyaunPVi3mtZFwsTX4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 21:42:00','2026-01-30 21:44:25','2026-01-31 21:42:01',NULL,NULL,NULL),('cb6dd5fe-a256-4a81-97b1-281f7e296814','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc2OTc5OTU1MCwiZXhwIjoxNzY5ODg1OTUwfQ.S5JUFbM2kxcXx8wiTVaAg_hwJgvYP9Ieg0MAQhPLGFM',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-01-30 18:59:10','2026-01-30 18:59:10','2026-01-31 18:59:10',NULL,NULL,NULL),('d5a9d78a-3af1-4cab-aed8-911381a2bf93','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc3MDA4MzQ5OCwiZXhwIjoxNzcwMTY5ODk4fQ.ougYPrmtxbUwyep9fiXFHSY3AjbQC_lfrfO4FYuRfUA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-02-03 01:51:38','2026-02-03 01:51:38','2026-02-04 01:51:38',NULL,NULL,NULL),('d778cf5e-272a-4785-9acd-d7e714cc9499','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc2OTgwMDI0NCwiZXhwIjoxNzY5ODg2NjQ0fQ.hscH17V8mKOXulEZRHp_MmA_DJrsLAbHcT7Qpo_TJAM',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-01-30 19:10:44','2026-01-30 19:10:44','2026-01-31 19:10:44',NULL,NULL,NULL),('dbf4abc3-a24e-40cf-b9be-28c76e64133d','8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmJkYTA0Mi1mNWY4LTExZjAtOGNkZC1jNjEwZWNjMGVlMGYiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2VjdXJlLmxvY2FsIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsInNlY3VyaXR5TGV2ZWwiOjUsIm1mYVJlcXVpcmVkIjpmYWxzZSwibWZhVmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc2OTg5MDUyNSwiZXhwIjoxNzY5OTc2OTI1fQ.kEA-xB4DsToIGBfmCFCic4lQTKkPUYNBXvHXgQ-Zb0o',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,0,0,NULL,'2026-01-31 20:15:25','2026-01-31 20:21:02','2026-02-01 20:15:25',NULL,NULL,NULL),('e95784a1-13a1-4117-858c-a5d552cbfe35','58d7d64d-bec7-4073-9496-ebfe55f7133d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGQ3ZDY0ZC1iZWM3LTQwNzMtOTQ5Ni1lYmZlNTVmNzEzM2QiLCJlbWFpbCI6Im5ndXllbi52YW4uYkBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoidmFuYiIsImVtcGxveWVlSWQiOiJTQUwtNDY0OSIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4ODI1MjYsImV4cCI6MTc2OTk2ODkyNn0.6XTeMROWD1Zq3uT-XSk6X8wZ6jzIvVOQ_I6vByNdG0c',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-31 18:02:06','2026-01-31 19:58:54','2026-02-01 18:02:06',NULL,NULL,NULL),('f3e7909a-94dd-42d3-88c4-fd43e5c080e0','55cbbda7-c2a5-4347-ab79-cd4eec1206ba','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWNiYmRhNy1jMmE1LTQzNDctYWI3OS1jZDRlZWMxMjA2YmEiLCJlbWFpbCI6Im5ndXllbi52YW4uYUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoibmd1eWVudmFuYSIsImVtcGxveWVlSWQiOiJFTVAwMDEyMyIsInNlY3VyaXR5TGV2ZWwiOjEsIm1mYVJlcXVpcmVkIjp0cnVlLCJtZmFWZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiVXNlciJdLCJpYXQiOjE3Njk4MDcyNzIsImV4cCI6MTc2OTg5MzY3Mn0.8iTmPyUwfkUhLo-NtAOjFn41eYL0ZNmZoUj9ZGLD-c4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0.0.0.0',NULL,NULL,0,1,1,0,NULL,'2026-01-30 21:07:52','2026-01-30 21:21:52','2026-01-31 21:07:53',NULL,NULL,NULL);
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `manager_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_team_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mfa_required` tinyint(1) DEFAULT '1',
  `last_password_change` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `account_locked_until` timestamp NULL DEFAULT NULL,
  `lock_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `security_clearance_level` tinyint DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `is_email_verified` tinyint(1) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `last_failed_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','active','banned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_security_level` CHECK ((`security_clearance_level` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('55cbbda7-c2a5-4347-ab79-cd4eec1206ba','nguyenvana','nguyen.van.a@company.com','$2b$10$XXb8Dx7.xpYr9VftjaDc7ua2AewZIUIoPK6R6ff3aKuvSd7NwoNj2','Nguyễn','Văn A','+84123456789',NULL,'EMP00123','Software Engineer','IT',NULL,NULL,NULL,1,'2026-01-20 12:07:21',NULL,NULL,1,1,0,0,'2026-02-03 01:38:37',0,NULL,'2026-01-20 12:07:21','2026-02-03 01:38:36',NULL,'active'),('58d7d64d-bec7-4073-9496-ebfe55f7133d','vanb','nguyen.van.b@company.com','$2b$10$z5bHe/b91zFZ7au8dxQ7X..P/DWtRgTPAcNBGK1QMOaCEphUVkDhe','Nguyen','B','845023424222','','SAL-4649','Sale ','SALES',NULL,NULL,NULL,1,'2026-01-30 21:04:09',NULL,NULL,1,0,0,1,'2026-02-03 01:39:55',0,NULL,'2026-01-30 21:04:09','2026-02-03 01:49:55',NULL,'banned'),('7c0b04c5-fd38-11f0-855c-62043121f87a','manager1','manager@company.com','$2b$10$abcdefghijklmnopqrstuv','Manager','One',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-01-29 17:32:28',NULL,NULL,1,0,0,1,NULL,0,NULL,'2026-01-29 17:32:28','2026-01-30 21:09:54','2026-01-30 08:08:57','active'),('7c0b070f-fd38-11f0-855c-62043121f87a','pending_user','pending@test.com','$2b$10$abcdefghijklmnopqrstuv','Pending','User',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-01-29 17:32:28',NULL,NULL,1,0,0,1,NULL,0,NULL,'2026-01-29 17:32:28','2026-01-30 21:09:54','2026-01-30 07:42:57','active'),('7c0b08e3-fd38-11f0-855c-62043121f87a','banned_user','banned@test.com','$2b$10$abcdefghijklmnopqrstuv','Banned','User',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-01-29 17:32:28',NULL,NULL,1,0,0,1,NULL,0,NULL,'2026-01-29 17:32:28','2026-01-30 21:09:54','2026-01-30 08:09:05','active'),('8bbda042-f5f8-11f0-8cdd-c610ecc0ee0f','admin','admin@cybersecure.local','$2b$12$Rxk7m1HFRhz55f1AGdT9v.Zlap4q5.dPl4JvYNUfcT8eKVDUv0Ae.','System','Administrator',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-01-20 12:07:09',NULL,NULL,5,1,1,0,'2026-02-03 01:51:38',0,'2026-02-03 01:51:34','2026-01-20 12:07:09','2026-02-03 01:51:38',NULL,'active');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'cybersecure_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:07
