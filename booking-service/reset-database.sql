-- Reset db_booking schema after entity changes (run connected to db_booking)
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
