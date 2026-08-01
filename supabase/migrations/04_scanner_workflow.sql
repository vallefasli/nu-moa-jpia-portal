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
