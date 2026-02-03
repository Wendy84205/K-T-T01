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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:02
