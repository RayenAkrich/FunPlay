SET GLOBAL event_scheduler = ON;

-- Event to clean database from guests everyday
drop event cleanup_old_guests;
CREATE EVENT IF NOT EXISTS cleanup_old_guests
ON SCHEDULE EVERY 1 DAY
STARTS NOW() 
DO
  DELETE FROM users
  WHERE is_guest = 1
  AND created_at < NOW() - INTERVAL 1 DAY;

-- Clean up rooms and room_users older than 1 day (adjust interval as needed)
drop event clean_old_rooms;
DELIMITER //
CREATE EVENT IF NOT EXISTS clean_old_rooms
ON SCHEDULE EVERY 1 DAY
STARTS NOW() 
DO
BEGIN
    -- Delete users from room_users for old rooms
    DELETE ru FROM room_users ru
    JOIN rooms r ON ru.roomID = r.id
    WHERE r.created_at < NOW() - INTERVAL 1 DAY;
    -- Delete old rooms
    DELETE FROM rooms WHERE created_at < NOW() - INTERVAL 1 DAY;
END //
DELIMITER ;

SHOW EVENTS FROM funplay;
