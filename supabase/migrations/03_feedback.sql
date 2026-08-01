-- Feedback Table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'bug', 'attendance_dispute', 'feature_request', etc.
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL, -- 'open', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Members can insert their own feedback
CREATE POLICY "Members can submit feedback" 
  ON public.feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins and officers can read all feedback
CREATE POLICY "Admins and officers can view feedback"
  ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );

-- Admins and officers can update feedback status
CREATE POLICY "Admins and officers can update feedback"
  ON public.feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );
