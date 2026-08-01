-- Migration 05: Member ID Generation

-- 1. Add the column (nullable at first)
ALTER TABLE public.users ADD COLUMN member_id TEXT UNIQUE;

-- 2. Create the generator function
CREATE OR REPLACE FUNCTION generate_random_jpia_id()
RETURNS TEXT AS $$
DECLARE
  year_prefix TEXT;
  random_digits TEXT;
  new_id TEXT;
  is_unique BOOLEAN := false;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YY');
  
  WHILE NOT is_unique LOOP
    random_digits := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_id := 'JPIA-' || year_prefix || random_digits;
    
    PERFORM 1 FROM public.users WHERE member_id = new_id;
    IF NOT FOUND THEN
      is_unique := true;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Backfill existing users with a unique ID
UPDATE public.users SET member_id = generate_random_jpia_id() WHERE member_id IS NULL;

-- 4. Enforce NOT NULL constraint
ALTER TABLE public.users ALTER COLUMN member_id SET NOT NULL;

-- 5. Update the user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_member_id TEXT;
BEGIN
  new_member_id := generate_random_jpia_id();
  
  INSERT INTO public.users (id, email, full_name, student_no, member_id, program, year_level, committee)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'student_no',
    new_member_id,
    new.raw_user_meta_data->>'program',
    new.raw_user_meta_data->>'year_level',
    new.raw_user_meta_data->>'committee'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update the user_points_view to include member_id
DROP VIEW IF EXISTS public.user_points_view;

CREATE OR REPLACE VIEW public.user_points_view AS
WITH event_completions AS (
  SELECT 
    user_id,
    event_id
  FROM public.attendance
  GROUP BY user_id, event_id
  HAVING 
    COUNT(CASE WHEN type = 'time_in' THEN 1 END) > 0 AND
    COUNT(CASE WHEN type = 'time_out' THEN 1 END) > 0
)
SELECT 
  u.id AS user_id,
  u.full_name,
  u.student_no,
  u.member_id,
  u.program,
  u.year_level,
  u.account_status,
  COALESCE(SUM(e.points_awarded), 0) AS total_points,
  COUNT(ec.event_id) AS events_attended
FROM public.users u
LEFT JOIN event_completions ec ON u.id = ec.user_id
LEFT JOIN public.events e ON e.id = ec.event_id
GROUP BY u.id;

GRANT SELECT ON public.user_points_view TO authenticated;
GRANT SELECT ON public.user_points_view TO anon;
