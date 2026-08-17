-- Add auto_certificate_enabled to events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS auto_certificate_enabled BOOLEAN DEFAULT false NOT NULL;

-- Revert previous certificate_template_url column if it exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='events' and column_name='certificate_template_url')
  THEN
      ALTER TABLE "public"."events" DROP COLUMN "certificate_template_url";
  END IF;
END $$;
