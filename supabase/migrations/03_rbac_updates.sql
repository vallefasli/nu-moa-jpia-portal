-- 1. Fix User Update Permissions
-- Drop the policy that allows users to arbitrarily update their own row
-- This prevents malicious role escalation or points inflation.
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- 2. Differentiate Admin vs Officer for Events
-- Drop the combined policy
DROP POLICY IF EXISTS "Admins and officers can manage events" ON public.events;

-- Create an Admin-only policy for event management (Officers can read via "Anyone can read events")
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );
