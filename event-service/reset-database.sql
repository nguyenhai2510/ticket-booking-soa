-- -- Reset database script for event-service
-- -- Run this SQL in pgAdmin or DBeaver connected to db_event database

-- -- Drop all tables with CASCADE to remove foreign key constraints
-- DROP TABLE IF EXISTS ticket_categories CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;

-- -- Tables will be recreated automatically by Hibernate when the service starts
