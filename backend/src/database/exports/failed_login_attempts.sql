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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:00
