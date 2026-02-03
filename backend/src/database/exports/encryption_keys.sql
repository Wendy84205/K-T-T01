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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:00
