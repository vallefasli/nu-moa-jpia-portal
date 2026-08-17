-- Change event_type from enum to text to allow custom categories
ALTER TABLE events ALTER COLUMN event_type TYPE TEXT USING event_type::text;
DROP TYPE IF EXISTS event_category;
