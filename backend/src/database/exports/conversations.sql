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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:00
