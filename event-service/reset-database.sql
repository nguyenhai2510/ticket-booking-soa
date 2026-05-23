-- Reset db_event schema after entity changes (run in pgAdmin / psql connected to db_event)
DROP TABLE IF EXISTS ticket_categories CASCADE;
DROP TABLE IF EXISTS events CASCADE;
-- Tables are recreated on next event-service start (spring.jpa.hibernate.ddl-auto=update)
