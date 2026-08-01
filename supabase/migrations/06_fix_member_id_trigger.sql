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
