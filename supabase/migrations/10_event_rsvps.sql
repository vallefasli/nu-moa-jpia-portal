-- Create Event RSVPs Table
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user_id ON public.event_rsvps(user_id);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read event_rsvps" ON public.event_rsvps
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own RSVP" ON public.event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVP" ON public.event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins and officers can manage all RSVPs" ON public.event_rsvps
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'officer')
    )
  );
