require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey); // Try with service role if available? No, anon key is fine to test signup.

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: `test_${Date.now()}@national-u.edu.ph`,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test',
        student_no: `SN-${Date.now()}`,
        program: 'BSIT',
        year_level: '1',
        committee: 'None'
      }
    }
  });

  console.log('Error Object:', error);
}

testSignup();
