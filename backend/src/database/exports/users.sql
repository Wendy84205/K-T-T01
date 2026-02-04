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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:06
