import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are placeholders or empty
export const isMockAuth = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl === 'your_supabase_url_here' || 
  supabaseAnonKey === 'your_supabase_anon_key_here';

if (isMockAuth) {
  console.warn(
    "LocalCart: Supabase credentials are not configured. Running in Mock Auth mode.\n" +
    "Sign in using:\n" +
    " - Admin: admin@localcart.com / password\n" +
    " - Customer: customer@localcart.com / password"
  );
}

export const supabase = isMockAuth 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);
