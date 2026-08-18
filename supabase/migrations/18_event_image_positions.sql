-- Add poster_position and banner_position to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS poster_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS banner_position TEXT DEFAULT 'center';
