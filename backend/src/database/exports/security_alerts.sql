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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:04
