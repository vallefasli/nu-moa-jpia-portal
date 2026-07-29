const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data, error } = await supabase.from('events').insert([
    {
      title: 'General Assembly 2026',
      description: 'Annual gathering for all active members.',
      date: new Date().toISOString(),
      location: 'Main Auditorium',
      points_awarded: 10,
      status: 'ongoing'
    }
  ]);
  
  if (error) console.error(error);
  else console.log('Event seeded successfully!');
}

seed();
