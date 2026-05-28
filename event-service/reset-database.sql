-- Reset db_event schema after entity changes (run in pgAdmin / psql connected to db_event)
-- Prefer migrate-schema.sql if you want to keep existing event data.
DROP TABLE IF EXISTS ticket_categories CASCADE;
DROP TABLE IF EXISTS events CASCADE;
-- Tables are recreated on next event-service start (spring.jpa.hibernate.ddl-auto=update)
