-- Phase 3 Schema Updates

-- Add points to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 NOT NULL;

-- Add event details to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS points_awarded INT DEFAULT 10 NOT NULL;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS capacity INT;
