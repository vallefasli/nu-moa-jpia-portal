-- Add poster_url and banner_url to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the storage bucket
-- Allow public read access to the bucket
CREATE POLICY "Event Posters Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'event-posters');

-- Allow admins and officers to upload/update/delete
CREATE POLICY "Event Posters Admin Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'event-posters' AND 
  auth.uid() IN (
    SELECT id FROM public.users WHERE role IN ('admin', 'officer')
  )
);

CREATE POLICY "Event Posters Admin Update" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'event-posters' AND 
  auth.uid() IN (
    SELECT id FROM public.users WHERE role IN ('admin', 'officer')
  )
);

CREATE POLICY "Event Posters Admin Delete" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'event-posters' AND 
  auth.uid() IN (
    SELECT id FROM public.users WHERE role IN ('admin', 'officer')
  )
);
