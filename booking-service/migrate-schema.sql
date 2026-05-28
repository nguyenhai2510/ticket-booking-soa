-- Migrate db_booking after Sprint 3 entity changes (safe for existing rows).
-- Run connected to db_booking (pgAdmin / psql), or:
--   cd booking-service && ./mvnw -q test-compile exec:java -Dexec.classpathScope=test -Dexec.mainClass=com.ticketbooking.booking_service.SchemaMigrationRunner

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_time timestamp;
UPDATE bookings SET booking_time = created_at WHERE booking_time IS NULL AND created_at IS NOT NULL;
UPDATE bookings SET booking_time = CURRENT_TIMESTAMP WHERE booking_time IS NULL;
ALTER TABLE bookings ALTER COLUMN booking_time SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bookings ALTER COLUMN booking_time SET NOT NULL;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount numeric(12, 2);
UPDATE bookings SET total_amount = 0 WHERE total_amount IS NULL;
ALTER TABLE bookings ALTER COLUMN total_amount SET NOT NULL;

-- Dev only: legacy rows used non-UUID user_id (e.g. "outcast-user-1"); clear before type change.
DELETE FROM booking_items;
DELETE FROM bookings;
ALTER TABLE bookings ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reserved_until timestamp;
UPDATE bookings
SET reserved_until = booking_time + interval '5 minutes'
WHERE status = 'RESERVED' AND reserved_until IS NULL AND booking_time IS NOT NULL;
