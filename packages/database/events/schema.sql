CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) PRIMARY KEY,
  manager_id VARCHAR(36) NOT NULL,
  event_type_id VARCHAR(36) NOT NULL,
  event_date DATE NOT NULL,
  staff_attending TEXT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_manager_id (manager_id),
  INDEX idx_event_type_id (event_type_id),
  INDEX idx_event_date (event_date)
);

