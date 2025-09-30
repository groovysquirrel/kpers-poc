-- Documents table schema
CREATE TABLE IF NOT EXISTS `documents` (
  `id` VARCHAR(64) NOT NULL,
  `event_id` VARCHAR(64) NULL,
  `document_type_id` VARCHAR(64) NOT NULL,
  `filename` VARCHAR(500) NOT NULL,
  `date` DATE NOT NULL,
  `url` VARCHAR(1000) NULL,
  `author` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_documents_event` (`event_id`),
  INDEX `idx_documents_type` (`document_type_id`),
  INDEX `idx_documents_date` (`date`),
  INDEX `idx_documents_author` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

