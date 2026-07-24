const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line && line.includes('=')) {
    const [key, val] = line.split('=');
    env[key.trim()] = val.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing select...');
  const { data, error } = await supabase.from('love_map_places').select('*').limit(1);
  if (error) {
    console.error('Select Error:', error.message, error.details, error.hint);
  } else {
    console.log('Select Success, data:', data);
  }

  console.log('Testing insert...');
  const { error: insertError } = await supabase.from('love_map_places').insert({
    name: 'test',
    address: 'test',
    lat: 0,
    lng: 0
  });
  if (insertError) {
    console.error('Insert Error:', insertError.message, insertError.details, insertError.hint);
  } else {
    console.log('Insert Success');
  }
}

test();
