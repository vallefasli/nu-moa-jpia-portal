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
