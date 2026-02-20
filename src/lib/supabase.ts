import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// specific check for placeholders or missing http
const supabaseUrl = (envUrl && envUrl.startsWith('http'))
    ? envUrl
    : 'https://placeholder.supabase.co';

const supabaseAnonKey = (envKey && envKey !== 'YOUR_SUPABASE_ANON_KEY_HERE')
    ? envKey
    : 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Using placeholder Supabase URL. Authentication will not work until keys are added to .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
