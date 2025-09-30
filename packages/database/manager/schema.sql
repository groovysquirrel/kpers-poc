-- Managers table schema
CREATE TABLE IF NOT EXISTS `managers` (
  `id` VARCHAR(64) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `status` ENUM('Active','Terminated','Probation') NOT NULL,
  `market_value` BIGINT NOT NULL,
  `as_of_date` DATE NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_managers_name` (`last_name`, `first_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


