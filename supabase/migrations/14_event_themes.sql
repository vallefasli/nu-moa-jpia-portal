-- Add themes array column to events table to support multiple custom tags
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}';
