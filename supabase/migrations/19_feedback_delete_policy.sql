-- Allow Admins and Officers to delete feedback
CREATE POLICY "Admins and officers can delete feedback"
  ON public.feedback
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );
