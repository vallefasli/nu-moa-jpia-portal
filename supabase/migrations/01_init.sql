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

-- Events Table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
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
    new.raw_user_meta_data->>'full_name',
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
  v_attendance_count INT;
  v_type attendance_type;
BEGIN
  -- 1. Find user by QR token
  SELECT id, account_status INTO v_user_id, v_user_status
  FROM public.users
  WHERE qr_token = p_qr_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid QR Code');
  END IF;

  -- 2. Check if user is active
  IF v_user_status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'User account is ' || v_user_status);
  END IF;

  -- 3. Determine attendance type (time_in or time_out)
  SELECT COUNT(*) INTO v_attendance_count
  FROM public.attendance
  WHERE event_id = p_event_id AND user_id = v_user_id;

  IF v_attendance_count % 2 = 0 THEN
    v_type := 'time_in';
  ELSE
    v_type := 'time_out';
  END IF;

  -- 4. Record attendance
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
