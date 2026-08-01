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
