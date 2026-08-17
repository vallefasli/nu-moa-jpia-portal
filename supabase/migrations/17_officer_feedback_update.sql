-- Allow admins and officers to update event_feedbacks (needed for distributing certificates)
CREATE POLICY "Admins and officers can update event feedback"
  ON public.event_feedbacks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );
