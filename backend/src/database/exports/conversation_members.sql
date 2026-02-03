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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:00
