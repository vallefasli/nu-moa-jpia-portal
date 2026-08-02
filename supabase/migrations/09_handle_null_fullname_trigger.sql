-- Update handle_new_user to safely handle missing full_name
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
