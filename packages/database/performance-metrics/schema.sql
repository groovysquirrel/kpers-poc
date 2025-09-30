-- Performance Metrics table schema
CREATE TABLE IF NOT EXISTS `performance_metrics` (
  `id` VARCHAR(64) NOT NULL,
  `manager_id` VARCHAR(64) NOT NULL,
  `metric_year` INT NOT NULL,
  `return_rate` DECIMAL(10,4) NULL,
  `market_value` BIGINT NULL,
  `as_of_date` DATE NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_performance_manager` (`manager_id`),
  INDEX `idx_performance_year` (`metric_year`),
  INDEX `idx_performance_date` (`as_of_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

