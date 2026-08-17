-- Add certificate_template_url to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS certificate_template_url TEXT;

-- Create storage bucket for certificate templates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificate-templates', 'certificate-templates', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the new storage bucket
-- Enable RLS on objects if not already done (usually handled by Supabase globally, but we add policies here)
-- We need to create policies on storage.objects for the new bucket

-- Policy: Anyone can read certificate templates
CREATE POLICY "cert_templates_public_read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'certificate-templates' );

-- Policy: Authenticated users with admin/officer roles can insert/update/delete
CREATE POLICY "cert_templates_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificate-templates' AND
  (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'officer')))
);

CREATE POLICY "cert_templates_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certificate-templates' AND
  (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'officer')))
);

CREATE POLICY "cert_templates_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificate-templates' AND
  (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'officer')))
);
