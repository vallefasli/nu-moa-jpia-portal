-- Enums
CREATE TYPE user_role AS ENUM ('member', 'officer', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'rejected');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed');
CREATE TYPE attendance_type AS ENUM ('time_in', 'time_out');

-- Users Table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  student_no TEXT UNIQUE NOT NULL,
  program TEXT NOT NULL,
  year_level TEXT NOT NULL,
  committee TEXT,
  account_status user_status DEFAULT 'pending' NOT NULL,
  role user_role DEFAULT 'member' NOT NULL,
  qr_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TYPE event_category AS ENUM ('Academic', 'Social', 'Community', 'General');

-- Events Table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_type event_category DEFAULT 'General' NOT NULL,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  points_awarded INT DEFAULT 0,
  capacity INT,
  status event_status DEFAULT 'upcoming' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Attendance Table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  officer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type attendance_type NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Certificates Table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE NOT NULL,
  template_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_users_qr_token ON public.users(qr_token);
CREATE INDEX idx_users_account_status ON public.users(account_status);
CREATE INDEX idx_attendance_event_user ON public.attendance(event_id, user_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Admins and officers can read all users" ON public.users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'officer')
    )
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Events
CREATE POLICY "Anyone can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins and officers can manage events" ON public.events
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'officer')
    )
  );

-- RLS Policies for Attendance
CREATE POLICY "Users can read own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins and officers can manage attendance" ON public.attendance
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'officer')
    )
  );

-- RLS Policies for Certificates
CREATE POLICY "Users can read own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins and officers can manage certificates" ON public.certificates
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'officer')
    )
  );

-- Trigger for new users from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, student_no, program, year_level, committee)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'System Account'),
    new.raw_user_meta_data->>'student_no',
    new.raw_user_meta_data->>'program',
    new.raw_user_meta_data->>'year_level',
    new.raw_user_meta_data->>'committee'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC Function for Optimistic Scanning
CREATE OR REPLACE FUNCTION public.process_optimistic_scan(
  p_event_id UUID,
  p_qr_token UUID,
  p_officer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_user_status user_status;
  v_last_type attendance_type;
  v_last_timestamp TIMESTAMPTZ;
  v_type attendance_type;
BEGIN
  -- 1. Find user by QR token (Lock the row to prevent concurrent race conditions!)
  SELECT id, account_status INTO v_user_id, v_user_status
  FROM public.users
  WHERE qr_token = p_qr_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid QR Code');
  END IF;

  -- 2. Check if user is active
  IF v_user_status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'User account is ' || v_user_status);
  END IF;

  -- 3. Get the most recent attendance record
  SELECT type, timestamp INTO v_last_type, v_last_timestamp
  FROM public.attendance
  WHERE event_id = p_event_id AND user_id = v_user_id
  ORDER BY timestamp DESC
  LIMIT 1;

  -- 4. Database-level Anti-Double Scan (5 second cooldown)
  IF v_last_timestamp IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - v_last_timestamp)) < 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already scanned. Please wait 5s.');
  END IF;

  -- 5. Determine new attendance type
  IF v_last_type IS NULL OR v_last_type = 'time_out' THEN
    v_type := 'time_in';
  ELSE
    v_type := 'time_out';
  END IF;

  -- 6. Record attendance
  INSERT INTO public.attendance (event_id, user_id, officer_id, type)
  VALUES (p_event_id, v_user_id, p_officer_id, v_type);

  -- 5. Return success
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'type', v_type,
    'message', 'Successfully recorded ' || v_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Phase 3 Schema Updates

-- Add points to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 NOT NULL;

-- Add event details to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS points_awarded INT DEFAULT 10 NOT NULL;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS capacity INT;


-- Optimizing process_optimistic_scan to return student details directly
-- and save a database roundtrip.
CREATE OR REPLACE FUNCTION public.process_optimistic_scan(
  p_event_id UUID,
  p_qr_token UUID,
  p_officer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_user_status user_status;
  v_user_name TEXT;
  v_student_no TEXT;
  v_last_type attendance_type;
  v_last_timestamp TIMESTAMPTZ;
  v_type attendance_type;
BEGIN
  -- 1. Find user by QR token (Lock the row to prevent concurrent race conditions!)
  SELECT id, account_status, full_name, student_no 
  INTO v_user_id, v_user_status, v_user_name, v_student_no
  FROM public.users
  WHERE qr_token = p_qr_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid QR Code');
  END IF;

  -- 2. Check if user is active
  IF v_user_status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'User account is ' || v_user_status);
  END IF;

  -- 3. Get the most recent attendance record
  SELECT type, timestamp INTO v_last_type, v_last_timestamp
  FROM public.attendance
  WHERE event_id = p_event_id AND user_id = v_user_id
  ORDER BY timestamp DESC
  LIMIT 1;

  -- 4. Database-level Anti-Double Scan (5 second cooldown)
  IF v_last_timestamp IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - v_last_timestamp)) < 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already scanned. Please wait 5s.');
  END IF;

  -- 5. Determine new attendance type
  IF v_last_type IS NULL OR v_last_type = 'time_out' THEN
    v_type := 'time_in';
  ELSE
    v_type := 'time_out';
  END IF;

  -- 6. Record attendance
  INSERT INTO public.attendance (event_id, user_id, officer_id, type)
  VALUES (p_event_id, v_user_id, p_officer_id, v_type);

  -- 7. Return success with full student details
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'type', v_type,
    'message', 'Successfully recorded ' || v_type,
    'student_name', v_user_name,
    'student_no', v_student_no
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


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


-- RPC to fetch student info for manual confirmation without logging attendance
CREATE OR REPLACE FUNCTION public.get_student_for_scan(
  p_event_id UUID,
  p_qr_token UUID,
  p_officer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_user_status user_status;
  v_user_name TEXT;
  v_student_no TEXT;
  v_last_type attendance_type;
  v_last_timestamp TIMESTAMPTZ;
  v_type attendance_type;
BEGIN
  -- 1. Find user by QR token
  SELECT id, account_status, full_name, student_no 
  INTO v_user_id, v_user_status, v_user_name, v_student_no
  FROM public.users
  WHERE qr_token = p_qr_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid QR Code');
  END IF;

  -- 2. Check if user is active
  IF v_user_status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'User account is ' || v_user_status);
  END IF;

  -- 3. Get the most recent attendance record
  SELECT type, timestamp INTO v_last_type, v_last_timestamp
  FROM public.attendance
  WHERE event_id = p_event_id AND user_id = v_user_id
  ORDER BY timestamp DESC
  LIMIT 1;

  -- 4. Check for double scan attempt
  IF v_last_timestamp IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - v_last_timestamp)) < 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already scanned. Please wait 5s.');
  END IF;

  -- 5. Determine new attendance type
  IF v_last_type IS NULL OR v_last_type = 'time_out' THEN
    v_type := 'time_in';
  ELSE
    v_type := 'time_out';
  END IF;

  -- 6. Return success with full student details, BUT DO NOT LOG ATTENDANCE YET
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'type', v_type,
    'student_name', v_user_name,
    'student_no', v_student_no
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to finalize the attendance after officer approval
CREATE OR REPLACE FUNCTION public.confirm_attendance(
  p_event_id UUID,
  p_user_id UUID,
  p_officer_id UUID,
  p_type attendance_type
) RETURNS JSONB AS $$
DECLARE
  v_last_timestamp TIMESTAMPTZ;
BEGIN
  -- Prevent race conditions and accidental double submissions
  SELECT timestamp INTO v_last_timestamp
  FROM public.attendance
  WHERE event_id = p_event_id AND user_id = p_user_id
  ORDER BY timestamp DESC
  LIMIT 1;

  IF v_last_timestamp IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - v_last_timestamp)) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duplicate request blocked.');
  END IF;

  INSERT INTO public.attendance (event_id, user_id, officer_id, type)
  VALUES (p_event_id, p_user_id, p_officer_id, p_type);

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- SQL Migration for Leaderboard and Points View (04_views.sql)

CREATE OR REPLACE VIEW public.user_points_view AS
WITH event_completions AS (
  -- Find all events where a user has BOTH a time_in and a time_out
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
  u.program,
  u.year_level,
  u.account_status,
  COALESCE(SUM(e.points_awarded), 0) AS total_points,
  COUNT(ec.event_id) AS events_attended
FROM public.users u
LEFT JOIN event_completions ec ON u.id = ec.user_id
LEFT JOIN public.events e ON e.id = ec.event_id
GROUP BY u.id;

-- Grant permissions for authenticated users to read the view
GRANT SELECT ON public.user_points_view TO authenticated;
GRANT SELECT ON public.user_points_view TO anon;


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


-- Migration 06: Fix Member ID Trigger Search Path

-- 1. Re-create generate_random_jpia_id with SET search_path
CREATE OR REPLACE FUNCTION public.generate_random_jpia_id()
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
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Re-create handle_new_user with SET search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_member_id TEXT;
BEGIN
  new_member_id := public.generate_random_jpia_id();
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Security check: Ensure the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- Delete the user from auth.users
  -- Because of the ON DELETE CASCADE on public.users, this completely wipes their profile too.
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Make student-specific details optional so Admins and Officers don't need them
ALTER TABLE public.users ALTER COLUMN student_no DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN program DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN year_level DROP NOT NULL;


-- Update handle_new_user to safely handle missing full_name AND preserve member_id generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_member_id TEXT;
BEGIN
  new_member_id := public.generate_random_jpia_id();
  
  INSERT INTO public.users (id, email, full_name, student_no, member_id, program, year_level, committee)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'System Account'),
    new.raw_user_meta_data->>'student_no',
    new_member_id,
    new.raw_user_meta_data->>'program',
    new.raw_user_meta_data->>'year_level',
    new.raw_user_meta_data->>'committee'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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


