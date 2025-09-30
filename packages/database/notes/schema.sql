-- Notes table schema
CREATE TABLE IF NOT EXISTS `notes` (
  `id` VARCHAR(64) NOT NULL,
  `event_id` VARCHAR(64) NULL,
  `note_type_id` VARCHAR(64) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `content` TEXT NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `filename` VARCHAR(500) NULL,
  `date` DATE NOT NULL,
  `url` VARCHAR(1000) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notes_event` (`event_id`),
  INDEX `idx_notes_type` (`note_type_id`),
  INDEX `idx_notes_date` (`date`),
  INDEX `idx_notes_author` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

