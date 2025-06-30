SET GLOBAL event_scheduler = ON;

-- Event to clean database from guests everyday
CREATE EVENT IF NOT EXISTS cleanup_old_guests
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
  DELETE FROM users
  WHERE is_guest = 1
    AND (last_login IS NULL OR DATE(last_login) < CURDATE());
    
SHOW EVENTS WHERE Name = 'cleanup_old_guests';