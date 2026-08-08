-- Migration 08: Event Feedbacks Table

CREATE TABLE IF NOT EXISTS public.event_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- RLS
ALTER TABLE public.event_feedbacks ENABLE ROW LEVEL SECURITY;

-- Members can insert their own feedback
CREATE POLICY "Members can submit event feedback" 
  ON public.event_feedbacks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Members can read their own feedback
CREATE POLICY "Members can read own event feedback" 
  ON public.event_feedbacks 
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins and officers can read all feedback
CREATE POLICY "Admins and officers can view event feedback"
  ON public.event_feedbacks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );
