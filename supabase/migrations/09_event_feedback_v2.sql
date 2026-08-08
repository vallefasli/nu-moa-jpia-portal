-- Migration 09: Event Feedback v2 (Custom Questions and Certificate Links)

-- Add custom feedback questions and certificate link to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_feedback_questions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS certificate_link TEXT;

-- Add additional responses (for custom questions) to event_feedbacks
ALTER TABLE public.event_feedbacks ADD COLUMN IF NOT EXISTS additional_responses JSONB DEFAULT '{}'::jsonb;
