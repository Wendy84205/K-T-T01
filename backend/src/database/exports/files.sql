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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03  1:58:01
