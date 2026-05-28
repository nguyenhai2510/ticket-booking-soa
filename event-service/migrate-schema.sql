-- Migrate db_event after Sprint 3 entity changes (safe for existing rows).
-- Run connected to db_event (pgAdmin / psql), then restart event-service.

ALTER TABLE events ADD COLUMN IF NOT EXISTS version integer;
UPDATE events SET version = 0 WHERE version IS NULL;
ALTER TABLE events ALTER COLUMN version SET DEFAULT 0;
ALTER TABLE events ALTER COLUMN version SET NOT NULL;

ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS available_quantity integer;
UPDATE ticket_categories SET available_quantity = total_quantity WHERE available_quantity IS NULL;
ALTER TABLE ticket_categories ALTER COLUMN available_quantity SET NOT NULL;

ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS version integer;
UPDATE ticket_categories SET version = 0 WHERE version IS NULL;
ALTER TABLE ticket_categories ALTER COLUMN version SET DEFAULT 0;
ALTER TABLE ticket_categories ALTER COLUMN version SET NOT NULL;
